import { Injectable } from "@nestjs/common";
import {
	ComplaintArticle,
	ComplaintFinding,
	ComplaintStatus,
	EmployeeStatus,
	Prisma,
	RewardEligibility,
} from "@prisma/client";
import { addYears, differenceInDays, differenceInYears } from "date-fns";
import { PrismaService } from "#api/database/prisma.service";
import { ApproachingMilestoneDto, CheckEligibilityResponseDto } from "../dto";

const INVESTIGATION_IN_PROGRESS_STATUSES: ComplaintStatus[] = [
	ComplaintStatus.UNDER_HR_REVIEW,
	ComplaintStatus.WAITING_FOR_REBUTTAL,
	ComplaintStatus.UNDER_HR_ANALYSIS,
	ComplaintStatus.AWAITING_SUPERIOR_DECISION,
	ComplaintStatus.WITH_DISCIPLINE_COMMITTEE,
	ComplaintStatus.COMMITTEE_WAITING_REBUTTAL,
	ComplaintStatus.COMMITTEE_ANALYSIS,
	ComplaintStatus.INVESTIGATION_COMPLETE,
	ComplaintStatus.FORWARDED_TO_HQ,
	ComplaintStatus.AWAITING_HQ_DECISION,
	ComplaintStatus.ON_APPEAL,
];

const POSTPONEMENT_YEARS = 2;

interface EmployeeForEligibility {
	id: string;
	employeeId: string;
	fullName: string;
	fullNameAm: string | null;
	employmentDate: Date;
	originalEmploymentDate: Date | null;
	isTransfer: boolean;
	centerId: string | null;
	center: {
		id: string;
		name: string;
	} | null;
}

interface ComplaintForEligibility {
	id: string;
	article: ComplaintArticle;
	status: ComplaintStatus;
	finding: ComplaintFinding;
}

@Injectable()
export class EligibilityCalculationService {
	constructor(private readonly prisma: PrismaService) {}

	getEffectiveEmploymentDate(employee: EmployeeForEligibility): Date {
		return employee.isTransfer && employee.originalEmploymentDate
			? new Date(employee.originalEmploymentDate)
			: new Date(employee.employmentDate);
	}

	calculateYearsOfService(employee: EmployeeForEligibility, asOfDate: Date = new Date()): number {
		const employmentDate = this.getEffectiveEmploymentDate(employee);
		return differenceInYears(asOfDate, employmentDate);
	}

	calculateExactYearsOfService(employee: EmployeeForEligibility, asOfDate: Date = new Date()): number {
		const employmentDate = this.getEffectiveEmploymentDate(employee);
		const totalDays = differenceInDays(asOfDate, employmentDate);
		return totalDays / 365.25;
	}

	getMilestoneDate(employee: EmployeeForEligibility, yearsOfService: number): Date {
		const employmentDate = this.getEffectiveEmploymentDate(employee);
		return addYears(employmentDate, yearsOfService);
	}

	async checkEligibility(
		tenantId: string,
		employeeId: string,
		milestoneId: string,
	): Promise<CheckEligibilityResponseDto> {
		const employee = await this.prisma.employee.findFirst({
			where: { id: employeeId, tenantId },
			select: {
				id: true,
				employeeId: true,
				fullName: true,
				fullNameAm: true,
				employmentDate: true,
				originalEmploymentDate: true,
				isTransfer: true,
				centerId: true,
				center: { select: { id: true, name: true } },
			},
		});

		if (!employee) {
			throw new Error("Employee not found");
		}

		const milestone = await this.prisma.rewardMilestone.findFirst({
			where: { id: milestoneId, tenantId, isActive: true },
		});

		if (!milestone) {
			throw new Error("Milestone not found or inactive");
		}

		const existingReward = await this.prisma.serviceReward.findFirst({
			where: { tenantId, employeeId, milestoneId },
		});

		const complaints = await this.getActiveComplaints(tenantId, employeeId);
		const eligibilityResult = this.determineEligibility(complaints);

		const effectiveEmploymentDate = this.getEffectiveEmploymentDate(employee);
		const calculatedYears = this.calculateExactYearsOfService(employee);
		const milestoneDate = this.getMilestoneDate(employee, milestone.yearsOfService);

		return {
			employeeId: employee.id,
			employeeCode: employee.employeeId,
			employeeName: employee.fullName,
			milestoneId: milestone.id,
			milestoneName: milestone.name,
			yearsOfService: milestone.yearsOfService,
			eligibilityStatus: eligibilityResult.status,
			reason: eligibilityResult.reason,
			postponedUntil: eligibilityResult.postponedUntil,
			employmentDate: effectiveEmploymentDate,
			calculatedYearsOfService: Math.round(calculatedYears * 100) / 100,
			milestoneDate,
			existingRewardRecord: !!existingReward,
			existingRewardId: existingReward?.id,
		};
	}

	private async getActiveComplaints(tenantId: string, employeeId: string): Promise<ComplaintForEligibility[]> {
		return this.prisma.complaint.findMany({
			where: {
				tenantId,
				accusedEmployeeId: employeeId,
				deletedAt: null,
				OR: [
					{ status: { in: INVESTIGATION_IN_PROGRESS_STATUSES } },
					{
						finding: { in: [ComplaintFinding.GUILTY, ComplaintFinding.GUILTY_NO_REBUTTAL] },
						status: { in: [ComplaintStatus.DECIDED, ComplaintStatus.DECIDED_BY_HQ, ComplaintStatus.CLOSED_FINAL] },
					},
				],
			},
			select: {
				id: true,
				article: true,
				status: true,
				finding: true,
			},
		});
	}

	private determineEligibility(complaints: ComplaintForEligibility[]): {
		status: RewardEligibility;
		reason?: string;
		postponedUntil?: Date;
	} {
		const decidedStatuses: ComplaintStatus[] = [
			ComplaintStatus.DECIDED,
			ComplaintStatus.DECIDED_BY_HQ,
			ComplaintStatus.CLOSED_FINAL,
		];
		const article31WithGuiltyFinding = complaints.find(
			(c) =>
				c.article === ComplaintArticle.ARTICLE_31 &&
				(c.finding === ComplaintFinding.GUILTY || c.finding === ComplaintFinding.GUILTY_NO_REBUTTAL) &&
				decidedStatuses.includes(c.status),
		);

		if (article31WithGuiltyFinding) {
			return {
				status: RewardEligibility.DISQUALIFIED_ARTICLE_31,
				reason: "Active Article 31 violation with guilty finding impacts reward eligibility",
			};
		}

		const ongoingInvestigation = complaints.find((c) => INVESTIGATION_IN_PROGRESS_STATUSES.includes(c.status));

		if (ongoingInvestigation) {
			const postponedUntil = addYears(new Date(), POSTPONEMENT_YEARS);
			return {
				status: RewardEligibility.POSTPONED_INVESTIGATION,
				reason: "Ongoing investigation requires resolution before reward can be granted",
				postponedUntil,
			};
		}

		const article30DecidedStatuses: ComplaintStatus[] = [ComplaintStatus.DECIDED, ComplaintStatus.CLOSED_FINAL];
		const article30WithGuiltyFinding = complaints.find(
			(c) =>
				c.article === ComplaintArticle.ARTICLE_30 &&
				(c.finding === ComplaintFinding.GUILTY || c.finding === ComplaintFinding.GUILTY_NO_REBUTTAL) &&
				article30DecidedStatuses.includes(c.status),
		);

		if (article30WithGuiltyFinding) {
			return {
				status: RewardEligibility.PENDING_REVIEW,
				reason: "Article 30 violation requires committee review to determine reward eligibility",
			};
		}

		return {
			status: RewardEligibility.ELIGIBLE,
		};
	}

	async getApproachingMilestones(
		tenantId: string,
		monthsAhead: number,
		centerId?: string,
		milestoneId?: string,
	): Promise<ApproachingMilestoneDto[]> {
		const milestones = await this.prisma.rewardMilestone.findMany({
			where: {
				tenantId,
				isActive: true,
				...(milestoneId ? { id: milestoneId } : {}),
			},
			orderBy: { yearsOfService: "asc" },
		});

		if (milestones.length === 0) {
			return [];
		}

		const employees = await this.prisma.employee.findMany({
			where: {
				tenantId,
				status: "ACTIVE",
				...(centerId ? { centerId } : {}),
			},
			select: {
				id: true,
				employeeId: true,
				fullName: true,
				fullNameAm: true,
				employmentDate: true,
				originalEmploymentDate: true,
				isTransfer: true,
				centerId: true,
				center: { select: { id: true, name: true } },
			},
		});

		const today = new Date();
		const futureDate = new Date(today);
		futureDate.setMonth(futureDate.getMonth() + monthsAhead);

		const approaching: ApproachingMilestoneDto[] = [];

		for (const employee of employees) {
			const effectiveEmploymentDate = this.getEffectiveEmploymentDate(employee);
			const currentYears = this.calculateExactYearsOfService(employee);

			for (const milestone of milestones) {
				const milestoneDate = this.getMilestoneDate(employee, milestone.yearsOfService);

				if (milestoneDate >= today && milestoneDate <= futureDate) {
					const existingReward = await this.prisma.serviceReward.findFirst({
						where: { tenantId, employeeId: employee.id, milestoneId: milestone.id },
						select: { id: true, status: true },
					});

					const daysUntil = differenceInDays(milestoneDate, today);

					approaching.push({
						employeeId: employee.id,
						employeeCode: employee.employeeId,
						employeeName: employee.fullName,
						employeeNameAm: employee.fullNameAm ?? undefined,
						centerId: employee.centerId ?? undefined,
						centerName: employee.center?.name,
						employmentDate: effectiveEmploymentDate,
						currentYearsOfService: Math.round(currentYears * 100) / 100,
						milestoneYears: milestone.yearsOfService,
						milestoneName: milestone.name,
						milestoneId: milestone.id,
						milestoneDate,
						daysUntilMilestone: daysUntil,
						eligibilityChecked: !!existingReward,
						existingRewardStatus: existingReward?.status,
					});
				}
			}
		}

		approaching.sort((a, b) => a.daysUntilMilestone - b.daysUntilMilestone);

		return approaching;
	}

	async getEligibilitySummary(tenantId: string): Promise<{
		totalApproaching: number;
		byMilestone: Record<number, number>;
		pendingChecks: number;
		awaitingApproval: number;
		readyForAward: number;
		awardedThisYear: number;
		postponed: number;
	}> {
		const approaching = await this.getApproachingMilestones(tenantId, 6);

		const byMilestone: Record<number, number> = {};
		for (const item of approaching) {
			byMilestone[item.milestoneYears] = (byMilestone[item.milestoneYears] || 0) + 1;
		}

		const currentYear = new Date().getFullYear();
		const startOfYear = new Date(currentYear, 0, 1);
		const endOfYear = new Date(currentYear, 11, 31);

		const [pendingChecks, awaitingApproval, readyForAward, awardedThisYear, postponed] = await Promise.all([
			this.prisma.serviceReward.count({
				where: { tenantId, status: "PENDING" },
			}),
			this.prisma.serviceReward.count({
				where: { tenantId, status: "AWAITING_APPROVAL" },
			}),
			this.prisma.serviceReward.count({
				where: { tenantId, status: "APPROVED" },
			}),
			this.prisma.serviceReward.count({
				where: {
					tenantId,
					status: "AWARDED",
					awardDate: { gte: startOfYear, lte: endOfYear },
				},
			}),
			this.prisma.serviceReward.count({
				where: { tenantId, status: "POSTPONED" },
			}),
		]);

		return {
			totalApproaching: approaching.length,
			byMilestone,
			pendingChecks,
			awaitingApproval,
			readyForAward,
			awardedThisYear,
			postponed,
		};
	}

	async batchCheckEligibility(
		tenantId: string,
		milestoneId: string,
		centerId?: string,
		employeeIds?: string[],
	): Promise<{
		totalChecked: number;
		eligible: number;
		disqualified: number;
		postponed: number;
		pendingReview: number;
		results: CheckEligibilityResponseDto[];
	}> {
		const milestone = await this.prisma.rewardMilestone.findFirst({
			where: { id: milestoneId, tenantId, isActive: true },
		});

		if (!milestone) {
			throw new Error("Milestone not found or inactive");
		}

		const whereClause: Prisma.EmployeeWhereInput = {
			tenantId,
			status: EmployeeStatus.ACTIVE,
		};

		if (centerId) {
			whereClause.centerId = centerId;
		}

		if (employeeIds && employeeIds.length > 0) {
			whereClause.id = { in: employeeIds };
		}

		const employees = await this.prisma.employee.findMany({
			where: whereClause,
			select: {
				id: true,
				employeeId: true,
				fullName: true,
				fullNameAm: true,
				employmentDate: true,
				originalEmploymentDate: true,
				isTransfer: true,
				centerId: true,
				center: { select: { id: true, name: true } },
			},
		});

		const results: CheckEligibilityResponseDto[] = [];
		let eligible = 0;
		let disqualified = 0;
		let postponed = 0;
		let pendingReview = 0;

		for (const employee of employees) {
			const yearsOfService = this.calculateYearsOfService(employee as EmployeeForEligibility);
			if (yearsOfService < milestone.yearsOfService) {
				continue;
			}

			const result = await this.checkEligibility(tenantId, employee.id, milestoneId);
			results.push(result);

			switch (result.eligibilityStatus) {
				case RewardEligibility.ELIGIBLE:
					eligible++;
					break;
				case RewardEligibility.DISQUALIFIED_ARTICLE_31:
					disqualified++;
					break;
				case RewardEligibility.POSTPONED_INVESTIGATION:
					postponed++;
					break;
				case RewardEligibility.PENDING_REVIEW:
					pendingReview++;
					break;
			}
		}

		return {
			totalChecked: results.length,
			eligible,
			disqualified,
			postponed,
			pendingReview,
			results,
		};
	}
}

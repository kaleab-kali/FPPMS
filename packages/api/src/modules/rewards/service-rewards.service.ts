import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, RewardEligibility, ServiceRewardStatus } from "@prisma/client";
import { calculateSkip, paginate } from "#api/common/utils/pagination.util";
import { PrismaService } from "#api/database/prisma.service";
import {
	ApproveRewardDto,
	CreateServiceRewardDto,
	RecordAwardDto,
	RejectRewardDto,
	ServiceRewardFilterDto,
	SubmitForApprovalDto,
} from "./dto";
import { EligibilityCalculationService } from "./services/eligibility-calculation.service";

const EMPLOYEE_SELECT = {
	id: true,
	employeeId: true,
	fullName: true,
	fullNameAm: true,
};

const MILESTONE_SELECT = {
	id: true,
	yearsOfService: true,
	name: true,
	nameAm: true,
	rewardType: true,
};

@Injectable()
export class ServiceRewardsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly eligibilityService: EligibilityCalculationService,
	) {}

	async create(tenantId: string, userId: string, dto: CreateServiceRewardDto) {
		const employee = await this.prisma.employee.findFirst({
			where: { id: dto.employeeId, tenantId },
		});

		if (!employee) {
			throw new NotFoundException("Employee not found");
		}

		const milestone = await this.prisma.rewardMilestone.findFirst({
			where: { id: dto.milestoneId, tenantId, isActive: true },
		});

		if (!milestone) {
			throw new NotFoundException("Milestone not found or inactive");
		}

		const existingReward = await this.prisma.serviceReward.findFirst({
			where: { tenantId, employeeId: dto.employeeId, milestoneId: dto.milestoneId },
		});

		if (existingReward) {
			throw new BadRequestException("A service reward record already exists for this employee and milestone");
		}

		const eligibility = await this.eligibilityService.checkEligibility(tenantId, dto.employeeId, dto.milestoneId);

		let status: ServiceRewardStatus;
		switch (eligibility.eligibilityStatus) {
			case RewardEligibility.ELIGIBLE:
				status = ServiceRewardStatus.ELIGIBLE;
				break;
			case RewardEligibility.DISQUALIFIED_ARTICLE_31:
				status = ServiceRewardStatus.INELIGIBLE;
				break;
			case RewardEligibility.POSTPONED_INVESTIGATION:
				status = ServiceRewardStatus.POSTPONED;
				break;
			case RewardEligibility.PENDING_REVIEW:
				status = ServiceRewardStatus.PENDING;
				break;
			default:
				status = ServiceRewardStatus.PENDING;
		}

		const reward = await this.prisma.serviceReward.create({
			data: {
				tenantId,
				employeeId: dto.employeeId,
				milestoneId: dto.milestoneId,
				eligibilityStatus: eligibility.eligibilityStatus,
				eligibilityCheckDate: new Date(),
				ineligibilityReason: eligibility.reason,
				postponedUntil: eligibility.postponedUntil,
				postponementReason: eligibility.reason,
				originalEligibleDate: eligibility.milestoneDate,
				status,
				createdBy: userId,
			},
			include: {
				employee: { select: EMPLOYEE_SELECT },
				milestone: { select: MILESTONE_SELECT },
			},
		});

		await this.addTimelineEntry(tenantId, reward.id, "CREATED", undefined, status, userId, dto.notes);

		return reward;
	}

	async findAll(tenantId: string, filters: ServiceRewardFilterDto) {
		const where: Prisma.ServiceRewardWhereInput = { tenantId };

		if (filters.status) {
			where.status = filters.status;
		}

		if (filters.eligibilityStatus) {
			where.eligibilityStatus = filters.eligibilityStatus;
		}

		if (filters.milestoneId) {
			where.milestoneId = filters.milestoneId;
		}

		if (filters.employeeId) {
			where.employeeId = filters.employeeId;
		}

		if (filters.centerId) {
			where.employee = { centerId: filters.centerId };
		}

		if (filters.fromDate) {
			where.eligibilityCheckDate = { gte: new Date(filters.fromDate) };
		}

		if (filters.toDate) {
			where.eligibilityCheckDate = {
				...(where.eligibilityCheckDate as Prisma.DateTimeFilter),
				lte: new Date(filters.toDate),
			};
		}

		if (filters.search) {
			where.employee = {
				...(where.employee as Prisma.EmployeeWhereInput),
				OR: [
					{ fullName: { contains: filters.search, mode: "insensitive" } },
					{ employeeId: { contains: filters.search, mode: "insensitive" } },
				],
			};
		}

		const page = filters.page ?? 1;
		const limit = filters.limit ?? 20;
		const skip = calculateSkip(page, limit);

		const [data, total] = await Promise.all([
			this.prisma.serviceReward.findMany({
				where,
				skip,
				take: limit,
				include: {
					employee: { select: EMPLOYEE_SELECT },
					milestone: { select: MILESTONE_SELECT },
				},
				orderBy: { createdAt: "desc" },
			}),
			this.prisma.serviceReward.count({ where }),
		]);

		return paginate(data, total, page, limit);
	}

	async findOne(tenantId: string, id: string) {
		const reward = await this.prisma.serviceReward.findFirst({
			where: { id, tenantId },
			include: {
				employee: { select: EMPLOYEE_SELECT },
				milestone: { select: MILESTONE_SELECT },
				timeline: { orderBy: { performedAt: "asc" } },
			},
		});

		if (!reward) {
			throw new NotFoundException("Service reward not found");
		}

		return reward;
	}

	async findByEmployee(tenantId: string, employeeId: string) {
		return this.prisma.serviceReward.findMany({
			where: { tenantId, employeeId },
			include: {
				milestone: { select: MILESTONE_SELECT },
				timeline: { orderBy: { performedAt: "asc" } },
			},
			orderBy: { createdAt: "desc" },
		});
	}

	async submitForApproval(tenantId: string, id: string, userId: string, dto: SubmitForApprovalDto) {
		const reward = await this.findOne(tenantId, id);

		if (reward.status !== ServiceRewardStatus.ELIGIBLE) {
			throw new BadRequestException("Only eligible rewards can be submitted for approval");
		}

		const updated = await this.prisma.serviceReward.update({
			where: { id },
			data: {
				status: ServiceRewardStatus.AWAITING_APPROVAL,
				submittedForApprovalAt: new Date(),
				submittedForApprovalBy: userId,
			},
			include: {
				employee: { select: EMPLOYEE_SELECT },
				milestone: { select: MILESTONE_SELECT },
			},
		});

		await this.addTimelineEntry(
			tenantId,
			id,
			"SUBMITTED_FOR_APPROVAL",
			ServiceRewardStatus.ELIGIBLE,
			ServiceRewardStatus.AWAITING_APPROVAL,
			userId,
			dto.notes,
		);

		return updated;
	}

	async approve(tenantId: string, id: string, userId: string, dto: ApproveRewardDto) {
		const reward = await this.findOne(tenantId, id);

		if (reward.status !== ServiceRewardStatus.AWAITING_APPROVAL) {
			throw new BadRequestException("Only rewards awaiting approval can be approved");
		}

		const updated = await this.prisma.serviceReward.update({
			where: { id },
			data: {
				status: ServiceRewardStatus.APPROVED,
				approvedAt: new Date(),
				approvedBy: userId,
			},
			include: {
				employee: { select: EMPLOYEE_SELECT },
				milestone: { select: MILESTONE_SELECT },
			},
		});

		await this.addTimelineEntry(
			tenantId,
			id,
			"APPROVED",
			ServiceRewardStatus.AWAITING_APPROVAL,
			ServiceRewardStatus.APPROVED,
			userId,
			dto.notes,
		);

		return updated;
	}

	async reject(tenantId: string, id: string, userId: string, dto: RejectRewardDto) {
		const reward = await this.findOne(tenantId, id);

		if (reward.status !== ServiceRewardStatus.AWAITING_APPROVAL) {
			throw new BadRequestException("Only rewards awaiting approval can be rejected");
		}

		const updated = await this.prisma.serviceReward.update({
			where: { id },
			data: {
				status: ServiceRewardStatus.REJECTED,
				rejectionReason: dto.rejectionReason,
			},
			include: {
				employee: { select: EMPLOYEE_SELECT },
				milestone: { select: MILESTONE_SELECT },
			},
		});

		await this.addTimelineEntry(
			tenantId,
			id,
			"REJECTED",
			ServiceRewardStatus.AWAITING_APPROVAL,
			ServiceRewardStatus.REJECTED,
			userId,
			dto.notes ?? dto.rejectionReason,
		);

		return updated;
	}

	async recordAward(tenantId: string, id: string, userId: string, dto: RecordAwardDto) {
		const reward = await this.findOne(tenantId, id);

		if (reward.status !== ServiceRewardStatus.APPROVED) {
			throw new BadRequestException("Only approved rewards can be awarded");
		}

		const updated = await this.prisma.serviceReward.update({
			where: { id },
			data: {
				status: ServiceRewardStatus.AWARDED,
				awardDate: new Date(dto.awardDate),
				awardedBy: userId,
				ceremonyDetails: dto.ceremonyDetails,
				certificateNumber: dto.certificateNumber,
				certificatePath: dto.certificatePath,
				photoPath: dto.photoPath,
			},
			include: {
				employee: { select: EMPLOYEE_SELECT },
				milestone: { select: MILESTONE_SELECT },
			},
		});

		await this.addTimelineEntry(
			tenantId,
			id,
			"AWARDED",
			ServiceRewardStatus.APPROVED,
			ServiceRewardStatus.AWARDED,
			userId,
			dto.notes,
		);

		return updated;
	}

	async recheckEligibility(tenantId: string, id: string, userId: string) {
		const reward = await this.findOne(tenantId, id);

		const validStatuses: ServiceRewardStatus[] = [
			ServiceRewardStatus.PENDING,
			ServiceRewardStatus.INELIGIBLE,
			ServiceRewardStatus.POSTPONED,
			ServiceRewardStatus.REJECTED,
		];

		if (!validStatuses.includes(reward.status as ServiceRewardStatus)) {
			throw new BadRequestException("Cannot recheck eligibility for rewards in this status");
		}

		const eligibility = await this.eligibilityService.checkEligibility(tenantId, reward.employeeId, reward.milestoneId);

		let newStatus: ServiceRewardStatus;
		switch (eligibility.eligibilityStatus) {
			case RewardEligibility.ELIGIBLE:
				newStatus = ServiceRewardStatus.ELIGIBLE;
				break;
			case RewardEligibility.DISQUALIFIED_ARTICLE_31:
				newStatus = ServiceRewardStatus.INELIGIBLE;
				break;
			case RewardEligibility.POSTPONED_INVESTIGATION:
				newStatus = ServiceRewardStatus.POSTPONED;
				break;
			case RewardEligibility.PENDING_REVIEW:
				newStatus = ServiceRewardStatus.PENDING;
				break;
			default:
				newStatus = ServiceRewardStatus.PENDING;
		}

		const previousStatus = reward.status;

		const updated = await this.prisma.serviceReward.update({
			where: { id },
			data: {
				eligibilityStatus: eligibility.eligibilityStatus,
				eligibilityCheckDate: new Date(),
				ineligibilityReason: eligibility.reason,
				postponedUntil: eligibility.postponedUntil,
				postponementReason: eligibility.reason,
				status: newStatus,
				rejectionReason: null,
			},
			include: {
				employee: { select: EMPLOYEE_SELECT },
				milestone: { select: MILESTONE_SELECT },
			},
		});

		await this.addTimelineEntry(
			tenantId,
			id,
			"ELIGIBILITY_RECHECKED",
			previousStatus,
			newStatus,
			userId,
			`Eligibility rechecked. New status: ${eligibility.eligibilityStatus}. ${eligibility.reason ?? ""}`,
		);

		return updated;
	}

	async getTimeline(tenantId: string, id: string) {
		const reward = await this.prisma.serviceReward.findFirst({
			where: { id, tenantId },
		});

		if (!reward) {
			throw new NotFoundException("Service reward not found");
		}

		return this.prisma.serviceRewardTimeline.findMany({
			where: { serviceRewardId: id },
			orderBy: { performedAt: "asc" },
		});
	}

	async getUpcomingMilestonesReport(tenantId: string, monthsAhead = 6, centerId?: string) {
		return this.eligibilityService.getApproachingMilestones(tenantId, monthsAhead, centerId);
	}

	async getAwardedReport(tenantId: string, year?: number) {
		const targetYear = year ?? new Date().getFullYear();
		const startDate = new Date(targetYear, 0, 1);
		const endDate = new Date(targetYear, 11, 31);

		return this.prisma.serviceReward.findMany({
			where: {
				tenantId,
				status: ServiceRewardStatus.AWARDED,
				awardDate: { gte: startDate, lte: endDate },
			},
			include: {
				employee: { select: EMPLOYEE_SELECT },
				milestone: { select: MILESTONE_SELECT },
			},
			orderBy: { awardDate: "desc" },
		});
	}

	async getReportByMilestone(tenantId: string) {
		const milestones = await this.prisma.rewardMilestone.findMany({
			where: { tenantId, isActive: true },
			orderBy: { yearsOfService: "asc" },
		});

		const report = await Promise.all(
			milestones.map(async (milestone) => {
				const [total, pending, eligible, awaitingApproval, approved, awarded, rejected, ineligible, postponed] =
					await Promise.all([
						this.prisma.serviceReward.count({ where: { tenantId, milestoneId: milestone.id } }),
						this.prisma.serviceReward.count({
							where: { tenantId, milestoneId: milestone.id, status: ServiceRewardStatus.PENDING },
						}),
						this.prisma.serviceReward.count({
							where: { tenantId, milestoneId: milestone.id, status: ServiceRewardStatus.ELIGIBLE },
						}),
						this.prisma.serviceReward.count({
							where: { tenantId, milestoneId: milestone.id, status: ServiceRewardStatus.AWAITING_APPROVAL },
						}),
						this.prisma.serviceReward.count({
							where: { tenantId, milestoneId: milestone.id, status: ServiceRewardStatus.APPROVED },
						}),
						this.prisma.serviceReward.count({
							where: { tenantId, milestoneId: milestone.id, status: ServiceRewardStatus.AWARDED },
						}),
						this.prisma.serviceReward.count({
							where: { tenantId, milestoneId: milestone.id, status: ServiceRewardStatus.REJECTED },
						}),
						this.prisma.serviceReward.count({
							where: { tenantId, milestoneId: milestone.id, status: ServiceRewardStatus.INELIGIBLE },
						}),
						this.prisma.serviceReward.count({
							where: { tenantId, milestoneId: milestone.id, status: ServiceRewardStatus.POSTPONED },
						}),
					]);

				return {
					milestoneId: milestone.id,
					milestoneName: milestone.name,
					yearsOfService: milestone.yearsOfService,
					rewardType: milestone.rewardType,
					counts: {
						total,
						pending,
						eligible,
						awaitingApproval,
						approved,
						awarded,
						rejected,
						ineligible,
						postponed,
					},
				};
			}),
		);

		return report;
	}

	private async addTimelineEntry(
		tenantId: string,
		serviceRewardId: string,
		action: string,
		fromStatus: ServiceRewardStatus | undefined,
		toStatus: ServiceRewardStatus | undefined,
		performedBy: string,
		notes?: string,
	) {
		return this.prisma.serviceRewardTimeline.create({
			data: {
				tenantId,
				serviceRewardId,
				action,
				fromStatus,
				toStatus,
				performedBy,
				notes,
			},
		});
	}
}

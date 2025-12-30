import { ForbiddenException, Injectable } from "@nestjs/common";
import { ComplaintStatus, TermStatus } from "@prisma/client";
import { canAccessAllCenters } from "#api/common/utils/access-scope.util";
import { PrismaService } from "#api/database/prisma.service";
import type { CenterStatistics, ComplaintStatusCount, HqDashboardResponseDto } from "./dto/dashboard.dto";

export interface AccessContext {
	centerId?: string;
	effectiveAccessScope: string;
}

const DASHBOARD_CONFIG = {
	EXPIRING_TERMS_DAYS: 30,
	ACTIVE_EMPLOYEE_STATUSES: ["ACTIVE", "ON_LEAVE", "SUSPENDED"],
	CLOSED_COMPLAINT_STATUSES: [ComplaintStatus.CLOSED_NO_LIABILITY, ComplaintStatus.CLOSED_FINAL],
} as const;

@Injectable()
export class DashboardService {
	constructor(private readonly prisma: PrismaService) {}

	async getHqOverview(tenantId: string, accessContext: AccessContext): Promise<HqDashboardResponseDto> {
		if (!canAccessAllCenters(accessContext.effectiveAccessScope)) {
			throw new ForbiddenException("HQ dashboard is only accessible to users with ALL_CENTERS access scope");
		}

		const totalEmployees = await this.prisma.employee.count({
			where: {
				tenantId,
				status: { in: [...DASHBOARD_CONFIG.ACTIVE_EMPLOYEE_STATUSES] },
			},
		});

		const totalCenters = await this.prisma.center.count({
			where: { tenantId, isActive: true },
		});

		const totalCommittees = await this.prisma.committee.count({
			where: { tenantId, status: "ACTIVE" },
		});

		const totalComplaints = await this.prisma.complaint.count({
			where: {
				tenantId,
				status: { notIn: [...DASHBOARD_CONFIG.CLOSED_COMPLAINT_STATUSES] },
			},
		});

		const complaintsAwaitingHqDecision = await this.prisma.complaint.count({
			where: {
				tenantId,
				status: "AWAITING_HQ_DECISION",
			},
		});

		const pendingAppeals = await this.prisma.complaintAppeal.count({
			where: {
				complaint: { tenantId },
				decision: null,
			},
		});

		const expiringTermsDate = new Date();
		expiringTermsDate.setDate(expiringTermsDate.getDate() + DASHBOARD_CONFIG.EXPIRING_TERMS_DAYS);

		const expiringTerms = await this.prisma.committeeMemberTerm.count({
			where: {
				tenantId,
				status: TermStatus.ACTIVE,
				endDate: {
					lte: expiringTermsDate,
					gte: new Date(),
				},
			},
		});

		const complaintsByStatus = await this.prisma.complaint.groupBy({
			by: ["status"],
			where: { tenantId },
			_count: { status: true },
		});

		const complaintStatusCounts: ComplaintStatusCount[] = complaintsByStatus.map((item) => ({
			status: item.status,
			count: item._count.status,
		}));

		const centers = await this.prisma.center.findMany({
			where: { tenantId, isActive: true },
			select: { id: true, name: true },
		});

		const centerStatistics: CenterStatistics[] = [];

		for (const center of centers) {
			const centerEmployees = await this.prisma.employee.count({
				where: {
					tenantId,
					centerId: center.id,
					status: { in: [...DASHBOARD_CONFIG.ACTIVE_EMPLOYEE_STATUSES] },
				},
			});

			const centerComplaints = await this.prisma.complaint.count({
				where: {
					tenantId,
					centerId: center.id,
					status: { notIn: [...DASHBOARD_CONFIG.CLOSED_COMPLAINT_STATUSES] },
				},
			});

			const centerCommittees = await this.prisma.committee.count({
				where: {
					tenantId,
					centerId: center.id,
					status: "ACTIVE",
				},
			});

			const centerAppeals = await this.prisma.complaintAppeal.count({
				where: {
					complaint: {
						tenantId,
						centerId: center.id,
					},
					decision: null,
				},
			});

			centerStatistics.push({
				centerId: center.id,
				centerName: center.name,
				totalEmployees: centerEmployees,
				activeComplaints: centerComplaints,
				activeCommittees: centerCommittees,
				pendingAppeals: centerAppeals,
			});
		}

		return {
			totalEmployees,
			totalCenters,
			totalCommittees,
			totalComplaints,
			complaintsAwaitingHqDecision,
			pendingAppeals,
			expiringTerms,
			complaintsByStatus: complaintStatusCounts,
			centerStatistics,
		};
	}
}

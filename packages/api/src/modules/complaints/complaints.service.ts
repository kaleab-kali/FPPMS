import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "#api/database/prisma.service";
import {
	ComplaintArticle,
	ComplaintStatus,
	ComplaintFinding,
	DecisionAuthority,
	Prisma,
} from "@prisma/client";
import {
	CreateComplaintDto,
	RecordNotificationDto,
	RecordRebuttalDto,
	RecordFindingDto,
	RecordDecisionDto,
	AssignCommitteeDto,
	ForwardToHqDto,
	RecordHqDecisionDto,
	SubmitAppealDto,
	RecordAppealDecisionDto,
	CloseComplaintDto,
	ComplaintFilterDto,
} from "./dto";

const REBUTTAL_DEADLINE_DAYS = 3;

@Injectable()
export class ComplaintsService {
	constructor(private readonly prisma: PrismaService) {}

	async generateComplaintNumber(tenantId: string): Promise<string> {
		const year = new Date().getFullYear().toString().slice(-2);
		const tenant = await this.prisma.tenant.findUnique({
			where: { id: tenantId },
			select: { settings: true },
		});

		const settings = (tenant?.settings as Prisma.JsonObject) ?? {};
		const currentCounter = (settings.complaintCounter as number) ?? 0;
		const newCounter = currentCounter + 1;

		await this.prisma.tenant.update({
			where: { id: tenantId },
			data: {
				settings: {
					...settings,
					complaintCounter: newCounter,
				},
			},
		});

		const paddedNumber = newCounter.toString().padStart(4, "0");
		return `CMP-${paddedNumber}/${year}`;
	}

	async create(tenantId: string, centerId: string, userId: string, dto: CreateComplaintDto) {
		const complaintNumber = await this.generateComplaintNumber(tenantId);

		const accusedEmployee = await this.prisma.employee.findFirst({
			where: { id: dto.accusedEmployeeId, tenantId },
			select: { id: true, directSuperiorId: true },
		});

		if (!accusedEmployee) {
			throw new NotFoundException("Accused employee not found");
		}

		const initialStatus =
			dto.article === ComplaintArticle.ARTICLE_30
				? ComplaintStatus.UNDER_HR_REVIEW
				: ComplaintStatus.WITH_DISCIPLINE_COMMITTEE;

		const offenseOccurrence = await this.countPreviousOffenses(tenantId, dto.accusedEmployeeId, dto.offenseCode);

		const severityLevel = this.extractSeverityFromOffenseCode(dto.offenseCode);
		const decisionAuthority = this.determineDecisionAuthority(severityLevel);

		const complaint = await this.prisma.complaint.create({
			data: {
				tenantId,
				centerId,
				complaintNumber,
				article: dto.article,
				offenseCode: dto.offenseCode,
				accusedEmployeeId: dto.accusedEmployeeId,
				complainantName: dto.complainantName,
				complainantType: dto.complainantType,
				complainantEmployeeId: dto.complainantEmployeeId,
				summary: dto.summary,
				summaryAm: dto.summaryAm,
				incidentDate: new Date(dto.incidentDate),
				incidentLocation: dto.incidentLocation,
				registeredDate: new Date(dto.registeredDate),
				registeredBy: userId,
				status: initialStatus,
				offenseOccurrence: offenseOccurrence + 1,
				severityLevel: dto.article === ComplaintArticle.ARTICLE_30 ? severityLevel : undefined,
				decisionAuthority: dto.article === ComplaintArticle.ARTICLE_30 ? decisionAuthority : undefined,
				superiorEmployeeId:
					dto.article === ComplaintArticle.ARTICLE_30 && decisionAuthority === DecisionAuthority.DIRECT_SUPERIOR
						? accusedEmployee.directSuperiorId
						: undefined,
			},
			include: {
				timeline: true,
			},
		});

		await this.addTimelineEntry(tenantId, complaint.id, "REGISTERED", undefined, initialStatus, userId, "Complaint registered");

		return this.findOne(tenantId, complaint.id);
	}

	async findAll(tenantId: string, filters: ComplaintFilterDto) {
		const where: Prisma.ComplaintWhereInput = {
			tenantId,
			deletedAt: null,
		};

		if (filters.article) {
			where.article = filters.article;
		}

		if (filters.status) {
			where.status = filters.status;
		}

		if (filters.centerId) {
			where.centerId = filters.centerId;
		}

		if (filters.accusedEmployeeId) {
			where.accusedEmployeeId = filters.accusedEmployeeId;
		}

		if (filters.search) {
			where.OR = [
				{ complaintNumber: { contains: filters.search, mode: "insensitive" } },
				{ summary: { contains: filters.search, mode: "insensitive" } },
			];
		}

		if (filters.fromDate) {
			where.registeredDate = { gte: new Date(filters.fromDate) };
		}

		if (filters.toDate) {
			where.registeredDate = {
				...(where.registeredDate as Prisma.DateTimeFilter),
				lte: new Date(filters.toDate),
			};
		}

		return this.prisma.complaint.findMany({
			where,
			include: {
				accusedEmployee: {
					select: {
						id: true,
						employeeId: true,
						fullName: true,
						fullNameAm: true,
					},
				},
			},
			orderBy: { registeredDate: "desc" },
		});
	}

	async findOne(tenantId: string, id: string) {
		const complaint = await this.prisma.complaint.findFirst({
			where: { id, tenantId, deletedAt: null },
			include: {
				accusedEmployee: {
					select: {
						id: true,
						employeeId: true,
						fullName: true,
						fullNameAm: true,
					},
				},
				timeline: {
					orderBy: { performedAt: "asc" },
				},
				documents: {
					where: { deletedAt: null },
					orderBy: { uploadedAt: "desc" },
				},
				appeals: {
					orderBy: { appealLevel: "asc" },
				},
			},
		});

		if (!complaint) {
			throw new NotFoundException("Complaint not found");
		}

		return complaint;
	}

	async getTimeline(tenantId: string, complaintId: string) {
		const complaint = await this.prisma.complaint.findFirst({
			where: { id: complaintId, tenantId, deletedAt: null },
		});

		if (!complaint) {
			throw new NotFoundException("Complaint not found");
		}

		return this.prisma.complaintTimeline.findMany({
			where: { complaintId },
			orderBy: { performedAt: "asc" },
		});
	}

	async recordNotification(tenantId: string, complaintId: string, userId: string, dto: RecordNotificationDto) {
		const complaint = await this.findOne(tenantId, complaintId);

		if (complaint.article !== ComplaintArticle.ARTICLE_30) {
			throw new BadRequestException("Notification is only applicable for Article 30 complaints");
		}

		if (complaint.status !== ComplaintStatus.UNDER_HR_REVIEW) {
			throw new BadRequestException("Complaint must be under HR review to record notification");
		}

		const notificationDate = new Date(dto.notificationDate);
		const rebuttalDeadline = new Date(notificationDate);
		rebuttalDeadline.setDate(rebuttalDeadline.getDate() + REBUTTAL_DEADLINE_DAYS);

		const updated = await this.prisma.complaint.update({
			where: { id: complaintId },
			data: {
				notificationDate,
				rebuttalDeadline,
				status: ComplaintStatus.WAITING_FOR_REBUTTAL,
			},
		});

		await this.addTimelineEntry(
			tenantId,
			complaintId,
			"NOTIFICATION_SENT",
			ComplaintStatus.UNDER_HR_REVIEW,
			ComplaintStatus.WAITING_FOR_REBUTTAL,
			userId,
			dto.notes,
		);

		return this.findOne(tenantId, complaintId);
	}

	async recordRebuttal(tenantId: string, complaintId: string, userId: string, dto: RecordRebuttalDto) {
		const complaint = await this.findOne(tenantId, complaintId);

		if (complaint.article !== ComplaintArticle.ARTICLE_30) {
			throw new BadRequestException("Rebuttal is only applicable for Article 30 complaints");
		}

		if (complaint.status !== ComplaintStatus.WAITING_FOR_REBUTTAL) {
			throw new BadRequestException("Complaint must be waiting for rebuttal");
		}

		await this.prisma.complaint.update({
			where: { id: complaintId },
			data: {
				rebuttalReceivedDate: new Date(dto.rebuttalReceivedDate),
				rebuttalContent: dto.rebuttalContent,
				hasRebuttal: true,
				status: ComplaintStatus.UNDER_HR_ANALYSIS,
			},
		});

		await this.addTimelineEntry(
			tenantId,
			complaintId,
			"REBUTTAL_RECEIVED",
			ComplaintStatus.WAITING_FOR_REBUTTAL,
			ComplaintStatus.UNDER_HR_ANALYSIS,
			userId,
			dto.notes,
		);

		return this.findOne(tenantId, complaintId);
	}

	async markRebuttalDeadlinePassed(tenantId: string, complaintId: string, userId: string) {
		const complaint = await this.findOne(tenantId, complaintId);

		if (complaint.article !== ComplaintArticle.ARTICLE_30) {
			throw new BadRequestException("This action is only applicable for Article 30 complaints");
		}

		if (complaint.status !== ComplaintStatus.WAITING_FOR_REBUTTAL) {
			throw new BadRequestException("Complaint must be waiting for rebuttal");
		}

		await this.prisma.complaint.update({
			where: { id: complaintId },
			data: {
				hasRebuttal: false,
				finding: ComplaintFinding.GUILTY_NO_REBUTTAL,
				status: ComplaintStatus.AWAITING_SUPERIOR_DECISION,
			},
		});

		await this.addTimelineEntry(
			tenantId,
			complaintId,
			"REBUTTAL_DEADLINE_PASSED",
			ComplaintStatus.WAITING_FOR_REBUTTAL,
			ComplaintStatus.AWAITING_SUPERIOR_DECISION,
			userId,
			"Rebuttal deadline passed - automatic guilty finding",
		);

		return this.findOne(tenantId, complaintId);
	}

	async recordFinding(tenantId: string, complaintId: string, userId: string, dto: RecordFindingDto) {
		const complaint = await this.findOne(tenantId, complaintId);

		const validStatuses: ComplaintStatus[] = [ComplaintStatus.UNDER_HR_ANALYSIS, ComplaintStatus.WITH_DISCIPLINE_COMMITTEE];
		if (!validStatuses.includes(complaint.status)) {
			throw new BadRequestException("Invalid status for recording finding");
		}

		const newStatus =
			dto.finding === ComplaintFinding.NOT_GUILTY
				? ComplaintStatus.CLOSED_NO_LIABILITY
				: complaint.article === ComplaintArticle.ARTICLE_30
					? ComplaintStatus.AWAITING_SUPERIOR_DECISION
					: ComplaintStatus.FORWARDED_TO_HQ;

		await this.prisma.complaint.update({
			where: { id: complaintId },
			data: {
				finding: dto.finding,
				findingDate: new Date(dto.findingDate),
				findingReason: dto.findingReason,
				findingBy: userId,
				status: newStatus,
			},
		});

		await this.addTimelineEntry(tenantId, complaintId, "FINDING_RECORDED", complaint.status, newStatus, userId, dto.notes);

		return this.findOne(tenantId, complaintId);
	}

	async recordDecision(tenantId: string, complaintId: string, userId: string, dto: RecordDecisionDto) {
		const complaint = await this.findOne(tenantId, complaintId);

		if (complaint.article !== ComplaintArticle.ARTICLE_30) {
			throw new BadRequestException("This action is only applicable for Article 30 complaints");
		}

		if (complaint.status !== ComplaintStatus.AWAITING_SUPERIOR_DECISION) {
			throw new BadRequestException("Complaint must be awaiting superior decision");
		}

		await this.prisma.complaint.update({
			where: { id: complaintId },
			data: {
				superiorDecisionDate: new Date(dto.decisionDate),
				punishmentPercentage: dto.punishmentPercentage,
				punishmentDescription: dto.punishmentDescription,
				decisionDate: new Date(dto.decisionDate),
				decisionBy: userId,
				status: ComplaintStatus.DECIDED,
			},
		});

		await this.addTimelineEntry(
			tenantId,
			complaintId,
			"DECISION_MADE",
			ComplaintStatus.AWAITING_SUPERIOR_DECISION,
			ComplaintStatus.DECIDED,
			userId,
			dto.notes,
		);

		return this.findOne(tenantId, complaintId);
	}

	async assignCommittee(tenantId: string, complaintId: string, userId: string, dto: AssignCommitteeDto) {
		const complaint = await this.findOne(tenantId, complaintId);

		if (complaint.article !== ComplaintArticle.ARTICLE_31) {
			throw new BadRequestException("Committee assignment is only for Article 31 complaints");
		}

		const committee = await this.prisma.committee.findFirst({
			where: { id: dto.committeeId, tenantId },
		});

		if (!committee) {
			throw new NotFoundException("Committee not found");
		}

		await this.prisma.complaint.update({
			where: { id: complaintId },
			data: {
				assignedCommitteeId: dto.committeeId,
				committeeAssignedDate: new Date(dto.assignedDate),
				status: ComplaintStatus.WITH_DISCIPLINE_COMMITTEE,
			},
		});

		await this.addTimelineEntry(
			tenantId,
			complaintId,
			"COMMITTEE_ASSIGNED",
			complaint.status,
			ComplaintStatus.WITH_DISCIPLINE_COMMITTEE,
			userId,
			dto.notes,
		);

		return this.findOne(tenantId, complaintId);
	}

	async forwardToHq(tenantId: string, complaintId: string, userId: string, dto: ForwardToHqDto) {
		const complaint = await this.findOne(tenantId, complaintId);

		if (complaint.article !== ComplaintArticle.ARTICLE_31) {
			throw new BadRequestException("HQ forwarding is only for Article 31 complaints");
		}

		if (complaint.status !== ComplaintStatus.WITH_DISCIPLINE_COMMITTEE) {
			throw new BadRequestException("Complaint must be with discipline committee");
		}

		const hqCommittee = await this.prisma.committee.findFirst({
			where: { id: dto.hqCommitteeId, tenantId },
		});

		if (!hqCommittee) {
			throw new NotFoundException("HQ Committee not found");
		}

		await this.prisma.complaint.update({
			where: { id: complaintId },
			data: {
				hqCommitteeId: dto.hqCommitteeId,
				hqForwardedDate: new Date(dto.forwardedDate),
				status: ComplaintStatus.FORWARDED_TO_HQ,
			},
		});

		await this.addTimelineEntry(
			tenantId,
			complaintId,
			"FORWARDED_TO_HQ",
			ComplaintStatus.WITH_DISCIPLINE_COMMITTEE,
			ComplaintStatus.FORWARDED_TO_HQ,
			userId,
			dto.notes,
		);

		return this.findOne(tenantId, complaintId);
	}

	async recordHqDecision(tenantId: string, complaintId: string, userId: string, dto: RecordHqDecisionDto) {
		const complaint = await this.findOne(tenantId, complaintId);

		if (complaint.article !== ComplaintArticle.ARTICLE_31) {
			throw new BadRequestException("HQ decision is only for Article 31 complaints");
		}

		if (complaint.status !== ComplaintStatus.FORWARDED_TO_HQ) {
			throw new BadRequestException("Complaint must be forwarded to HQ");
		}

		await this.prisma.complaint.update({
			where: { id: complaintId },
			data: {
				decisionDate: new Date(dto.decisionDate),
				decisionBy: userId,
				punishmentDescription: dto.punishmentDescription,
				status: ComplaintStatus.DECIDED_BY_HQ,
			},
		});

		await this.addTimelineEntry(
			tenantId,
			complaintId,
			"HQ_DECISION_MADE",
			ComplaintStatus.FORWARDED_TO_HQ,
			ComplaintStatus.DECIDED_BY_HQ,
			userId,
			dto.notes,
		);

		return this.findOne(tenantId, complaintId);
	}

	async submitAppeal(tenantId: string, complaintId: string, userId: string, dto: SubmitAppealDto) {
		const complaint = await this.findOne(tenantId, complaintId);

		const validStatuses: ComplaintStatus[] = [ComplaintStatus.DECIDED, ComplaintStatus.DECIDED_BY_HQ];
		if (!validStatuses.includes(complaint.status)) {
			throw new BadRequestException("Complaint must be decided to submit an appeal");
		}

		const existingAppeal = await this.prisma.complaintAppeal.findFirst({
			where: { complaintId, appealLevel: dto.appealLevel },
		});

		if (existingAppeal) {
			throw new BadRequestException(`Appeal at level ${dto.appealLevel} already exists`);
		}

		const appeal = await this.prisma.complaintAppeal.create({
			data: {
				tenantId,
				complaintId,
				appealLevel: dto.appealLevel,
				appealDate: new Date(dto.appealDate),
				appealReason: dto.appealReason,
			},
		});

		await this.addTimelineEntry(tenantId, complaintId, `APPEAL_SUBMITTED_LEVEL_${dto.appealLevel}`, undefined, undefined, userId, dto.notes);

		return appeal;
	}

	async recordAppealDecision(
		tenantId: string,
		complaintId: string,
		appealId: string,
		userId: string,
		dto: RecordAppealDecisionDto,
	) {
		const complaint = await this.findOne(tenantId, complaintId);

		const appeal = await this.prisma.complaintAppeal.findFirst({
			where: { id: appealId, complaintId },
		});

		if (!appeal) {
			throw new NotFoundException("Appeal not found");
		}

		const updated = await this.prisma.complaintAppeal.update({
			where: { id: appealId },
			data: {
				reviewedBy: userId,
				reviewedAt: new Date(dto.reviewedAt),
				decision: dto.decision,
				decisionReason: dto.decisionReason,
				newPunishment: dto.newPunishment,
			},
		});

		await this.addTimelineEntry(
			tenantId,
			complaintId,
			`APPEAL_DECIDED_LEVEL_${appeal.appealLevel}`,
			undefined,
			undefined,
			userId,
			dto.notes,
		);

		return updated;
	}

	async closeComplaint(tenantId: string, complaintId: string, userId: string, dto: CloseComplaintDto) {
		const complaint = await this.findOne(tenantId, complaintId);

		const validStatuses: ComplaintStatus[] = [
			ComplaintStatus.DECIDED,
			ComplaintStatus.DECIDED_BY_HQ,
			ComplaintStatus.CLOSED_NO_LIABILITY,
		];

		if (!validStatuses.includes(complaint.status)) {
			throw new BadRequestException("Complaint cannot be closed from current status");
		}

		const newStatus =
			complaint.status === ComplaintStatus.CLOSED_NO_LIABILITY
				? ComplaintStatus.CLOSED_NO_LIABILITY
				: ComplaintStatus.CLOSED_FINAL;

		await this.prisma.complaint.update({
			where: { id: complaintId },
			data: {
				closedDate: new Date(dto.closedDate),
				closedBy: userId,
				closureReason: dto.closureReason,
				status: newStatus,
			},
		});

		await this.addTimelineEntry(tenantId, complaintId, "COMPLAINT_CLOSED", complaint.status, newStatus, userId, dto.notes);

		return this.findOne(tenantId, complaintId);
	}

	async getEmployeeComplaintHistory(tenantId: string, employeeId: string) {
		return this.prisma.complaint.findMany({
			where: {
				tenantId,
				accusedEmployeeId: employeeId,
				deletedAt: null,
			},
			include: {
				timeline: {
					orderBy: { performedAt: "asc" },
				},
			},
			orderBy: { registeredDate: "desc" },
		});
	}

	private async countPreviousOffenses(tenantId: string, employeeId: string, offenseCode: string): Promise<number> {
		return this.prisma.complaint.count({
			where: {
				tenantId,
				accusedEmployeeId: employeeId,
				offenseCode,
				finding: { in: [ComplaintFinding.GUILTY, ComplaintFinding.GUILTY_NO_REBUTTAL] },
				deletedAt: null,
			},
		});
	}

	private extractSeverityFromOffenseCode(offenseCode: string): number {
		return 1;
	}

	private determineDecisionAuthority(severityLevel: number): DecisionAuthority {
		if (severityLevel >= 5) {
			return DecisionAuthority.DISCIPLINE_COMMITTEE;
		}
		return DecisionAuthority.DIRECT_SUPERIOR;
	}

	private async addTimelineEntry(
		tenantId: string,
		complaintId: string,
		action: string,
		fromStatus: ComplaintStatus | undefined,
		toStatus: ComplaintStatus | undefined,
		performedBy: string,
		notes?: string,
	) {
		return this.prisma.complaintTimeline.create({
			data: {
				tenantId,
				complaintId,
				action,
				fromStatus,
				toStatus,
				performedBy,
				notes,
			},
		});
	}
}

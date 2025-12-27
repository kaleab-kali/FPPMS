import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { ComplaintArticle, ComplaintFinding, ComplaintStatus, DecisionAuthority, Prisma } from "@prisma/client";
import { PrismaService } from "#api/database/prisma.service";
import {
	AssignCommitteeDto,
	CloseComplaintDto,
	ComplaintFilterDto,
	CreateComplaintDto,
	ForwardToHqDto,
	RecordAppealDecisionDto,
	RecordDecisionDto,
	RecordFindingDto,
	RecordHqDecisionDto,
	RecordNotificationDto,
	RecordRebuttalDto,
	SubmitAppealDto,
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

		const offenseOccurrence = await this.countPreviousOffenses(tenantId, dto.accusedEmployeeId, dto.offenseCode);
		const severityLevel = this.extractSeverityFromOffenseCode(dto.offenseCode);
		const decisionAuthority = this.determineDecisionAuthority(severityLevel);

		let initialStatus: ComplaintStatus;
		let assignedCommitteeId: string | undefined;
		let committeeAssignedDate: Date | undefined;

		if (dto.article === ComplaintArticle.ARTICLE_31) {
			const disciplineCommittee = await this.findDisciplineCommitteeForCenter(tenantId, centerId);
			if (!disciplineCommittee) {
				throw new BadRequestException(
					"No active discipline committee exists for this center. Please create a discipline committee before registering Article 31 complaints.",
				);
			}
			initialStatus = ComplaintStatus.WITH_DISCIPLINE_COMMITTEE;
			assignedCommitteeId = disciplineCommittee.id;
			committeeAssignedDate = new Date();
		} else {
			initialStatus = ComplaintStatus.UNDER_HR_REVIEW;
		}

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
				assignedCommitteeId,
				committeeAssignedDate,
			},
			include: {
				timeline: true,
			},
		});

		await this.addTimelineEntry(
			tenantId,
			complaint.id,
			"REGISTERED",
			undefined,
			initialStatus,
			userId,
			dto.article === ComplaintArticle.ARTICLE_31
				? "Complaint registered and auto-assigned to discipline committee"
				: "Complaint registered",
		);

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
					orderBy: { appealDate: "asc" },
					include: {
						reviewerEmployee: {
							select: {
								id: true,
								employeeId: true,
								fullName: true,
								fullNameAm: true,
							},
						},
					},
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

		let validStatus: ComplaintStatus;
		let newStatus: ComplaintStatus;

		if (complaint.article === ComplaintArticle.ARTICLE_30) {
			validStatus = ComplaintStatus.UNDER_HR_REVIEW;
			newStatus = ComplaintStatus.WAITING_FOR_REBUTTAL;
		} else {
			validStatus = ComplaintStatus.WITH_DISCIPLINE_COMMITTEE;
			newStatus = ComplaintStatus.COMMITTEE_WAITING_REBUTTAL;
		}

		if (complaint.status !== validStatus) {
			throw new BadRequestException(
				complaint.article === ComplaintArticle.ARTICLE_30
					? "Complaint must be under HR review to record notification"
					: "Complaint must be with discipline committee to record notification",
			);
		}

		const notificationDate = new Date(dto.notificationDate);
		const rebuttalDeadline = new Date(notificationDate);
		rebuttalDeadline.setDate(rebuttalDeadline.getDate() + REBUTTAL_DEADLINE_DAYS);

		await this.prisma.complaint.update({
			where: { id: complaintId },
			data: {
				notificationDate,
				rebuttalDeadline,
				status: newStatus,
			},
		});

		await this.addTimelineEntry(
			tenantId,
			complaintId,
			"NOTIFICATION_SENT",
			validStatus,
			newStatus,
			userId,
			dto.notes,
		);

		return this.findOne(tenantId, complaintId);
	}

	async recordRebuttal(tenantId: string, complaintId: string, userId: string, dto: RecordRebuttalDto) {
		const complaint = await this.findOne(tenantId, complaintId);

		let validStatus: ComplaintStatus;
		let newStatus: ComplaintStatus;

		if (complaint.article === ComplaintArticle.ARTICLE_30) {
			validStatus = ComplaintStatus.WAITING_FOR_REBUTTAL;
			newStatus = ComplaintStatus.UNDER_HR_ANALYSIS;
		} else {
			validStatus = ComplaintStatus.COMMITTEE_WAITING_REBUTTAL;
			newStatus = ComplaintStatus.COMMITTEE_ANALYSIS;
		}

		if (complaint.status !== validStatus) {
			throw new BadRequestException("Complaint must be waiting for rebuttal");
		}

		await this.prisma.complaint.update({
			where: { id: complaintId },
			data: {
				rebuttalReceivedDate: new Date(dto.rebuttalReceivedDate),
				rebuttalContent: dto.rebuttalContent,
				hasRebuttal: true,
				status: newStatus,
			},
		});

		await this.addTimelineEntry(
			tenantId,
			complaintId,
			"REBUTTAL_RECEIVED",
			validStatus,
			newStatus,
			userId,
			dto.notes,
		);

		return this.findOne(tenantId, complaintId);
	}

	async markRebuttalDeadlinePassed(tenantId: string, complaintId: string, userId: string) {
		const complaint = await this.findOne(tenantId, complaintId);

		let validStatus: ComplaintStatus;
		let newStatus: ComplaintStatus;

		if (complaint.article === ComplaintArticle.ARTICLE_30) {
			validStatus = ComplaintStatus.WAITING_FOR_REBUTTAL;
			newStatus = ComplaintStatus.AWAITING_SUPERIOR_DECISION;
		} else {
			validStatus = ComplaintStatus.COMMITTEE_WAITING_REBUTTAL;
			newStatus = ComplaintStatus.COMMITTEE_ANALYSIS;
		}

		if (complaint.status !== validStatus) {
			throw new BadRequestException("Complaint must be waiting for rebuttal");
		}

		await this.prisma.complaint.update({
			where: { id: complaintId },
			data: {
				hasRebuttal: false,
				finding: ComplaintFinding.GUILTY_NO_REBUTTAL,
				status: newStatus,
			},
		});

		await this.addTimelineEntry(
			tenantId,
			complaintId,
			"REBUTTAL_DEADLINE_PASSED",
			validStatus,
			newStatus,
			userId,
			"Rebuttal deadline passed - automatic guilty finding",
		);

		return this.findOne(tenantId, complaintId);
	}

	async recordFinding(tenantId: string, complaintId: string, userId: string, dto: RecordFindingDto) {
		const complaint = await this.findOne(tenantId, complaintId);

		const validStatuses: ComplaintStatus[] = [
			ComplaintStatus.UNDER_HR_ANALYSIS,
			ComplaintStatus.COMMITTEE_ANALYSIS,
		];
		if (!validStatuses.includes(complaint.status)) {
			throw new BadRequestException("Invalid status for recording finding. Complaint must be under analysis.");
		}

		let newStatus: ComplaintStatus;
		if (dto.finding === ComplaintFinding.NOT_GUILTY) {
			newStatus = ComplaintStatus.CLOSED_NO_LIABILITY;
		} else if (complaint.article === ComplaintArticle.ARTICLE_30) {
			newStatus = ComplaintStatus.AWAITING_SUPERIOR_DECISION;
		} else {
			newStatus = ComplaintStatus.INVESTIGATION_COMPLETE;
		}

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

		await this.addTimelineEntry(
			tenantId,
			complaintId,
			"FINDING_RECORDED",
			complaint.status,
			newStatus,
			userId,
			dto.notes,
		);

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

		if (committee.centerId && complaint.centerId !== committee.centerId) {
			throw new BadRequestException("Committee must belong to the same center as the complaint");
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

		if (complaint.status !== ComplaintStatus.INVESTIGATION_COMPLETE) {
			throw new BadRequestException("Complaint must have investigation complete before forwarding to HQ");
		}

		if (!complaint.finding) {
			throw new BadRequestException("Complaint must have a finding recorded before forwarding to HQ");
		}

		const assignedCommittee = await this.prisma.committee.findFirst({
			where: { id: complaint.assignedCommitteeId ?? "", tenantId },
		});

		if (!assignedCommittee) {
			throw new BadRequestException("Complaint must have an assigned committee");
		}

		if (!assignedCommittee.centerId) {
			throw new BadRequestException("Only center-level discipline committees can forward to HQ");
		}

		const hqCommittee = await this.prisma.committee.findFirst({
			where: { id: dto.hqCommitteeId, tenantId },
		});

		if (!hqCommittee) {
			throw new NotFoundException("HQ Committee not found");
		}

		if (hqCommittee.centerId) {
			throw new BadRequestException("Target committee must be an HQ-level committee (no center)");
		}

		await this.prisma.complaint.update({
			where: { id: complaintId },
			data: {
				hqCommitteeId: dto.hqCommitteeId,
				hqForwardedDate: new Date(dto.forwardedDate),
				status: ComplaintStatus.AWAITING_HQ_DECISION,
			},
		});

		await this.addTimelineEntry(
			tenantId,
			complaintId,
			"FORWARDED_TO_HQ",
			ComplaintStatus.INVESTIGATION_COMPLETE,
			ComplaintStatus.AWAITING_HQ_DECISION,
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

		if (complaint.status !== ComplaintStatus.AWAITING_HQ_DECISION) {
			throw new BadRequestException("Complaint must be awaiting HQ decision");
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
			ComplaintStatus.AWAITING_HQ_DECISION,
			ComplaintStatus.DECIDED_BY_HQ,
			userId,
			dto.notes,
		);

		return this.findOne(tenantId, complaintId);
	}

	async submitAppeal(tenantId: string, complaintId: string, userId: string, dto: SubmitAppealDto) {
		const complaint = await this.findOne(tenantId, complaintId);

		const validStatuses: ComplaintStatus[] = [
			ComplaintStatus.DECIDED,
			ComplaintStatus.DECIDED_BY_HQ,
			ComplaintStatus.APPEAL_DECIDED,
		];
		if (!validStatuses.includes(complaint.status)) {
			throw new BadRequestException("Complaint must be decided to submit an appeal");
		}

		const pendingAppeal = await this.prisma.complaintAppeal.findFirst({
			where: { complaintId, decision: null },
		});

		if (pendingAppeal) {
			throw new BadRequestException("There is already a pending appeal for this complaint");
		}

		const reviewerEmployee = await this.prisma.employee.findFirst({
			where: { id: dto.reviewerEmployeeId, tenantId },
		});

		if (!reviewerEmployee) {
			throw new NotFoundException("Reviewer employee not found");
		}

		const appeal = await this.prisma.complaintAppeal.create({
			data: {
				tenantId,
				complaintId,
				appealDate: new Date(dto.appealDate),
				appealReason: dto.appealReason,
				reviewerEmployeeId: dto.reviewerEmployeeId,
				submittedBy: userId,
			},
		});

		await this.prisma.complaint.update({
			where: { id: complaintId },
			data: { status: ComplaintStatus.ON_APPEAL },
		});

		await this.addTimelineEntry(
			tenantId,
			complaintId,
			"APPEAL_SUBMITTED",
			complaint.status,
			ComplaintStatus.ON_APPEAL,
			userId,
			dto.notes,
		);

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

		if (complaint.status !== ComplaintStatus.ON_APPEAL) {
			throw new BadRequestException("Complaint must be on appeal");
		}

		const appeal = await this.prisma.complaintAppeal.findFirst({
			where: { id: appealId, complaintId },
		});

		if (!appeal) {
			throw new NotFoundException("Appeal not found");
		}

		if (appeal.decision) {
			throw new BadRequestException("This appeal has already been decided");
		}

		const updated = await this.prisma.complaintAppeal.update({
			where: { id: appealId },
			data: {
				reviewedAt: new Date(dto.reviewedAt),
				decision: dto.decision,
				decisionReason: dto.decisionReason,
				newPunishment: dto.newPunishment,
			},
		});

		await this.prisma.complaint.update({
			where: { id: complaintId },
			data: { status: ComplaintStatus.APPEAL_DECIDED },
		});

		await this.addTimelineEntry(
			tenantId,
			complaintId,
			"APPEAL_DECIDED",
			ComplaintStatus.ON_APPEAL,
			ComplaintStatus.APPEAL_DECIDED,
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
			ComplaintStatus.APPEAL_DECIDED,
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

		await this.addTimelineEntry(
			tenantId,
			complaintId,
			"COMPLAINT_CLOSED",
			complaint.status,
			newStatus,
			userId,
			dto.notes,
		);

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

	async findByCommittee(tenantId: string, committeeId: string, type: "assigned" | "hq" = "assigned") {
		const where: Prisma.ComplaintWhereInput = {
			tenantId,
			deletedAt: null,
		};

		if (type === "assigned") {
			where.assignedCommitteeId = committeeId;
		} else {
			where.hqCommitteeId = committeeId;
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

	private extractSeverityFromOffenseCode(_offenseCode: string): number {
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

	private async findDisciplineCommitteeForCenter(tenantId: string, centerId: string) {
		return this.prisma.committee.findFirst({
			where: {
				tenantId,
				centerId,
				status: "ACTIVE",
				committeeType: {
					code: "DISCIPLINE",
				},
			},
			include: {
				committeeType: true,
			},
		});
	}
}

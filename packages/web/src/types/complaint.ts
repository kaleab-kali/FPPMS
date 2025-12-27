export type ComplaintArticle = "ARTICLE_30" | "ARTICLE_31";

export type ComplaintStatus =
	| "UNDER_HR_REVIEW"
	| "WAITING_FOR_REBUTTAL"
	| "UNDER_HR_ANALYSIS"
	| "AWAITING_SUPERIOR_DECISION"
	| "WITH_DISCIPLINE_COMMITTEE"
	| "COMMITTEE_WAITING_REBUTTAL"
	| "COMMITTEE_ANALYSIS"
	| "INVESTIGATION_COMPLETE"
	| "FORWARDED_TO_HQ"
	| "AWAITING_HQ_DECISION"
	| "DECIDED"
	| "DECIDED_BY_HQ"
	| "ON_APPEAL"
	| "APPEAL_DECIDED"
	| "CLOSED_NO_LIABILITY"
	| "CLOSED_FINAL";

export type ComplaintFinding = "PENDING" | "GUILTY" | "GUILTY_NO_REBUTTAL" | "NOT_GUILTY";

export type DecisionAuthority = "DIRECT_SUPERIOR" | "DISCIPLINE_COMMITTEE";

export type ComplainantType = "EMPLOYEE" | "EXTERNAL" | "ANONYMOUS";

export type AppealDecision = "UPHELD" | "MODIFIED" | "OVERTURNED";

export interface AccusedEmployeeMinimal {
	id: string;
	employeeId: string;
	fullName: string;
	fullNameAm?: string;
}

export interface ReviewerEmployeeMinimal {
	id: string;
	employeeId: string;
	fullName: string;
	fullNameAm?: string;
}

export interface ComplaintTimeline {
	id: string;
	tenantId: string;
	complaintId: string;
	action: string;
	fromStatus?: ComplaintStatus;
	toStatus?: ComplaintStatus;
	performedBy: string;
	performedAt: string;
	notes?: string;
}

export interface ComplaintDocument {
	id: string;
	tenantId: string;
	complaintId: string;
	documentType: string;
	fileName: string;
	fileSize: number;
	mimeType: string;
	storagePath: string;
	description?: string;
	uploadedBy: string;
	uploadedAt: string;
}

export interface ComplaintAppeal {
	id: string;
	tenantId: string;
	complaintId: string;
	appealDate: string;
	appealReason: string;
	reviewerEmployeeId?: string;
	reviewerEmployee?: ReviewerEmployeeMinimal;
	submittedBy: string;
	reviewedAt?: string;
	decision?: AppealDecision;
	decisionReason?: string;
	newPunishment?: string;
	createdAt: string;
	updatedAt: string;
}

export interface Complaint {
	id: string;
	tenantId: string;
	centerId: string;
	complaintNumber: string;
	article: ComplaintArticle;
	offenseCode: string;
	accusedEmployeeId: string;
	complainantName?: string;
	complainantType: ComplainantType;
	complainantEmployeeId?: string;
	summary: string;
	summaryAm?: string;
	incidentDate: string;
	incidentLocation?: string;
	registeredDate: string;
	registeredBy: string;
	status: ComplaintStatus;
	offenseOccurrence: number;
	severityLevel?: number;
	decisionAuthority?: DecisionAuthority;
	superiorEmployeeId?: string;
	assignedCommitteeId?: string;
	committeeAssignedDate?: string;
	notificationDate?: string;
	rebuttalDeadline?: string;
	hasRebuttal?: boolean;
	rebuttalReceivedDate?: string;
	rebuttalContent?: string;
	finding?: ComplaintFinding;
	findingDate?: string;
	findingReason?: string;
	findingBy?: string;
	superiorDecisionDate?: string;
	punishmentPercentage?: number;
	punishmentDescription?: string;
	hqCommitteeId?: string;
	hqForwardedDate?: string;
	decisionDate?: string;
	decisionBy?: string;
	closedDate?: string;
	closedBy?: string;
	closureReason?: string;
	createdAt: string;
	updatedAt: string;
	accusedEmployee?: AccusedEmployeeMinimal;
	timeline?: ComplaintTimeline[];
	documents?: ComplaintDocument[];
	appeals?: ComplaintAppeal[];
}

export interface ComplaintListItem {
	id: string;
	tenantId: string;
	centerId: string;
	complaintNumber: string;
	article: ComplaintArticle;
	offenseCode: string;
	status: ComplaintStatus;
	registeredDate: string;
	incidentDate: string;
	accusedEmployee?: AccusedEmployeeMinimal;
}

export interface CreateComplaintRequest {
	article: ComplaintArticle;
	offenseCode: string;
	accusedEmployeeId: string;
	complainantName?: string;
	complainantType: ComplainantType;
	complainantEmployeeId?: string;
	summary: string;
	summaryAm?: string;
	incidentDate: string;
	incidentLocation?: string;
	registeredDate: string;
}

export interface RecordNotificationRequest {
	notificationDate: string;
	notes?: string;
}

export interface RecordRebuttalRequest {
	rebuttalReceivedDate: string;
	rebuttalContent: string;
	notes?: string;
}

export interface RecordFindingRequest {
	finding: ComplaintFinding;
	findingDate: string;
	findingReason: string;
	notes?: string;
}

export interface RecordDecisionRequest {
	decisionDate: string;
	punishmentPercentage?: number;
	punishmentDescription: string;
	notes?: string;
}

export interface AssignCommitteeRequest {
	committeeId: string;
	assignedDate: string;
	notes?: string;
}

export interface ForwardToHqRequest {
	hqCommitteeId: string;
	forwardedDate: string;
	notes?: string;
}

export interface ForwardToCommitteeRequest {
	committeeId: string;
	forwardedDate: string;
	notes?: string;
}

export interface RecordHqDecisionRequest {
	decisionDate: string;
	punishmentDescription: string;
	notes?: string;
}

export interface SubmitAppealRequest {
	appealDate: string;
	appealReason: string;
	reviewerEmployeeId: string;
	notes?: string;
}

export interface RecordAppealDecisionRequest {
	reviewedAt: string;
	decision: AppealDecision;
	decisionReason: string;
	newPunishment?: string;
	notes?: string;
}

export interface CloseComplaintRequest {
	closedDate: string;
	closureReason?: string;
	notes?: string;
}

export interface ComplaintFilterParams {
	article?: ComplaintArticle;
	status?: ComplaintStatus;
	centerId?: string;
	accusedEmployeeId?: string;
	search?: string;
	fromDate?: string;
	toDate?: string;
}

export const COMPLAINT_ARTICLE_LABELS: Record<ComplaintArticle, string> = {
	ARTICLE_30: "Article 30 (Minor)",
	ARTICLE_31: "Article 31 (Serious)",
} as const;

export const COMPLAINT_STATUS_LABELS: Record<ComplaintStatus, string> = {
	UNDER_HR_REVIEW: "Under HR Review",
	WAITING_FOR_REBUTTAL: "Waiting for Rebuttal",
	UNDER_HR_ANALYSIS: "Under HR Analysis",
	AWAITING_SUPERIOR_DECISION: "Awaiting Superior Decision",
	WITH_DISCIPLINE_COMMITTEE: "With Discipline Committee",
	COMMITTEE_WAITING_REBUTTAL: "Committee: Awaiting Rebuttal",
	COMMITTEE_ANALYSIS: "Committee: Under Analysis",
	INVESTIGATION_COMPLETE: "Investigation Complete",
	FORWARDED_TO_HQ: "Forwarded to HQ",
	AWAITING_HQ_DECISION: "Awaiting HQ Decision",
	DECIDED: "Decided",
	DECIDED_BY_HQ: "Decided by HQ",
	ON_APPEAL: "On Appeal",
	APPEAL_DECIDED: "Appeal Decided",
	CLOSED_NO_LIABILITY: "Closed (No Liability)",
	CLOSED_FINAL: "Closed (Final)",
} as const;

export const COMPLAINT_FINDING_LABELS: Record<ComplaintFinding, string> = {
	PENDING: "Pending",
	GUILTY: "Guilty",
	GUILTY_NO_REBUTTAL: "Guilty (No Rebuttal)",
	NOT_GUILTY: "Not Guilty",
} as const;

export const COMPLAINANT_TYPE_LABELS: Record<ComplainantType, string> = {
	EMPLOYEE: "Internal Employee",
	EXTERNAL: "External",
	ANONYMOUS: "Anonymous",
} as const;

export const DECISION_AUTHORITY_LABELS: Record<DecisionAuthority, string> = {
	DIRECT_SUPERIOR: "Direct Superior",
	DISCIPLINE_COMMITTEE: "Discipline Committee",
} as const;

export const APPEAL_DECISION_LABELS: Record<AppealDecision, string> = {
	UPHELD: "Upheld",
	MODIFIED: "Modified",
	OVERTURNED: "Overturned",
} as const;

export const COMPLAINT_STATUS_COLORS: Record<ComplaintStatus, string> = {
	UNDER_HR_REVIEW: "bg-blue-100 text-blue-800",
	WAITING_FOR_REBUTTAL: "bg-yellow-100 text-yellow-800",
	UNDER_HR_ANALYSIS: "bg-purple-100 text-purple-800",
	AWAITING_SUPERIOR_DECISION: "bg-orange-100 text-orange-800",
	WITH_DISCIPLINE_COMMITTEE: "bg-indigo-100 text-indigo-800",
	COMMITTEE_WAITING_REBUTTAL: "bg-yellow-100 text-yellow-800",
	COMMITTEE_ANALYSIS: "bg-purple-100 text-purple-800",
	INVESTIGATION_COMPLETE: "bg-teal-100 text-teal-800",
	FORWARDED_TO_HQ: "bg-cyan-100 text-cyan-800",
	AWAITING_HQ_DECISION: "bg-orange-100 text-orange-800",
	DECIDED: "bg-green-100 text-green-800",
	DECIDED_BY_HQ: "bg-green-100 text-green-800",
	ON_APPEAL: "bg-amber-100 text-amber-800",
	APPEAL_DECIDED: "bg-emerald-100 text-emerald-800",
	CLOSED_NO_LIABILITY: "bg-gray-100 text-gray-800",
	CLOSED_FINAL: "bg-gray-100 text-gray-800",
} as const;

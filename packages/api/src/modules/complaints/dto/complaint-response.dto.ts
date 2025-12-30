import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
	AppealDecision,
	ComplainantType,
	ComplaintArticle,
	ComplaintDocumentType,
	ComplaintFinding,
	ComplaintStatus,
	DecisionAuthority,
} from "@prisma/client";

export class ComplaintTimelineResponseDto {
	@ApiProperty({ description: "Timeline entry ID", example: "clx1234567890timeline" })
	id: string;

	@ApiProperty({ description: "Action performed", example: "REGISTERED" })
	action: string;

	@ApiPropertyOptional({
		description: "Status before the action",
		enum: ComplaintStatus,
		enumName: "ComplaintStatus",
	})
	fromStatus?: ComplaintStatus;

	@ApiPropertyOptional({
		description: "Status after the action",
		enum: ComplaintStatus,
		enumName: "ComplaintStatus",
	})
	toStatus?: ComplaintStatus;

	@ApiProperty({ description: "User ID who performed the action", example: "clx1234567890user" })
	performedBy: string;

	@ApiProperty({ description: "When the action was performed", example: "2025-01-20T10:30:00Z" })
	performedAt: Date;

	@ApiPropertyOptional({ description: "Additional notes", example: "Complaint registered by HR officer" })
	notes?: string;

	@ApiPropertyOptional({ description: "Path to supporting document" })
	documentPath?: string;
}

export class ComplaintDocumentResponseDto {
	@ApiProperty({ description: "Document ID", example: "clx1234567890doc" })
	id: string;

	@ApiProperty({
		description: "Type of document",
		enum: ComplaintDocumentType,
		enumName: "ComplaintDocumentType",
	})
	documentType: ComplaintDocumentType;

	@ApiProperty({ description: "Document title", example: "Initial Evidence Report" })
	title: string;

	@ApiPropertyOptional({ description: "Document description" })
	description?: string;

	@ApiProperty({ description: "File path" })
	filePath: string;

	@ApiProperty({ description: "Original file name", example: "evidence.pdf" })
	fileName: string;

	@ApiProperty({ description: "File size in bytes", example: 102400 })
	fileSize: number;

	@ApiProperty({ description: "MIME type", example: "application/pdf" })
	mimeType: string;

	@ApiProperty({ description: "User ID who uploaded", example: "clx1234567890user" })
	uploadedBy: string;

	@ApiProperty({ description: "Upload timestamp", example: "2025-01-20T10:30:00Z" })
	uploadedAt: Date;
}

export class ComplaintAppealResponseDto {
	@ApiProperty({ description: "Appeal ID", example: "clx1234567890appeal" })
	id: string;

	@ApiProperty({ description: "Appeal level (1-4)", example: 1 })
	appealLevel: number;

	@ApiProperty({ description: "Appeal submission date", example: "2025-02-05" })
	appealDate: Date;

	@ApiProperty({ description: "Reason for appeal" })
	appealReason: string;

	@ApiPropertyOptional({ description: "Path to appeal document" })
	appealDocumentPath?: string;

	@ApiPropertyOptional({ description: "User ID who reviewed the appeal" })
	reviewedBy?: string;

	@ApiPropertyOptional({ description: "When the appeal was reviewed" })
	reviewedAt?: Date;

	@ApiProperty({
		description: "Appeal decision",
		enum: AppealDecision,
		enumName: "AppealDecision",
	})
	decision: AppealDecision;

	@ApiPropertyOptional({ description: "Reason for the decision" })
	decisionReason?: string;

	@ApiPropertyOptional({ description: "New punishment if modified" })
	newPunishment?: string;

	@ApiPropertyOptional({ description: "Path to decision document" })
	decisionDocumentPath?: string;

	@ApiProperty({ description: "Created timestamp" })
	createdAt: Date;

	@ApiProperty({ description: "Updated timestamp" })
	updatedAt: Date;
}

export class AccusedEmployeeMinimalDto {
	@ApiProperty({ description: "Employee ID", example: "clx1234567890employee" })
	id: string;

	@ApiProperty({ description: "Employee ID code", example: "FPC-0001/25" })
	employeeId: string;

	@ApiProperty({ description: "Full name in English", example: "John Doe" })
	fullName: string;

	@ApiPropertyOptional({ description: "Full name in Amharic" })
	fullNameAm?: string;
}

export class ComplaintResponseDto {
	@ApiProperty({ description: "Complaint ID", example: "clx1234567890complaint" })
	id: string;

	@ApiProperty({ description: "Tenant ID", example: "clx1234567890tenant" })
	tenantId: string;

	@ApiProperty({ description: "Center ID where registered", example: "clx1234567890center" })
	centerId: string;

	@ApiProperty({ description: "Unique complaint number", example: "CMP-0001/25" })
	complaintNumber: string;

	@ApiProperty({
		description: "Article type",
		enum: ComplaintArticle,
		enumName: "ComplaintArticle",
	})
	article: ComplaintArticle;

	@ApiProperty({ description: "Offense code", example: "ART30-001" })
	offenseCode: string;

	@ApiProperty({ description: "Accused employee ID", example: "clx1234567890employee" })
	accusedEmployeeId: string;

	@ApiPropertyOptional({ description: "Accused employee details", type: AccusedEmployeeMinimalDto })
	accusedEmployee?: AccusedEmployeeMinimalDto;

	@ApiPropertyOptional({ description: "Complainant name" })
	complainantName?: string;

	@ApiProperty({
		description: "Complainant type",
		enum: ComplainantType,
		enumName: "ComplainantType",
	})
	complainantType: ComplainantType;

	@ApiPropertyOptional({ description: "Complainant employee ID if internal" })
	complainantEmployeeId?: string;

	@ApiProperty({ description: "Complaint summary" })
	summary: string;

	@ApiPropertyOptional({ description: "Complaint summary in Amharic" })
	summaryAm?: string;

	@ApiProperty({ description: "Incident date", example: "2025-01-15" })
	incidentDate: Date;

	@ApiPropertyOptional({ description: "Incident location" })
	incidentLocation?: string;

	@ApiProperty({ description: "Registration date", example: "2025-01-20" })
	registeredDate: Date;

	@ApiProperty({ description: "User ID who registered", example: "clx1234567890user" })
	registeredBy: string;

	@ApiProperty({
		description: "Current status",
		enum: ComplaintStatus,
		enumName: "ComplaintStatus",
	})
	status: ComplaintStatus;

	@ApiPropertyOptional({ description: "Current assignee ID" })
	currentAssigneeId?: string;

	@ApiPropertyOptional({ description: "Notification date (Article 30)" })
	notificationDate?: Date;

	@ApiPropertyOptional({ description: "Rebuttal deadline (Article 30)" })
	rebuttalDeadline?: Date;

	@ApiPropertyOptional({ description: "Rebuttal received date (Article 30)" })
	rebuttalReceivedDate?: Date;

	@ApiPropertyOptional({ description: "Rebuttal content (Article 30)" })
	rebuttalContent?: string;

	@ApiProperty({ description: "Whether rebuttal was received", example: false })
	hasRebuttal: boolean;

	@ApiPropertyOptional({ description: "Offense occurrence count (1st, 2nd, etc.)", example: 1 })
	offenseOccurrence?: number;

	@ApiPropertyOptional({ description: "Severity level (1-7)", example: 3 })
	severityLevel?: number;

	@ApiPropertyOptional({
		description: "Decision authority",
		enum: DecisionAuthority,
		enumName: "DecisionAuthority",
	})
	decisionAuthority?: DecisionAuthority;

	@ApiPropertyOptional({ description: "Superior employee ID (Article 30)" })
	superiorEmployeeId?: string;

	@ApiPropertyOptional({ description: "Superior decision date (Article 30)" })
	superiorDecisionDate?: Date;

	@ApiPropertyOptional({ description: "Punishment percentage (Article 30)", example: 10 })
	punishmentPercentage?: number;

	@ApiPropertyOptional({ description: "Punishment description" })
	punishmentDescription?: string;

	@ApiPropertyOptional({ description: "Assigned committee ID (Article 31)" })
	assignedCommitteeId?: string;

	@ApiPropertyOptional({ description: "Committee assignment date (Article 31)" })
	committeeAssignedDate?: Date;

	@ApiPropertyOptional({ description: "HQ committee ID (Article 31)" })
	hqCommitteeId?: string;

	@ApiPropertyOptional({ description: "HQ forwarded date (Article 31)" })
	hqForwardedDate?: Date;

	@ApiProperty({
		description: "Finding/verdict",
		enum: ComplaintFinding,
		enumName: "ComplaintFinding",
	})
	finding: ComplaintFinding;

	@ApiPropertyOptional({ description: "Finding date" })
	findingDate?: Date;

	@ApiPropertyOptional({ description: "Finding reason" })
	findingReason?: string;

	@ApiPropertyOptional({ description: "User ID who made the finding" })
	findingBy?: string;

	@ApiPropertyOptional({ description: "Decision date" })
	decisionDate?: Date;

	@ApiPropertyOptional({ description: "User ID who made the decision" })
	decisionBy?: string;

	@ApiPropertyOptional({ description: "Path to decision document" })
	decisionDocumentPath?: string;

	@ApiPropertyOptional({ description: "Closed date" })
	closedDate?: Date;

	@ApiPropertyOptional({ description: "User ID who closed" })
	closedBy?: string;

	@ApiPropertyOptional({ description: "Closure reason" })
	closureReason?: string;

	@ApiProperty({ description: "Created timestamp" })
	createdAt: Date;

	@ApiProperty({ description: "Updated timestamp" })
	updatedAt: Date;

	@ApiPropertyOptional({ description: "Timeline entries", type: [ComplaintTimelineResponseDto] })
	timeline?: ComplaintTimelineResponseDto[];

	@ApiPropertyOptional({ description: "Documents", type: [ComplaintDocumentResponseDto] })
	documents?: ComplaintDocumentResponseDto[];

	@ApiPropertyOptional({ description: "Appeals", type: [ComplaintAppealResponseDto] })
	appeals?: ComplaintAppealResponseDto[];
}

export class ComplaintListResponseDto {
	@ApiProperty({ description: "Complaint ID", example: "clx1234567890complaint" })
	id: string;

	@ApiProperty({ description: "Unique complaint number", example: "CMP-0001/25" })
	complaintNumber: string;

	@ApiProperty({
		description: "Article type",
		enum: ComplaintArticle,
		enumName: "ComplaintArticle",
	})
	article: ComplaintArticle;

	@ApiProperty({ description: "Offense code", example: "ART30-001" })
	offenseCode: string;

	@ApiPropertyOptional({ description: "Accused employee details", type: AccusedEmployeeMinimalDto })
	accusedEmployee?: AccusedEmployeeMinimalDto;

	@ApiProperty({
		description: "Current status",
		enum: ComplaintStatus,
		enumName: "ComplaintStatus",
	})
	status: ComplaintStatus;

	@ApiProperty({
		description: "Finding/verdict",
		enum: ComplaintFinding,
		enumName: "ComplaintFinding",
	})
	finding: ComplaintFinding;

	@ApiProperty({ description: "Incident date", example: "2025-01-15" })
	incidentDate: Date;

	@ApiProperty({ description: "Registration date", example: "2025-01-20" })
	registeredDate: Date;

	@ApiProperty({ description: "Created timestamp" })
	createdAt: Date;
}

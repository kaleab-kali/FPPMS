import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { DocumentDirection } from "@prisma/client";

export class DocumentAttachmentResponseDto {
	@ApiProperty({ description: "Attachment ID" })
	id: string;

	@ApiProperty({ description: "File path" })
	filePath: string;

	@ApiProperty({ description: "File name" })
	fileName: string;

	@ApiProperty({ description: "File size in bytes" })
	fileSize: number;

	@ApiProperty({ description: "MIME type" })
	mimeType: string;

	@ApiProperty({ description: "Uploaded by user ID" })
	uploadedBy: string;

	@ApiProperty({ description: "Upload timestamp" })
	uploadedAt: Date;
}

export class DocumentResponseDto {
	@ApiProperty({ description: "Document ID" })
	id: string;

	@ApiProperty({ description: "Tenant ID" })
	tenantId: string;

	@ApiProperty({ description: "Document type ID" })
	documentTypeId: string;

	@ApiPropertyOptional({ description: "Document type name" })
	documentTypeName?: string;

	@ApiProperty({ description: "Reference number" })
	referenceNumber: string;

	@ApiProperty({ enum: DocumentDirection, description: "Document direction" })
	direction: DocumentDirection;

	@ApiProperty({ description: "Document date" })
	documentDate: Date;

	@ApiPropertyOptional({ description: "Received date" })
	receivedDate?: Date;

	@ApiPropertyOptional({ description: "Sent date" })
	sentDate?: Date;

	@ApiPropertyOptional({ description: "Source organization" })
	sourceOrganization?: string;

	@ApiPropertyOptional({ description: "Destination organization" })
	destinationOrganization?: string;

	@ApiProperty({ description: "Subject" })
	subject: string;

	@ApiPropertyOptional({ description: "Summary" })
	summary?: string;

	@ApiProperty({ description: "Priority level" })
	priority: string;

	@ApiPropertyOptional({ description: "Action required" })
	actionRequired?: string;

	@ApiPropertyOptional({ description: "Deadline" })
	deadline?: Date;

	@ApiPropertyOptional({ description: "Assigned to user ID" })
	assignedTo?: string;

	@ApiPropertyOptional({ description: "Assigned department ID" })
	assignedDepartmentId?: string;

	@ApiPropertyOptional({ description: "Assigned department name" })
	assignedDepartmentName?: string;

	@ApiPropertyOptional({ description: "File path" })
	filePath?: string;

	@ApiProperty({ description: "Status" })
	status: string;

	@ApiProperty({ description: "Registered by user ID" })
	registeredBy: string;

	@ApiPropertyOptional({ description: "Folder number" })
	folderNumber?: string;

	@ApiPropertyOptional({ description: "Shelf number" })
	shelfNumber?: string;

	@ApiPropertyOptional({ description: "Office location" })
	officeLocation?: string;

	@ApiPropertyOptional({ description: "Response deadline" })
	responseDeadline?: Date;

	@ApiPropertyOptional({ description: "Response date" })
	responseDate?: Date;

	@ApiProperty({ description: "Is urgent" })
	isUrgent: boolean;

	@ApiPropertyOptional({ description: "Concerned employee ID" })
	concernedEmployeeId?: string;

	@ApiPropertyOptional({ description: "Concerned employee name" })
	concernedEmployeeName?: string;

	@ApiPropertyOptional({ description: "Center ID" })
	centerId?: string;

	@ApiPropertyOptional({ description: "Center name" })
	centerName?: string;

	@ApiPropertyOptional({ description: "Category" })
	category?: string;

	@ApiProperty({ description: "Is overdue" })
	isOverdue: boolean;

	@ApiProperty({ description: "Is response overdue" })
	isResponseOverdue: boolean;

	@ApiPropertyOptional({ description: "Attachments", type: [DocumentAttachmentResponseDto] })
	attachments?: DocumentAttachmentResponseDto[];

	@ApiProperty({ description: "Created at" })
	createdAt: Date;

	@ApiProperty({ description: "Updated at" })
	updatedAt: Date;
}

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { DocumentDirection } from "@prisma/client";
import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateDocumentDto {
	@ApiProperty({ description: "Document type ID" })
	@IsUUID()
	documentTypeId: string;

	@ApiProperty({ enum: DocumentDirection, description: "Document direction (INCOMING or OUTGOING)" })
	@IsEnum(DocumentDirection)
	direction: DocumentDirection;

	@ApiProperty({ description: "Document date (YYYY-MM-DD)" })
	@IsDateString()
	documentDate: string;

	@ApiPropertyOptional({ description: "Received date for incoming documents (YYYY-MM-DD)" })
	@IsDateString()
	@IsOptional()
	receivedDate?: string;

	@ApiPropertyOptional({ description: "Sent date for outgoing documents (YYYY-MM-DD)" })
	@IsDateString()
	@IsOptional()
	sentDate?: string;

	@ApiPropertyOptional({ description: "Source organization for incoming documents" })
	@IsString()
	@IsOptional()
	sourceOrganization?: string;

	@ApiPropertyOptional({ description: "Destination organization for outgoing documents" })
	@IsString()
	@IsOptional()
	destinationOrganization?: string;

	@ApiProperty({ description: "Document subject" })
	@IsString()
	subject: string;

	@ApiPropertyOptional({ description: "Document summary" })
	@IsString()
	@IsOptional()
	summary?: string;

	@ApiPropertyOptional({ description: "Priority level", default: "NORMAL" })
	@IsString()
	@IsOptional()
	priority?: string;

	@ApiPropertyOptional({ description: "Action required" })
	@IsString()
	@IsOptional()
	actionRequired?: string;

	@ApiPropertyOptional({ description: "Deadline for action (YYYY-MM-DD)" })
	@IsDateString()
	@IsOptional()
	deadline?: string;

	@ApiPropertyOptional({ description: "Assigned to user ID" })
	@IsString()
	@IsOptional()
	assignedTo?: string;

	@ApiPropertyOptional({ description: "Assigned department ID" })
	@IsUUID()
	@IsOptional()
	assignedDepartmentId?: string;

	@ApiPropertyOptional({ description: "File path for main document" })
	@IsString()
	@IsOptional()
	filePath?: string;

	@ApiPropertyOptional({ description: "Folder number for physical storage" })
	@IsString()
	@IsOptional()
	folderNumber?: string;

	@ApiPropertyOptional({ description: "Shelf number for physical storage" })
	@IsString()
	@IsOptional()
	shelfNumber?: string;

	@ApiPropertyOptional({ description: "Office location for physical storage" })
	@IsString()
	@IsOptional()
	officeLocation?: string;

	@ApiPropertyOptional({ description: "Response deadline (YYYY-MM-DD)" })
	@IsDateString()
	@IsOptional()
	responseDeadline?: string;

	@ApiPropertyOptional({ description: "Is urgent document" })
	@IsBoolean()
	@IsOptional()
	isUrgent?: boolean;

	@ApiPropertyOptional({ description: "Concerned employee ID" })
	@IsUUID()
	@IsOptional()
	concernedEmployeeId?: string;

	@ApiPropertyOptional({ description: "Center ID" })
	@IsUUID()
	@IsOptional()
	centerId?: string;

	@ApiPropertyOptional({ description: "Document category (LEGAL, HR, FINANCE, OPERATIONS, etc.)" })
	@IsString()
	@IsOptional()
	category?: string;
}

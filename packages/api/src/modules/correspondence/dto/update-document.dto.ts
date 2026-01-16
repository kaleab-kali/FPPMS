import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsDateString, IsOptional, IsString, IsUUID } from "class-validator";

export class UpdateDocumentDto {
	@ApiPropertyOptional({ description: "Document subject" })
	@IsString()
	@IsOptional()
	subject?: string;

	@ApiPropertyOptional({ description: "Document summary" })
	@IsString()
	@IsOptional()
	summary?: string;

	@ApiPropertyOptional({ description: "Priority level" })
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

	@ApiPropertyOptional({ description: "Document status" })
	@IsString()
	@IsOptional()
	status?: string;

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

	@ApiPropertyOptional({ description: "Response date (YYYY-MM-DD)" })
	@IsDateString()
	@IsOptional()
	responseDate?: string;

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

	@ApiPropertyOptional({ description: "Document category" })
	@IsString()
	@IsOptional()
	category?: string;
}

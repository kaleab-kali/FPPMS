import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsUUID, IsArray, IsNotEmpty } from "class-validator";

export class AssignSuperiorDto {
	@ApiProperty({ description: "Employee ID of the superior (e.g., FPC-0001/25)" })
	@IsString()
	@IsNotEmpty()
	superiorId: string;

	@ApiProperty({ description: "Effective date of assignment" })
	@IsString()
	@IsNotEmpty()
	effectiveDate: string;

	@ApiPropertyOptional({ description: "Reason for assignment" })
	@IsOptional()
	@IsString()
	reason?: string;

	@ApiPropertyOptional({ description: "Additional remarks" })
	@IsOptional()
	@IsString()
	remarks?: string;
}

export class BulkAssignSuperiorDto {
	@ApiProperty({ description: "List of employee IDs to assign (e.g., FPC-0001/25)", type: [String] })
	@IsArray()
	@IsString({ each: true })
	employeeIds: string[];

	@ApiProperty({ description: "Employee ID of the superior (e.g., FPC-0001/25)" })
	@IsString()
	@IsNotEmpty()
	superiorId: string;

	@ApiProperty({ description: "Effective date of assignment" })
	@IsString()
	effectiveDate: string;

	@ApiPropertyOptional({ description: "Reason for assignment" })
	@IsOptional()
	@IsString()
	reason?: string;

	@ApiPropertyOptional({ description: "Additional remarks" })
	@IsOptional()
	@IsString()
	remarks?: string;
}

export class RemoveSuperiorDto {
	@ApiProperty({ description: "Effective date of removal" })
	@IsString()
	effectiveDate: string;

	@ApiPropertyOptional({ description: "Reason for removal" })
	@IsOptional()
	@IsString()
	reason?: string;

	@ApiPropertyOptional({ description: "Additional remarks" })
	@IsOptional()
	@IsString()
	remarks?: string;
}

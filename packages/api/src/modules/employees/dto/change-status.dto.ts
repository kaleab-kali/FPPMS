import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { EmployeeStatus } from "@prisma/client";
import { Type } from "class-transformer";
import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

const ARCHIVE_STATUSES = [
	EmployeeStatus.TERMINATED,
	EmployeeStatus.RETIRED,
	EmployeeStatus.SUSPENDED,
	EmployeeStatus.DECEASED,
] as const;

type ArchiveStatus = (typeof ARCHIVE_STATUSES)[number];

export class ChangeEmployeeStatusDto {
	@ApiProperty({
		enum: ARCHIVE_STATUSES,
		description: "New status for the employee",
		example: EmployeeStatus.TERMINATED,
	})
	@IsEnum(ARCHIVE_STATUSES, {
		message: "Status must be one of: TERMINATED, RETIRED, SUSPENDED, DECEASED",
	})
	@IsNotEmpty()
	status: ArchiveStatus;

	@ApiProperty({ description: "Reason for the status change" })
	@IsString()
	@IsNotEmpty()
	@MaxLength(500)
	reason: string;

	@ApiProperty({ description: "Effective date of the status change" })
	@IsDate()
	@Type(() => Date)
	@IsNotEmpty()
	effectiveDate: Date;

	@ApiPropertyOptional({ description: "End date (required for SUSPENDED status)" })
	@IsOptional()
	@IsDate()
	@Type(() => Date)
	endDate?: Date;

	@ApiPropertyOptional({ description: "Additional notes" })
	@IsOptional()
	@IsString()
	@MaxLength(1000)
	notes?: string;
}

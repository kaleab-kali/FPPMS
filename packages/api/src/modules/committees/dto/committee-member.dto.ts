import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CommitteeMemberRole } from "@prisma/client";
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";

export class AddCommitteeMemberDto {
	@ApiProperty({ description: "Employee ID (UUID) to add as member" })
	@IsUUID()
	@IsNotEmpty()
	employeeId: string;

	@ApiProperty({ description: "Member role in the committee", enum: CommitteeMemberRole })
	@IsEnum(CommitteeMemberRole)
	@IsNotEmpty()
	role: CommitteeMemberRole;

	@ApiProperty({ description: "Date of appointment (ISO date string)", example: "2025-01-01" })
	@IsDateString()
	@IsNotEmpty()
	appointedDate: string;
}

export class UpdateCommitteeMemberDto {
	@ApiPropertyOptional({ description: "Member role in the committee", enum: CommitteeMemberRole })
	@IsEnum(CommitteeMemberRole)
	@IsOptional()
	role?: CommitteeMemberRole;
}

export class RemoveCommitteeMemberDto {
	@ApiProperty({ description: "End date of membership (ISO date string)", example: "2025-12-31" })
	@IsDateString()
	@IsNotEmpty()
	endDate: string;

	@ApiPropertyOptional({ description: "Reason for removal" })
	@IsString()
	@IsOptional()
	@MaxLength(500)
	removalReason?: string;
}

export class BulkAddMembersDto {
	@ApiProperty({ description: "Array of employee IDs (UUIDs) to add as members", type: [String] })
	@IsUUID("4", { each: true })
	@IsNotEmpty()
	employeeIds: string[];

	@ApiProperty({ description: "Member role for all added members", enum: CommitteeMemberRole })
	@IsEnum(CommitteeMemberRole)
	@IsNotEmpty()
	role: CommitteeMemberRole;

	@ApiProperty({ description: "Date of appointment for all members (ISO date string)", example: "2025-01-01" })
	@IsDateString()
	@IsNotEmpty()
	appointedDate: string;
}

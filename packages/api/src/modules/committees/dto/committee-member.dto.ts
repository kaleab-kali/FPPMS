import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CommitteeMemberRole } from "@prisma/client";
import {
	ArrayNotEmpty,
	IsArray,
	IsDateString,
	IsEnum,
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsString,
	Max,
	MaxLength,
	Min,
} from "class-validator";

export class AddCommitteeMemberDto {
	@ApiProperty({ description: "Employee ID to add as member" })
	@IsString()
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

	@ApiPropertyOptional({ description: "Term limit in months (default: 24)", example: 24, default: 24 })
	@IsInt()
	@Min(1)
	@Max(120)
	@IsOptional()
	termLimitMonths?: number;
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
	@ApiProperty({ description: "Array of employee IDs to add as members", type: [String] })
	@IsArray()
	@ArrayNotEmpty()
	@IsString({ each: true })
	employeeIds: string[];

	@ApiProperty({ description: "Member role for all added members", enum: CommitteeMemberRole })
	@IsEnum(CommitteeMemberRole)
	@IsNotEmpty()
	role: CommitteeMemberRole;

	@ApiProperty({ description: "Date of appointment for all members (ISO date string)", example: "2025-01-01" })
	@IsDateString()
	@IsNotEmpty()
	appointedDate: string;

	@ApiPropertyOptional({ description: "Term limit in months for all members (default: 24)", example: 24, default: 24 })
	@IsInt()
	@Min(1)
	@Max(120)
	@IsOptional()
	termLimitMonths?: number;
}

export class RenewMemberTermDto {
	@ApiProperty({ description: "Start date of new term (ISO date string)", example: "2027-01-01" })
	@IsDateString()
	@IsNotEmpty()
	newTermStartDate: string;

	@ApiPropertyOptional({ description: "Term limit in months for the new term (default: same as previous)", example: 24 })
	@IsInt()
	@Min(1)
	@Max(120)
	@IsOptional()
	termLimitMonths?: number;

	@ApiPropertyOptional({ description: "Notes about the renewal" })
	@IsString()
	@IsOptional()
	@MaxLength(500)
	notes?: string;
}

export class TerminateMemberTermDto {
	@ApiProperty({ description: "Date of termination (ISO date string)", example: "2026-06-15" })
	@IsDateString()
	@IsNotEmpty()
	terminatedDate: string;

	@ApiProperty({ description: "Reason for early termination" })
	@IsString()
	@IsNotEmpty()
	@MaxLength(500)
	terminatedReason: string;
}

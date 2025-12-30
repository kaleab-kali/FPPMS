import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CommitteeStatus } from "@prisma/client";
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateCommitteeDto {
	@ApiProperty({ description: "Committee type ID" })
	@IsString()
	@IsNotEmpty()
	committeeTypeId: string;

	@ApiPropertyOptional({ description: "Center ID - null for HQ level committees" })
	@IsString()
	@IsOptional()
	centerId?: string;

	@ApiProperty({ description: "Unique committee code", example: "DISC-CTR-001" })
	@IsString()
	@IsNotEmpty()
	@MaxLength(50)
	code: string;

	@ApiProperty({ description: "Committee name in English", example: "Addis Ababa Center Discipline Committee" })
	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	name: string;

	@ApiPropertyOptional({ description: "Committee name in Amharic" })
	@IsString()
	@IsOptional()
	@MaxLength(100)
	nameAm?: string;

	@ApiPropertyOptional({ description: "Description in English" })
	@IsString()
	@IsOptional()
	@MaxLength(500)
	description?: string;

	@ApiPropertyOptional({ description: "Description in Amharic" })
	@IsString()
	@IsOptional()
	@MaxLength(500)
	descriptionAm?: string;

	@ApiProperty({ description: "Date the committee was established (ISO date string)", example: "2025-01-01" })
	@IsDateString()
	@IsNotEmpty()
	establishedDate: string;
}

export class UpdateCommitteeDto {
	@ApiPropertyOptional({ description: "Committee name in English" })
	@IsString()
	@IsOptional()
	@MaxLength(100)
	name?: string;

	@ApiPropertyOptional({ description: "Committee name in Amharic" })
	@IsString()
	@IsOptional()
	@MaxLength(100)
	nameAm?: string;

	@ApiPropertyOptional({ description: "Description in English" })
	@IsString()
	@IsOptional()
	@MaxLength(500)
	description?: string;

	@ApiPropertyOptional({ description: "Description in Amharic" })
	@IsString()
	@IsOptional()
	@MaxLength(500)
	descriptionAm?: string;
}

export class SuspendCommitteeDto {
	@ApiPropertyOptional({ description: "Reason for suspension" })
	@IsString()
	@IsOptional()
	@MaxLength(500)
	reason?: string;
}

export class ReactivateCommitteeDto {
	@ApiPropertyOptional({ description: "Reason for reactivation" })
	@IsString()
	@IsOptional()
	@MaxLength(500)
	reason?: string;
}

export class DissolveCommitteeDto {
	@ApiProperty({ description: "Date the committee was dissolved (ISO date string)", example: "2025-12-31" })
	@IsDateString()
	@IsNotEmpty()
	dissolvedDate: string;

	@ApiProperty({ description: "Reason for dissolving the committee" })
	@IsString()
	@IsNotEmpty()
	@MaxLength(500)
	dissolvedReason: string;
}

export class CommitteeFilterDto {
	@ApiPropertyOptional({ description: "Filter by committee type ID" })
	@IsString()
	@IsOptional()
	committeeTypeId?: string;

	@ApiPropertyOptional({ description: "Filter by center ID" })
	@IsString()
	@IsOptional()
	centerId?: string;

	@ApiPropertyOptional({ description: "Filter by status", enum: CommitteeStatus })
	@IsEnum(CommitteeStatus)
	@IsOptional()
	status?: CommitteeStatus;

	@ApiPropertyOptional({ description: "Search by name or code" })
	@IsString()
	@IsOptional()
	search?: string;
}

class CommitteeTypeMinimalDto {
	@ApiProperty({ description: "Committee type ID" })
	id: string;

	@ApiProperty({ description: "Committee type code" })
	code: string;

	@ApiProperty({ description: "Committee type name" })
	name: string;

	@ApiPropertyOptional({ description: "Committee type name in Amharic" })
	nameAm: string | null;

	@ApiProperty({ description: "Whether this committee type is permanent" })
	isPermanent: boolean;
}

class CenterMinimalDto {
	@ApiProperty({ description: "Center ID" })
	id: string;

	@ApiProperty({ description: "Center code" })
	code: string;

	@ApiProperty({ description: "Center name" })
	name: string;

	@ApiPropertyOptional({ description: "Center name in Amharic" })
	nameAm: string | null;
}

class PositionMinimalDto {
	@ApiProperty({ description: "Position ID" })
	id: string;

	@ApiProperty({ description: "Position name" })
	name: string;

	@ApiPropertyOptional({ description: "Position name in Amharic" })
	nameAm: string | null;
}

class EmployeeMinimalDto {
	@ApiProperty({ description: "Employee UUID" })
	id: string;

	@ApiProperty({ description: "Employee ID (e.g., FPC-0001/25)" })
	employeeId: string;

	@ApiProperty({ description: "Full name in English" })
	fullName: string;

	@ApiPropertyOptional({ description: "Full name in Amharic" })
	fullNameAm: string | null;

	@ApiPropertyOptional({ description: "Employee position", type: PositionMinimalDto })
	position?: PositionMinimalDto | null;
}

export class CommitteeMemberResponseDto {
	@ApiProperty({ description: "Member record ID (UUID)" })
	id: string;

	@ApiProperty({ description: "Tenant ID" })
	tenantId: string;

	@ApiProperty({ description: "Committee ID" })
	committeeId: string;

	@ApiProperty({ description: "Employee ID" })
	employeeId: string;

	@ApiProperty({ description: "Member role (CHAIRMAN, VICE_CHAIRMAN, SECRETARY, MEMBER, ADVISOR)" })
	role: string;

	@ApiProperty({ description: "Date appointed to the committee" })
	appointedDate: Date;

	@ApiPropertyOptional({ description: "Date membership ended" })
	endDate: Date | null;

	@ApiProperty({ description: "User ID who appointed this member" })
	appointedBy: string;

	@ApiPropertyOptional({ description: "User ID who removed this member" })
	removedBy: string | null;

	@ApiPropertyOptional({ description: "Reason for removal" })
	removalReason: string | null;

	@ApiProperty({ description: "Whether the membership is active" })
	isActive: boolean;

	@ApiProperty({ description: "Creation timestamp" })
	createdAt: Date;

	@ApiProperty({ description: "Last update timestamp" })
	updatedAt: Date;

	@ApiPropertyOptional({ description: "Employee details", type: EmployeeMinimalDto })
	employee?: EmployeeMinimalDto;
}

export class CommitteeResponseDto {
	@ApiProperty({ description: "Committee ID (UUID)" })
	id: string;

	@ApiProperty({ description: "Tenant ID" })
	tenantId: string;

	@ApiProperty({ description: "Committee type ID" })
	committeeTypeId: string;

	@ApiPropertyOptional({ description: "Center ID (null for HQ level)" })
	centerId: string | null;

	@ApiProperty({ description: "Unique committee code" })
	code: string;

	@ApiProperty({ description: "Committee name in English" })
	name: string;

	@ApiPropertyOptional({ description: "Committee name in Amharic" })
	nameAm: string | null;

	@ApiPropertyOptional({ description: "Description in English" })
	description: string | null;

	@ApiPropertyOptional({ description: "Description in Amharic" })
	descriptionAm: string | null;

	@ApiProperty({ description: "Committee status", enum: CommitteeStatus })
	status: CommitteeStatus;

	@ApiProperty({ description: "Date the committee was established" })
	establishedDate: Date;

	@ApiPropertyOptional({ description: "Date the committee was dissolved" })
	dissolvedDate: Date | null;

	@ApiPropertyOptional({ description: "Reason for dissolution" })
	dissolvedReason: string | null;

	@ApiProperty({ description: "User ID who established the committee" })
	establishedBy: string;

	@ApiPropertyOptional({ description: "User ID who dissolved the committee" })
	dissolvedBy: string | null;

	@ApiProperty({ description: "Whether the committee is active" })
	isActive: boolean;

	@ApiProperty({ description: "Creation timestamp" })
	createdAt: Date;

	@ApiProperty({ description: "Last update timestamp" })
	updatedAt: Date;

	@ApiPropertyOptional({ description: "Committee type details", type: CommitteeTypeMinimalDto })
	committeeType?: CommitteeTypeMinimalDto;

	@ApiPropertyOptional({ description: "Center details", type: CenterMinimalDto })
	center?: CenterMinimalDto | null;

	@ApiPropertyOptional({ description: "Number of active members" })
	memberCount?: number;

	@ApiPropertyOptional({ description: "List of committee members", type: [CommitteeMemberResponseDto] })
	members?: CommitteeMemberResponseDto[];
}

export class CommitteeHistoryResponseDto {
	@ApiProperty({ description: "History record ID (UUID)" })
	id: string;

	@ApiProperty({ description: "Tenant ID" })
	tenantId: string;

	@ApiProperty({ description: "Committee ID" })
	committeeId: string;

	@ApiProperty({ description: "Action performed (e.g., CREATED, UPDATED, MEMBER_ADDED)" })
	action: string;

	@ApiPropertyOptional({ description: "Previous value (JSON)" })
	previousValue: unknown;

	@ApiPropertyOptional({ description: "New value (JSON)" })
	newValue: unknown;

	@ApiProperty({ description: "User ID who performed the action" })
	performedBy: string;

	@ApiProperty({ description: "Timestamp of the action" })
	performedAt: Date;

	@ApiPropertyOptional({ description: "Additional notes" })
	notes: string | null;

	@ApiPropertyOptional({ description: "IP address of the user" })
	ipAddress: string | null;
}

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

export class CreateCommitteeTypeDto {
	@ApiProperty({ description: "Unique code for the committee type", example: "DISC-CENTER" })
	@IsString()
	@IsNotEmpty()
	@MaxLength(50)
	code: string;

	@ApiProperty({ description: "Name in English", example: "Center Discipline Committee" })
	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	name: string;

	@ApiPropertyOptional({ description: "Name in Amharic", example: "የማዕከል ዲሲፕሊን ኮሚቴ" })
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

	@ApiPropertyOptional({ description: "Whether this committee type cannot be dissolved", default: false })
	@IsBoolean()
	@IsOptional()
	isPermanent?: boolean;

	@ApiPropertyOptional({ description: "Whether each center must have this committee type", default: false })
	@IsBoolean()
	@IsOptional()
	requiresCenter?: boolean;

	@ApiPropertyOptional({ description: "Minimum number of members required", default: 3 })
	@IsInt()
	@Min(1)
	@Max(50)
	@IsOptional()
	minMembers?: number;

	@ApiPropertyOptional({ description: "Maximum number of members allowed" })
	@IsInt()
	@Min(1)
	@Max(100)
	@IsOptional()
	maxMembers?: number;
}

export class UpdateCommitteeTypeDto {
	@ApiPropertyOptional({ description: "Name in English" })
	@IsString()
	@IsOptional()
	@MaxLength(100)
	name?: string;

	@ApiPropertyOptional({ description: "Name in Amharic" })
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

	@ApiPropertyOptional({ description: "Whether this committee type cannot be dissolved" })
	@IsBoolean()
	@IsOptional()
	isPermanent?: boolean;

	@ApiPropertyOptional({ description: "Whether each center must have this committee type" })
	@IsBoolean()
	@IsOptional()
	requiresCenter?: boolean;

	@ApiPropertyOptional({ description: "Minimum number of members required" })
	@IsInt()
	@Min(1)
	@Max(50)
	@IsOptional()
	minMembers?: number;

	@ApiPropertyOptional({ description: "Maximum number of members allowed" })
	@IsInt()
	@Min(1)
	@Max(100)
	@IsOptional()
	maxMembers?: number;

	@ApiPropertyOptional({ description: "Whether the committee type is active" })
	@IsBoolean()
	@IsOptional()
	isActive?: boolean;
}

export class CommitteeTypeResponseDto {
	@ApiProperty({ description: "Committee type ID (UUID)" })
	id: string;

	@ApiProperty({ description: "Tenant ID" })
	tenantId: string;

	@ApiProperty({ description: "Unique code" })
	code: string;

	@ApiProperty({ description: "Name in English" })
	name: string;

	@ApiPropertyOptional({ description: "Name in Amharic" })
	nameAm: string | null;

	@ApiPropertyOptional({ description: "Description in English" })
	description: string | null;

	@ApiPropertyOptional({ description: "Description in Amharic" })
	descriptionAm: string | null;

	@ApiProperty({ description: "Whether this committee type cannot be dissolved" })
	isPermanent: boolean;

	@ApiProperty({ description: "Whether each center must have this committee type" })
	requiresCenter: boolean;

	@ApiProperty({ description: "Minimum number of members required" })
	minMembers: number;

	@ApiPropertyOptional({ description: "Maximum number of members allowed" })
	maxMembers: number | null;

	@ApiProperty({ description: "Whether the committee type is active" })
	isActive: boolean;

	@ApiProperty({ description: "Creation timestamp" })
	createdAt: Date;

	@ApiProperty({ description: "Last update timestamp" })
	updatedAt: Date;

	@ApiPropertyOptional({ description: "Number of committees of this type" })
	committeeCount?: number;
}

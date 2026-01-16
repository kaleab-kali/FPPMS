import { ApiPropertyOptional } from "@nestjs/swagger";
import { WeaponCondition, WeaponStatus } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsBoolean, IsEnum, IsOptional, IsUUID } from "class-validator";
import { PaginationQueryDto } from "#api/common/dto/pagination-query.dto";

export class WeaponFilterDto extends PaginationQueryDto {
	@ApiPropertyOptional({
		description: "Filter by weapon type ID",
		example: "clx1234567890",
	})
	@IsUUID()
	@IsOptional()
	weaponTypeId?: string;

	@ApiPropertyOptional({
		description: "Filter by weapon category ID",
		example: "clx0987654321",
	})
	@IsUUID()
	@IsOptional()
	categoryId?: string;

	@ApiPropertyOptional({
		description: "Filter by center ID",
		example: "clx1111111111",
	})
	@IsUUID()
	@IsOptional()
	centerId?: string;

	@ApiPropertyOptional({
		description: "Filter by weapon status",
		enum: WeaponStatus,
		enumName: "WeaponStatus",
		example: WeaponStatus.IN_SERVICE,
	})
	@IsEnum(WeaponStatus)
	@IsOptional()
	status?: WeaponStatus;

	@ApiPropertyOptional({
		description: "Filter by weapon condition",
		enum: WeaponCondition,
		enumName: "WeaponCondition",
		example: WeaponCondition.GOOD,
	})
	@IsEnum(WeaponCondition)
	@IsOptional()
	condition?: WeaponCondition;

	@ApiPropertyOptional({
		description: "Filter by active status",
		example: true,
	})
	@IsBoolean()
	@Transform(({ value }) => value === "true" || value === true)
	@IsOptional()
	isActive?: boolean;

	@ApiPropertyOptional({
		description: "Filter weapons due for inspection",
		example: true,
	})
	@IsBoolean()
	@Transform(({ value }) => value === "true" || value === true)
	@IsOptional()
	dueForInspection?: boolean;

	@ApiPropertyOptional({
		description: "Filter weapons currently assigned",
		example: false,
	})
	@IsBoolean()
	@Transform(({ value }) => value === "true" || value === true)
	@IsOptional()
	isAssigned?: boolean;
}

export class WeaponCategoryFilterDto extends PaginationQueryDto {
	@ApiPropertyOptional({
		description: "Filter by active status",
		example: true,
	})
	@IsBoolean()
	@Transform(({ value }) => value === "true" || value === true)
	@IsOptional()
	isActive?: boolean;
}

export class WeaponTypeFilterDto extends PaginationQueryDto {
	@ApiPropertyOptional({
		description: "Filter by category ID",
		example: "clx1234567890",
	})
	@IsUUID()
	@IsOptional()
	categoryId?: string;

	@ApiPropertyOptional({
		description: "Filter by active status",
		example: true,
	})
	@IsBoolean()
	@Transform(({ value }) => value === "true" || value === true)
	@IsOptional()
	isActive?: boolean;
}

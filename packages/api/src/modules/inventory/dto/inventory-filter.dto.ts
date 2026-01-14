import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsOptional, IsUUID } from "class-validator";
import { PaginationQueryDto } from "#api/common/dto/pagination-query.dto";

export class InventoryAssignmentFilterDto extends PaginationQueryDto {
	@ApiPropertyOptional({ description: "Filter by employee ID" })
	@IsUUID()
	@IsOptional()
	employeeId?: string;

	@ApiPropertyOptional({ description: "Filter by center ID" })
	@IsUUID()
	@IsOptional()
	centerId?: string;

	@ApiPropertyOptional({ description: "Filter by item type ID" })
	@IsUUID()
	@IsOptional()
	itemTypeId?: string;

	@ApiPropertyOptional({ description: "Filter by category ID" })
	@IsUUID()
	@IsOptional()
	categoryId?: string;

	@ApiPropertyOptional({ description: "Filter by returned status" })
	@IsBoolean()
	@Transform(({ value }) => value === "true" || value === true)
	@IsOptional()
	isReturned?: boolean;

	@ApiPropertyOptional({ description: "Filter by permanent status" })
	@IsBoolean()
	@Transform(({ value }) => value === "true" || value === true)
	@IsOptional()
	isPermanent?: boolean;

	@ApiPropertyOptional({ description: "Filter by lost status" })
	@IsBoolean()
	@Transform(({ value }) => value === "true" || value === true)
	@IsOptional()
	isLost?: boolean;

	@ApiPropertyOptional({ description: "Filter by damaged status" })
	@IsBoolean()
	@Transform(({ value }) => value === "true" || value === true)
	@IsOptional()
	isDamaged?: boolean;
}

export class CenterInventoryFilterDto extends PaginationQueryDto {
	@ApiPropertyOptional({ description: "Filter by center ID" })
	@IsUUID()
	@IsOptional()
	centerId?: string;

	@ApiPropertyOptional({ description: "Filter by item type ID" })
	@IsUUID()
	@IsOptional()
	itemTypeId?: string;

	@ApiPropertyOptional({ description: "Filter by category ID" })
	@IsUUID()
	@IsOptional()
	categoryId?: string;

	@ApiPropertyOptional({ description: "Filter by low stock status" })
	@IsBoolean()
	@Transform(({ value }) => value === "true" || value === true)
	@IsOptional()
	lowStock?: boolean;
}

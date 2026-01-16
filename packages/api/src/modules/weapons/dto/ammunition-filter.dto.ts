import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsOptional, IsUUID } from "class-validator";
import { PaginationQueryDto } from "#api/common/dto/pagination-query.dto";

export class CenterAmmunitionStockFilterDto extends PaginationQueryDto {
	@ApiPropertyOptional({
		description: "Filter by center ID",
		example: "clx1234567890",
	})
	@IsUUID()
	@IsOptional()
	centerId?: string;

	@ApiPropertyOptional({
		description: "Filter by ammunition type ID",
		example: "clx0987654321",
	})
	@IsUUID()
	@IsOptional()
	ammunitionTypeId?: string;

	@ApiPropertyOptional({
		description: "Filter by low stock status",
		example: true,
	})
	@IsBoolean()
	@Transform(({ value }) => value === "true" || value === true)
	@IsOptional()
	lowStock?: boolean;
}

export class CreateCenterAmmunitionStockDto {
	@ApiPropertyOptional({
		description: "Center ID",
		example: "clx1234567890",
	})
	@IsUUID()
	centerId: string;

	@ApiPropertyOptional({
		description: "Ammunition type ID",
		example: "clx0987654321",
	})
	@IsUUID()
	ammunitionTypeId: string;

	@ApiPropertyOptional({
		description: "Total quantity in stock",
		example: 1000,
	})
	totalQuantity: number;

	@ApiPropertyOptional({
		description: "Minimum stock level for alerts",
		example: 100,
	})
	@IsOptional()
	minStockLevel?: number;

	@ApiPropertyOptional({
		description: "Remarks",
		example: "Initial stock allocation",
	})
	@IsOptional()
	remarks?: string;
}

export class UpdateCenterAmmunitionStockDto {
	@ApiPropertyOptional({
		description: "Total quantity in stock",
		example: 1000,
	})
	@IsOptional()
	totalQuantity?: number;

	@ApiPropertyOptional({
		description: "Minimum stock level for alerts",
		example: 100,
	})
	@IsOptional()
	minStockLevel?: number;

	@ApiPropertyOptional({
		description: "Remarks",
		example: "Stock level updated after inventory count",
	})
	@IsOptional()
	remarks?: string;
}

export class AdjustCenterAmmunitionStockDto {
	@ApiPropertyOptional({
		description: "Quantity to adjust (positive to add, negative to subtract)",
		example: 100,
	})
	adjustment: number;

	@ApiPropertyOptional({
		description: "Reason for adjustment",
		example: "Quarterly restocking",
	})
	@IsOptional()
	reason?: string;
}

export class CenterAmmunitionStockResponseDto {
	@ApiPropertyOptional({
		description: "Unique identifier of the stock record",
		example: "clx1234567890",
	})
	id: string;

	@ApiPropertyOptional({
		description: "Tenant ID",
		example: "clx0987654321",
	})
	tenantId: string;

	@ApiPropertyOptional({
		description: "Center ID",
		example: "clx1111111111",
	})
	centerId: string;

	@ApiPropertyOptional({
		description: "Name of the center",
		example: "Main Headquarters",
	})
	centerName?: string;

	@ApiPropertyOptional({
		description: "Ammunition type ID",
		example: "clx2222222222",
	})
	ammunitionTypeId: string;

	@ApiPropertyOptional({
		description: "Name of the ammunition type",
		example: "9mm Full Metal Jacket",
	})
	ammunitionTypeName?: string;

	@ApiPropertyOptional({
		description: "Name of the ammunition type in Amharic",
		example: "9 ሚሊ ሜትር ጥይት",
	})
	ammunitionTypeNameAm?: string;

	@ApiPropertyOptional({
		description: "Caliber of the ammunition",
		example: "9x19mm Parabellum",
	})
	ammunitionCaliber?: string;

	@ApiPropertyOptional({
		description: "Total quantity in stock",
		example: 1000,
	})
	totalQuantity: number;

	@ApiPropertyOptional({
		description: "Issued quantity",
		example: 200,
	})
	issuedQuantity: number;

	@ApiPropertyOptional({
		description: "Available quantity",
		example: 800,
	})
	availableQuantity: number;

	@ApiPropertyOptional({
		description: "Minimum stock level",
		example: 100,
	})
	minStockLevel?: number;

	@ApiPropertyOptional({
		description: "Whether stock is below minimum level",
		example: false,
	})
	isBelowMinStock: boolean;

	@ApiPropertyOptional({
		description: "Remarks",
		example: "Initial stock allocation",
	})
	remarks?: string;

	@ApiPropertyOptional({
		description: "Creation timestamp",
		example: "2025-01-15T10:30:00.000Z",
	})
	createdAt: Date;

	@ApiPropertyOptional({
		description: "Last update timestamp",
		example: "2025-01-15T10:30:00.000Z",
	})
	updatedAt: Date;
}

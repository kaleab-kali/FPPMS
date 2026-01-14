import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class CreateCenterInventoryDto {
	@ApiProperty({ description: "Center ID" })
	@IsUUID()
	centerId: string;

	@ApiProperty({ description: "Item type ID" })
	@IsUUID()
	itemTypeId: string;

	@ApiProperty({ description: "Total quantity in stock" })
	@IsInt()
	@Min(0)
	totalQuantity: number;

	@ApiPropertyOptional({ description: "Minimum stock level for alerts" })
	@IsInt()
	@Min(0)
	@IsOptional()
	minStockLevel?: number;

	@ApiPropertyOptional({ description: "Remarks" })
	@IsString()
	@IsOptional()
	remarks?: string;
}

export class UpdateCenterInventoryDto {
	@ApiPropertyOptional({ description: "Total quantity in stock" })
	@IsInt()
	@Min(0)
	@IsOptional()
	totalQuantity?: number;

	@ApiPropertyOptional({ description: "Minimum stock level for alerts" })
	@IsInt()
	@Min(0)
	@IsOptional()
	minStockLevel?: number;

	@ApiPropertyOptional({ description: "Remarks" })
	@IsString()
	@IsOptional()
	remarks?: string;
}

export class AdjustCenterInventoryDto {
	@ApiProperty({ description: "Quantity to adjust (positive to add, negative to subtract)" })
	@IsInt()
	adjustment: number;

	@ApiPropertyOptional({ description: "Reason for adjustment" })
	@IsString()
	@IsOptional()
	reason?: string;
}

export class CenterInventoryResponseDto {
	@ApiProperty({ description: "Center inventory ID" })
	id: string;

	@ApiProperty({ description: "Tenant ID" })
	tenantId: string;

	@ApiProperty({ description: "Center ID" })
	centerId: string;

	@ApiPropertyOptional({ description: "Center name" })
	centerName?: string;

	@ApiProperty({ description: "Item type ID" })
	itemTypeId: string;

	@ApiPropertyOptional({ description: "Item type name" })
	itemTypeName?: string;

	@ApiPropertyOptional({ description: "Item type name in Amharic" })
	itemTypeNameAm?: string;

	@ApiPropertyOptional({ description: "Category name" })
	categoryName?: string;

	@ApiProperty({ description: "Total quantity in stock" })
	totalQuantity: number;

	@ApiProperty({ description: "Assigned quantity" })
	assignedQuantity: number;

	@ApiProperty({ description: "Available quantity" })
	availableQuantity: number;

	@ApiPropertyOptional({ description: "Minimum stock level" })
	minStockLevel?: number;

	@ApiProperty({ description: "Is below minimum stock level" })
	isBelowMinStock: boolean;

	@ApiPropertyOptional({ description: "Remarks" })
	remarks?: string;

	@ApiProperty({ description: "Created at" })
	createdAt: Date;

	@ApiProperty({ description: "Updated at" })
	updatedAt: Date;
}

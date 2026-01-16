import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class AmmunitionTypeResponseDto {
	@ApiProperty({
		description: "Unique identifier of the ammunition type",
		example: "clx1234567890",
	})
	id: string;

	@ApiProperty({
		description: "Tenant ID",
		example: "clx0987654321",
	})
	tenantId: string;

	@ApiPropertyOptional({
		description: "ID of the compatible weapon type",
		example: "clx1111111111",
	})
	weaponTypeId?: string;

	@ApiPropertyOptional({
		description: "Name of the compatible weapon type",
		example: "Glock 19",
	})
	weaponTypeName?: string;

	@ApiProperty({
		description: "Unique code for the ammunition type",
		example: "9MM-FMJ",
	})
	code: string;

	@ApiProperty({
		description: "Name of the ammunition type",
		example: "9mm Full Metal Jacket",
	})
	name: string;

	@ApiPropertyOptional({
		description: "Name of the ammunition type in Amharic",
		example: "9 ሚሊ ሜትር ጥይት",
	})
	nameAm?: string;

	@ApiProperty({
		description: "Caliber of the ammunition",
		example: "9x19mm Parabellum",
	})
	caliber: string;

	@ApiPropertyOptional({
		description: "Manufacturer of the ammunition",
		example: "Federal Premium",
	})
	manufacturer?: string;

	@ApiPropertyOptional({
		description: "Description of the ammunition type",
		example: "Standard duty ammunition for law enforcement use",
	})
	description?: string;

	@ApiProperty({
		description: "Whether the ammunition type is active",
		example: true,
	})
	isActive: boolean;

	@ApiProperty({
		description: "Total stock across all centers",
		example: 5000,
	})
	totalStock: number;

	@ApiProperty({
		description: "Creation timestamp",
		example: "2025-01-15T10:30:00.000Z",
	})
	createdAt: Date;

	@ApiProperty({
		description: "Last update timestamp",
		example: "2025-01-15T10:30:00.000Z",
	})
	updatedAt: Date;
}

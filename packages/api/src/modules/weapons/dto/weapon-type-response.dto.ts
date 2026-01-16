import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class WeaponTypeResponseDto {
	@ApiProperty({
		description: "Unique identifier of the weapon type",
		example: "clx1234567890",
	})
	id: string;

	@ApiProperty({
		description: "Tenant ID",
		example: "clx0987654321",
	})
	tenantId: string;

	@ApiProperty({
		description: "ID of the weapon category",
		example: "clx1234567890",
	})
	categoryId: string;

	@ApiPropertyOptional({
		description: "Name of the weapon category",
		example: "Handguns",
	})
	categoryName?: string;

	@ApiProperty({
		description: "Unique code for the weapon type",
		example: "GLK-19",
	})
	code: string;

	@ApiProperty({
		description: "Name of the weapon type",
		example: "Glock 19",
	})
	name: string;

	@ApiPropertyOptional({
		description: "Name of the weapon type in Amharic",
		example: "ግሎክ 19",
	})
	nameAm?: string;

	@ApiPropertyOptional({
		description: "Manufacturer of the weapon",
		example: "Glock Ges.m.b.H.",
	})
	manufacturer?: string;

	@ApiPropertyOptional({
		description: "Model designation",
		example: "Gen 5",
	})
	model?: string;

	@ApiPropertyOptional({
		description: "Caliber of the weapon",
		example: "9mm Parabellum",
	})
	caliber?: string;

	@ApiPropertyOptional({
		description: "Description of the weapon type",
		example: "Compact semi-automatic pistol suitable for duty and concealed carry",
	})
	description?: string;

	@ApiProperty({
		description: "Whether the weapon type is active",
		example: true,
	})
	isActive: boolean;

	@ApiProperty({
		description: "Number of individual weapons of this type",
		example: 25,
	})
	weaponCount: number;

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

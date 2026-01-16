import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class WeaponCategoryResponseDto {
	@ApiProperty({
		description: "Unique identifier of the weapon category",
		example: "clx1234567890",
	})
	id: string;

	@ApiProperty({
		description: "Tenant ID",
		example: "clx0987654321",
	})
	tenantId: string;

	@ApiProperty({
		description: "Unique code for the weapon category",
		example: "HG",
	})
	code: string;

	@ApiProperty({
		description: "Name of the weapon category",
		example: "Handguns",
	})
	name: string;

	@ApiPropertyOptional({
		description: "Name of the weapon category in Amharic",
		example: "የእጅ ሽጉጥ",
	})
	nameAm?: string;

	@ApiPropertyOptional({
		description: "Description of the weapon category",
		example: "All types of handguns including pistols and revolvers",
	})
	description?: string;

	@ApiProperty({
		description: "Whether the category is active",
		example: true,
	})
	isActive: boolean;

	@ApiProperty({
		description: "Number of weapon types in this category",
		example: 5,
	})
	weaponTypeCount: number;

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

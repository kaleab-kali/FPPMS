import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { WeaponCondition, WeaponStatus } from "@prisma/client";

export class WeaponResponseDto {
	@ApiProperty({
		description: "Unique identifier of the weapon",
		example: "clx1234567890",
	})
	id: string;

	@ApiProperty({
		description: "Tenant ID",
		example: "clx0987654321",
	})
	tenantId: string;

	@ApiProperty({
		description: "ID of the weapon type",
		example: "clx1111111111",
	})
	weaponTypeId: string;

	@ApiPropertyOptional({
		description: "Name of the weapon type",
		example: "Glock 19",
	})
	weaponTypeName?: string;

	@ApiPropertyOptional({
		description: "Name of the weapon type in Amharic",
		example: "ግሎክ 19",
	})
	weaponTypeNameAm?: string;

	@ApiPropertyOptional({
		description: "ID of the weapon category",
		example: "clx2222222222",
	})
	categoryId?: string;

	@ApiPropertyOptional({
		description: "Name of the weapon category",
		example: "Handguns",
	})
	categoryName?: string;

	@ApiPropertyOptional({
		description: "ID of the center where the weapon is stored",
		example: "clx3333333333",
	})
	centerId?: string;

	@ApiPropertyOptional({
		description: "Name of the center",
		example: "Main Headquarters",
	})
	centerName?: string;

	@ApiProperty({
		description: "Unique serial number of the weapon",
		example: "ABC123456",
	})
	serialNumber: string;

	@ApiPropertyOptional({
		description: "Registration number assigned by authorities",
		example: "REG-2025-00001",
	})
	registrationNumber?: string;

	@ApiPropertyOptional({
		description: "Year the weapon was manufactured",
		example: 2020,
	})
	manufactureYear?: number;

	@ApiPropertyOptional({
		description: "Date the weapon was acquired",
		example: "2023-06-15T00:00:00.000Z",
	})
	acquisitionDate?: Date;

	@ApiPropertyOptional({
		description: "Method of acquisition",
		example: "Purchase",
	})
	acquisitionMethod?: string;

	@ApiPropertyOptional({
		description: "Purchase price of the weapon",
		example: "15000.00",
	})
	purchasePrice?: string;

	@ApiProperty({
		description: "Current status of the weapon",
		enum: WeaponStatus,
		enumName: "WeaponStatus",
		example: WeaponStatus.IN_SERVICE,
	})
	status: WeaponStatus;

	@ApiProperty({
		description: "Current condition of the weapon",
		enum: WeaponCondition,
		enumName: "WeaponCondition",
		example: WeaponCondition.GOOD,
	})
	condition: WeaponCondition;

	@ApiPropertyOptional({
		description: "Date of last inspection",
		example: "2024-12-01T00:00:00.000Z",
	})
	lastInspectionDate?: Date;

	@ApiPropertyOptional({
		description: "Date of next scheduled inspection",
		example: "2025-06-01T00:00:00.000Z",
	})
	nextInspectionDate?: Date;

	@ApiPropertyOptional({
		description: "Date of last maintenance",
		example: "2024-11-15T00:00:00.000Z",
	})
	lastMaintenanceDate?: Date;

	@ApiPropertyOptional({
		description: "Additional remarks about the weapon",
		example: "Includes two spare magazines",
	})
	remarks?: string;

	@ApiProperty({
		description: "Whether the weapon record is active",
		example: true,
	})
	isActive: boolean;

	@ApiPropertyOptional({
		description: "Current assignment details if weapon is assigned",
	})
	currentAssignment?: {
		id: string;
		employeeId: string;
		employeeName: string;
		employeeCode: string;
		assignedDate: Date;
	};

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

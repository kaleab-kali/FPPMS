import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { WeaponCondition } from "@prisma/client";

export class WeaponAssignmentResponseDto {
	@ApiProperty({
		description: "Unique identifier of the assignment",
		example: "clx1234567890",
	})
	id: string;

	@ApiProperty({
		description: "Tenant ID",
		example: "clx0987654321",
	})
	tenantId: string;

	@ApiProperty({
		description: "ID of the weapon",
		example: "clx1111111111",
	})
	weaponId: string;

	@ApiPropertyOptional({
		description: "Serial number of the weapon",
		example: "ABC123456",
	})
	weaponSerialNumber?: string;

	@ApiPropertyOptional({
		description: "Name of the weapon type",
		example: "Glock 19",
	})
	weaponTypeName?: string;

	@ApiPropertyOptional({
		description: "Name of the weapon category",
		example: "Handguns",
	})
	weaponCategoryName?: string;

	@ApiProperty({
		description: "ID of the employee",
		example: "clx2222222222",
	})
	employeeId: string;

	@ApiPropertyOptional({
		description: "Full name of the employee",
		example: "John Doe",
	})
	employeeName?: string;

	@ApiPropertyOptional({
		description: "Employee ID code",
		example: "FPC-0001/25",
	})
	employeeCode?: string;

	@ApiProperty({
		description: "Date of assignment",
		example: "2025-01-15T00:00:00.000Z",
	})
	assignedDate: Date;

	@ApiProperty({
		description: "ID of the user who assigned the weapon",
		example: "clx3333333333",
	})
	assignedBy: string;

	@ApiPropertyOptional({
		description: "Expected return date",
		example: "2025-02-15T00:00:00.000Z",
	})
	expectedReturnDate?: Date;

	@ApiProperty({
		description: "Condition at time of assignment",
		enum: WeaponCondition,
		enumName: "WeaponCondition",
		example: WeaponCondition.GOOD,
	})
	conditionAtAssignment: WeaponCondition;

	@ApiPropertyOptional({
		description: "Number of ammunition rounds issued",
		example: 30,
	})
	issuedRounds?: number;

	@ApiProperty({
		description: "Whether the weapon has been returned",
		example: false,
	})
	isReturned: boolean;

	@ApiPropertyOptional({
		description: "Date the weapon was returned",
		example: "2025-02-15T00:00:00.000Z",
	})
	returnedDate?: Date;

	@ApiPropertyOptional({
		description: "ID of the user who received the return",
		example: "clx4444444444",
	})
	returnedTo?: string;

	@ApiPropertyOptional({
		description: "Condition at time of return",
		enum: WeaponCondition,
		enumName: "WeaponCondition",
		example: WeaponCondition.GOOD,
	})
	conditionAtReturn?: WeaponCondition;

	@ApiPropertyOptional({
		description: "Number of ammunition rounds returned",
		example: 25,
	})
	returnedRounds?: number;

	@ApiPropertyOptional({
		description: "Purpose of the assignment",
		example: "Duty assignment",
	})
	purpose?: string;

	@ApiPropertyOptional({
		description: "Additional remarks",
		example: "Assigned for patrol duty",
	})
	remarks?: string;

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

export class WeaponAssignmentFilterDto {
	@ApiPropertyOptional({
		description: "Filter by weapon ID",
		example: "clx1234567890",
	})
	weaponId?: string;

	@ApiPropertyOptional({
		description: "Filter by employee ID",
		example: "clx0987654321",
	})
	employeeId?: string;

	@ApiPropertyOptional({
		description: "Filter by center ID",
		example: "clx1111111111",
	})
	centerId?: string;

	@ApiPropertyOptional({
		description: "Filter by weapon type ID",
		example: "clx2222222222",
	})
	weaponTypeId?: string;

	@ApiPropertyOptional({
		description: "Filter by returned status",
		example: false,
	})
	isReturned?: boolean;
}

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class InventoryAssignmentResponseDto {
	@ApiProperty({ description: "Assignment ID" })
	id: string;

	@ApiProperty({ description: "Tenant ID" })
	tenantId: string;

	@ApiProperty({ description: "Employee ID" })
	employeeId: string;

	@ApiPropertyOptional({ description: "Employee name" })
	employeeName?: string;

	@ApiPropertyOptional({ description: "Employee ID code (FPC-0001/25)" })
	employeeCode?: string;

	@ApiProperty({ description: "Item type ID" })
	itemTypeId: string;

	@ApiPropertyOptional({ description: "Item type name" })
	itemTypeName?: string;

	@ApiPropertyOptional({ description: "Item type name in Amharic" })
	itemTypeNameAm?: string;

	@ApiPropertyOptional({ description: "Category name" })
	categoryName?: string;

	@ApiPropertyOptional({ description: "Center ID" })
	centerId?: string;

	@ApiPropertyOptional({ description: "Center name" })
	centerName?: string;

	@ApiPropertyOptional({ description: "Serial number" })
	serialNumber?: string;

	@ApiPropertyOptional({ description: "Asset tag" })
	assetTag?: string;

	@ApiPropertyOptional({ description: "Size" })
	size?: string;

	@ApiProperty({ description: "Quantity" })
	quantity: number;

	@ApiProperty({ description: "Is permanent assignment" })
	isPermanent: boolean;

	@ApiPropertyOptional({ description: "Expected return date" })
	expectedReturnDate?: Date;

	@ApiProperty({ description: "Assigned date" })
	assignedDate: Date;

	@ApiProperty({ description: "Assigned by user ID" })
	assignedBy: string;

	@ApiProperty({ description: "Condition at assignment" })
	conditionAtAssignment: string;

	@ApiProperty({ description: "Is returned" })
	isReturned: boolean;

	@ApiPropertyOptional({ description: "Returned date" })
	returnedDate?: Date;

	@ApiPropertyOptional({ description: "Returned to user ID" })
	returnedTo?: string;

	@ApiPropertyOptional({ description: "Condition at return" })
	conditionAtReturn?: string;

	@ApiProperty({ description: "Is lost" })
	isLost: boolean;

	@ApiProperty({ description: "Is damaged" })
	isDamaged: boolean;

	@ApiPropertyOptional({ description: "Damage notes" })
	damageNotes?: string;

	@ApiPropertyOptional({ description: "Cost recovery amount" })
	costRecovery?: string;

	@ApiPropertyOptional({ description: "Remarks" })
	remarks?: string;

	@ApiProperty({ description: "Created at" })
	createdAt: Date;

	@ApiProperty({ description: "Updated at" })
	updatedAt: Date;
}

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsDateString, IsInt, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class CreateInventoryAssignmentDto {
	@ApiProperty({ description: "Employee ID to assign inventory to" })
	@IsUUID()
	employeeId: string;

	@ApiProperty({ description: "Inventory item type ID" })
	@IsUUID()
	itemTypeId: string;

	@ApiPropertyOptional({ description: "Center ID where the assignment is made" })
	@IsUUID()
	@IsOptional()
	centerId?: string;

	@ApiPropertyOptional({ description: "Serial number for tracked items" })
	@IsString()
	@IsOptional()
	serialNumber?: string;

	@ApiPropertyOptional({ description: "Asset tag for tracked items" })
	@IsString()
	@IsOptional()
	assetTag?: string;

	@ApiPropertyOptional({ description: "Size (for uniforms, etc.)" })
	@IsString()
	@IsOptional()
	size?: string;

	@ApiProperty({ description: "Quantity assigned", default: 1 })
	@IsInt()
	@Min(1)
	quantity: number;

	@ApiProperty({ description: "Whether assignment is permanent", default: false })
	@IsBoolean()
	isPermanent: boolean;

	@ApiPropertyOptional({ description: "Expected return date for temporary assignments (YYYY-MM-DD)" })
	@IsDateString()
	@IsOptional()
	expectedReturnDate?: string;

	@ApiProperty({ description: "Assignment date (YYYY-MM-DD)" })
	@IsDateString()
	assignedDate: string;

	@ApiProperty({ description: "Condition at time of assignment" })
	@IsString()
	conditionAtAssignment: string;

	@ApiPropertyOptional({ description: "Additional remarks" })
	@IsString()
	@IsOptional()
	remarks?: string;
}

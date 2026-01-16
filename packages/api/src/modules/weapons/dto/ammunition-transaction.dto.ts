import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { AmmunitionTransactionType } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from "class-validator";
import { PaginationQueryDto } from "#api/common/dto/pagination-query.dto";

export class CreateAmmunitionTransactionDto {
	@ApiProperty({
		description: "ID of the ammunition type",
		example: "clx1234567890",
	})
	@IsUUID()
	ammunitionTypeId: string;

	@ApiProperty({
		description: "ID of the center where transaction occurs",
		example: "clx0987654321",
	})
	@IsUUID()
	centerId: string;

	@ApiPropertyOptional({
		description: "ID of the employee (for ISSUED/RETURNED transactions)",
		example: "clx1111111111",
	})
	@IsUUID()
	@IsOptional()
	employeeId?: string;

	@ApiProperty({
		description: "Type of transaction",
		enum: AmmunitionTransactionType,
		enumName: "AmmunitionTransactionType",
		example: AmmunitionTransactionType.ISSUED,
	})
	@IsEnum(AmmunitionTransactionType)
	transactionType: AmmunitionTransactionType;

	@ApiProperty({
		description: "Quantity of ammunition (positive number)",
		example: 50,
		minimum: 1,
	})
	@IsInt()
	@Min(1)
	quantity: number;

	@ApiProperty({
		description: "Date of transaction (YYYY-MM-DD)",
		example: "2025-01-15",
	})
	@IsDateString()
	transactionDate: string;

	@ApiPropertyOptional({
		description: "Batch number for tracking",
		example: "BATCH-2025-001",
	})
	@IsString()
	@IsOptional()
	batchNumber?: string;

	@ApiPropertyOptional({
		description: "Expiry date for this batch (YYYY-MM-DD)",
		example: "2030-12-31",
	})
	@IsDateString()
	@IsOptional()
	expiryDate?: string;

	@ApiPropertyOptional({
		description: "Purpose of the transaction",
		example: "Training exercise",
	})
	@IsString()
	@IsOptional()
	purpose?: string;

	@ApiPropertyOptional({
		description: "Additional remarks",
		example: "Issued for annual firearms qualification",
	})
	@IsString()
	@IsOptional()
	remarks?: string;
}

export class AmmunitionTransactionResponseDto {
	@ApiProperty({
		description: "Unique identifier of the transaction",
		example: "clx1234567890",
	})
	id: string;

	@ApiProperty({
		description: "Tenant ID",
		example: "clx0987654321",
	})
	tenantId: string;

	@ApiProperty({
		description: "ID of the ammunition type",
		example: "clx1111111111",
	})
	ammunitionTypeId: string;

	@ApiPropertyOptional({
		description: "Name of the ammunition type",
		example: "9mm Full Metal Jacket",
	})
	ammunitionTypeName?: string;

	@ApiPropertyOptional({
		description: "Caliber of the ammunition",
		example: "9x19mm Parabellum",
	})
	ammunitionCaliber?: string;

	@ApiProperty({
		description: "ID of the center",
		example: "clx2222222222",
	})
	centerId: string;

	@ApiPropertyOptional({
		description: "Name of the center",
		example: "Main Headquarters",
	})
	centerName?: string;

	@ApiPropertyOptional({
		description: "ID of the employee",
		example: "clx3333333333",
	})
	employeeId?: string;

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
		description: "Type of transaction",
		enum: AmmunitionTransactionType,
		enumName: "AmmunitionTransactionType",
		example: AmmunitionTransactionType.ISSUED,
	})
	transactionType: AmmunitionTransactionType;

	@ApiProperty({
		description: "Quantity of ammunition",
		example: 50,
	})
	quantity: number;

	@ApiProperty({
		description: "Date of transaction",
		example: "2025-01-15T00:00:00.000Z",
	})
	transactionDate: Date;

	@ApiProperty({
		description: "ID of the user who processed the transaction",
		example: "clx4444444444",
	})
	processedBy: string;

	@ApiPropertyOptional({
		description: "Batch number",
		example: "BATCH-2025-001",
	})
	batchNumber?: string;

	@ApiPropertyOptional({
		description: "Expiry date",
		example: "2030-12-31T00:00:00.000Z",
	})
	expiryDate?: Date;

	@ApiPropertyOptional({
		description: "Purpose of the transaction",
		example: "Training exercise",
	})
	purpose?: string;

	@ApiPropertyOptional({
		description: "Additional remarks",
		example: "Issued for annual firearms qualification",
	})
	remarks?: string;

	@ApiProperty({
		description: "Creation timestamp",
		example: "2025-01-15T10:30:00.000Z",
	})
	createdAt: Date;
}

export class AmmunitionTransactionFilterDto extends PaginationQueryDto {
	@ApiPropertyOptional({
		description: "Filter by ammunition type ID",
		example: "clx1234567890",
	})
	@IsUUID()
	@IsOptional()
	ammunitionTypeId?: string;

	@ApiPropertyOptional({
		description: "Filter by center ID",
		example: "clx0987654321",
	})
	@IsUUID()
	@IsOptional()
	centerId?: string;

	@ApiPropertyOptional({
		description: "Filter by employee ID",
		example: "clx1111111111",
	})
	@IsUUID()
	@IsOptional()
	employeeId?: string;

	@ApiPropertyOptional({
		description: "Filter by transaction type",
		enum: AmmunitionTransactionType,
		enumName: "AmmunitionTransactionType",
		example: AmmunitionTransactionType.ISSUED,
	})
	@IsEnum(AmmunitionTransactionType)
	@IsOptional()
	transactionType?: AmmunitionTransactionType;

	@ApiPropertyOptional({
		description: "Filter by start date (YYYY-MM-DD)",
		example: "2025-01-01",
	})
	@IsDateString()
	@IsOptional()
	startDate?: string;

	@ApiPropertyOptional({
		description: "Filter by end date (YYYY-MM-DD)",
		example: "2025-12-31",
	})
	@IsDateString()
	@IsOptional()
	endDate?: string;
}

export class AmmunitionTypeFilterDto extends PaginationQueryDto {
	@ApiPropertyOptional({
		description: "Filter by weapon type ID",
		example: "clx1234567890",
	})
	@IsUUID()
	@IsOptional()
	weaponTypeId?: string;

	@ApiPropertyOptional({
		description: "Filter by active status",
		example: true,
	})
	@IsBoolean()
	@Transform(({ value }) => value === "true" || value === true)
	@IsOptional()
	isActive?: boolean;
}

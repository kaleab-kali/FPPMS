import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { SalaryScaleStatus } from "@prisma/client";

export class SalaryScaleStepResponseDto {
	@ApiProperty({
		description: "Unique identifier",
		example: "clxyz123abc456",
	})
	id: string;

	@ApiProperty({
		description: "Step number (0 for base, 1-9 for steps)",
		example: 1,
	})
	stepNumber: number;

	@ApiProperty({
		description: "Salary amount in ETB",
		example: "6591.00",
	})
	salaryAmount: string;

	@ApiProperty({
		description: "Years of service required for this step",
		example: 2,
	})
	yearsRequired: number;
}

export class SalaryScaleRankResponseDto {
	@ApiProperty({
		description: "Unique identifier",
		example: "clxyz123abc456",
	})
	id: string;

	@ApiProperty({
		description: "Rank code",
		example: "CONST",
	})
	rankCode: string;

	@ApiProperty({
		description: "Rank name in English",
		example: "Constable",
	})
	rankName: string;

	@ApiPropertyOptional({
		description: "Rank name in Amharic",
		example: "\u12AE\u1295\u1235\u1273\u1265\u120D",
	})
	rankNameAm?: string;

	@ApiProperty({
		description: "Rank category",
		example: "ENLISTED",
	})
	category: string;

	@ApiProperty({
		description: "Hierarchical level",
		example: 1,
	})
	level: number;

	@ApiProperty({
		description: "Base salary (Step 0) in ETB",
		example: "6365.00",
	})
	baseSalary: string;

	@ApiProperty({
		description: "Ceiling salary in ETB",
		example: "8944.00",
	})
	ceilingSalary: string;

	@ApiProperty({
		description: "Sort order for display",
		example: 0,
	})
	sortOrder: number;

	@ApiPropertyOptional({
		description: "Salary steps for this rank",
		type: [SalaryScaleStepResponseDto],
	})
	salarySteps?: SalaryScaleStepResponseDto[];
}

export class SalaryScaleVersionResponseDto {
	@ApiProperty({
		description: "Unique identifier",
		example: "clxyz123abc456",
	})
	id: string;

	@ApiPropertyOptional({
		description: "Tenant ID (null for system-wide scales)",
		example: "clxyz123abc456",
	})
	tenantId?: string;

	@ApiProperty({
		description: "Unique code for this version",
		example: "2018-EC",
	})
	code: string;

	@ApiProperty({
		description: "Name of the salary scale",
		example: "Police Salary Scale 2018 EC",
	})
	name: string;

	@ApiPropertyOptional({
		description: "Name in Amharic",
		example: "\u12E8\u1356\u120A\u1235 \u12E8\u12F0\u121E\u12DD \u1235\u12AC\u120D 2018",
	})
	nameAm?: string;

	@ApiPropertyOptional({
		description: "Description",
		example: "Official police salary scale effective from 2018 Ethiopian Calendar",
	})
	description?: string;

	@ApiProperty({
		description: "Date when this scale becomes effective",
		example: "2025-09-11",
	})
	effectiveDate: Date;

	@ApiPropertyOptional({
		description: "Date when this scale expires",
		example: "2028-09-10",
	})
	expiryDate?: Date;

	@ApiProperty({
		description: "Current status of the scale",
		enum: SalaryScaleStatus,
		enumName: "SalaryScaleStatus",
		example: SalaryScaleStatus.ACTIVE,
	})
	status: SalaryScaleStatus;

	@ApiProperty({
		description: "Number of salary steps",
		example: 9,
	})
	stepCount: number;

	@ApiProperty({
		description: "Years between step increments",
		example: 2,
	})
	stepPeriodYears: number;

	@ApiPropertyOptional({
		description: "User ID who approved this scale",
		example: "clxyz123abc456",
	})
	approvedBy?: string;

	@ApiPropertyOptional({
		description: "When the scale was approved",
	})
	approvedAt?: Date;

	@ApiPropertyOptional({
		description: "User ID who created this scale",
		example: "clxyz123abc456",
	})
	createdBy?: string;

	@ApiProperty({
		description: "When the record was created",
	})
	createdAt: Date;

	@ApiProperty({
		description: "When the record was last updated",
	})
	updatedAt: Date;

	@ApiPropertyOptional({
		description: "Rank salary configurations",
		type: [SalaryScaleRankResponseDto],
	})
	rankSalaries?: SalaryScaleRankResponseDto[];
}

export class SalaryScaleListResponseDto {
	@ApiProperty({
		description: "Unique identifier",
		example: "clxyz123abc456",
	})
	id: string;

	@ApiProperty({
		description: "Unique code for this version",
		example: "2018-EC",
	})
	code: string;

	@ApiProperty({
		description: "Name of the salary scale",
		example: "Police Salary Scale 2018 EC",
	})
	name: string;

	@ApiPropertyOptional({
		description: "Name in Amharic",
	})
	nameAm?: string;

	@ApiProperty({
		description: "Date when this scale becomes effective",
	})
	effectiveDate: Date;

	@ApiPropertyOptional({
		description: "Date when this scale expires",
	})
	expiryDate?: Date;

	@ApiProperty({
		description: "Current status",
		enum: SalaryScaleStatus,
		enumName: "SalaryScaleStatus",
	})
	status: SalaryScaleStatus;

	@ApiProperty({
		description: "Number of ranks in this scale",
		example: 16,
	})
	rankCount: number;

	@ApiProperty({
		description: "When the record was created",
	})
	createdAt: Date;
}

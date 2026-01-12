import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class ProcessPromotionSalaryDto {
	@ApiProperty({
		description: "The employee ID (UUID) being promoted",
		example: "clx1234567890",
	})
	@IsString()
	@IsNotEmpty()
	employeeId: string;

	@ApiProperty({
		description: "The new rank ID after promotion",
		example: "clx0987654321",
	})
	@IsString()
	@IsNotEmpty()
	newRankId: string;

	@ApiProperty({
		description: "Effective date of the promotion (ISO date string)",
		example: "2025-07-01",
	})
	@IsDateString()
	@IsNotEmpty()
	effectiveDate: string;

	@ApiPropertyOptional({
		description: "Order reference number for the promotion",
		example: "PROM/2025/001",
	})
	@IsString()
	@MaxLength(100)
	@IsOptional()
	orderReference?: string;

	@ApiPropertyOptional({
		description: "Reason or notes for the promotion",
		example: "Promotion based on merit and years of service",
	})
	@IsString()
	@MaxLength(500)
	@IsOptional()
	reason?: string;

	@ApiPropertyOptional({
		description: "Path to the promotion order document",
		example: "/uploads/orders/promotion-2025-001.pdf",
	})
	@IsString()
	@IsOptional()
	documentPath?: string;
}

export class PromotionSalaryPreviewDto {
	@ApiProperty({
		description: "The employee ID (UUID) to preview promotion salary",
		example: "clx1234567890",
	})
	@IsString()
	@IsNotEmpty()
	employeeId: string;

	@ApiProperty({
		description: "The new rank ID to preview",
		example: "clx0987654321",
	})
	@IsString()
	@IsNotEmpty()
	newRankId: string;
}

class RankPreviewDto {
	@ApiProperty({ description: "Rank ID" })
	id: string;

	@ApiProperty({ description: "Rank code" })
	code: string;

	@ApiProperty({ description: "Rank name" })
	name: string;

	@ApiPropertyOptional({ description: "Rank name in Amharic" })
	nameAm: string | null;
}

export class PromotionSalaryPreviewResponseDto {
	@ApiProperty({ description: "Employee ID" })
	employeeId: string;

	@ApiProperty({ description: "Employee's full name" })
	employeeName: string;

	@ApiProperty({ description: "Current rank details", type: RankPreviewDto })
	currentRank: RankPreviewDto;

	@ApiProperty({ description: "New rank details", type: RankPreviewDto })
	newRank: RankPreviewDto;

	@ApiProperty({ description: "Current salary step", example: 5 })
	currentStep: number;

	@ApiProperty({ description: "Current salary amount", example: "15000.00" })
	currentSalary: string;

	@ApiProperty({ description: "Calculated new step in new rank", example: 2 })
	newStep: number;

	@ApiProperty({ description: "New salary amount", example: "18000.00" })
	newSalary: string;

	@ApiProperty({ description: "Salary increase amount", example: "3000.00" })
	salaryIncrease: string;

	@ApiProperty({ description: "Percentage increase", example: "20.00" })
	percentageIncrease: string;

	@ApiProperty({
		description: "Explanation of how the new step was calculated",
		example: "Step 2 in Sergeant (18000.00) is the first step >= current salary (15000.00)",
	})
	calculationExplanation: string;
}

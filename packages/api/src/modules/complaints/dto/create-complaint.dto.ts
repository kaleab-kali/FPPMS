import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ComplainantType, ComplaintArticle } from "@prisma/client";
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateComplaintDto {
	@ApiProperty({
		description: "The article type for this complaint (Article 30 for minor offenses, Article 31 for serious offenses)",
		enum: ComplaintArticle,
		enumName: "ComplaintArticle",
		example: ComplaintArticle.ARTICLE_30,
	})
	@IsEnum(ComplaintArticle)
	@IsNotEmpty()
	article: ComplaintArticle;

	@ApiProperty({
		description: "The offense code from the offense types list (e.g., ART30-001, ART31-015)",
		example: "ART30-001",
		maxLength: 20,
	})
	@IsString()
	@IsNotEmpty()
	@MaxLength(20)
	offenseCode: string;

	@ApiProperty({
		description: "The ID of the employee being accused",
		example: "clx1234567890abcdef",
	})
	@IsString()
	@IsNotEmpty()
	accusedEmployeeId: string;

	@ApiPropertyOptional({
		description: "Name of the complainant (can be left empty for anonymous complaints)",
		example: "John Doe",
		maxLength: 200,
	})
	@IsString()
	@IsOptional()
	@MaxLength(200)
	complainantName?: string;

	@ApiProperty({
		description: "Type of complainant",
		enum: ComplainantType,
		enumName: "ComplainantType",
		example: ComplainantType.EMPLOYEE,
	})
	@IsEnum(ComplainantType)
	@IsNotEmpty()
	complainantType: ComplainantType;

	@ApiPropertyOptional({
		description: "Employee ID of the complainant if complainant is an internal employee",
		example: "clx0987654321fedcba",
	})
	@IsString()
	@IsOptional()
	complainantEmployeeId?: string;

	@ApiProperty({
		description: "Summary description of the complaint in English",
		example: "Employee was found sleeping during duty hours on multiple occasions",
		maxLength: 2000,
	})
	@IsString()
	@IsNotEmpty()
	@MaxLength(2000)
	summary: string;

	@ApiPropertyOptional({
		description: "Summary description of the complaint in Amharic",
		example: "ሰራተኛው በስራ ሰዓት ተኝቶ ተገኝቷል",
		maxLength: 2000,
	})
	@IsString()
	@IsOptional()
	@MaxLength(2000)
	summaryAm?: string;

	@ApiProperty({
		description: "Date when the incident occurred (ISO 8601 format)",
		example: "2025-01-15",
	})
	@IsDateString()
	@IsNotEmpty()
	incidentDate: string;

	@ApiPropertyOptional({
		description: "Location where the incident occurred",
		example: "Main Gate, Building A",
		maxLength: 500,
	})
	@IsString()
	@IsOptional()
	@MaxLength(500)
	incidentLocation?: string;

	@ApiProperty({
		description: "Date when the complaint was officially registered (ISO 8601 format)",
		example: "2025-01-20",
	})
	@IsDateString()
	@IsNotEmpty()
	registeredDate: string;
}

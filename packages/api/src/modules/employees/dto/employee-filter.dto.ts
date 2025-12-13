import { ApiPropertyOptional } from "@nestjs/swagger";
import { EmployeeStatus, EmployeeType, Gender } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class EmployeeFilterDto {
	@ApiPropertyOptional({ description: "Search term (name, employee ID, phone)" })
	@IsOptional()
	@IsString()
	search?: string;

	@ApiPropertyOptional({ enum: EmployeeType, description: "Filter by employee type" })
	@IsOptional()
	@IsEnum(EmployeeType)
	employeeType?: EmployeeType;

	@ApiPropertyOptional({ enum: EmployeeStatus, description: "Filter by status" })
	@IsOptional()
	@IsEnum(EmployeeStatus)
	status?: EmployeeStatus;

	@ApiPropertyOptional({ enum: Gender, description: "Filter by gender" })
	@IsOptional()
	@IsEnum(Gender)
	gender?: Gender;

	@ApiPropertyOptional({ description: "Filter by center ID" })
	@IsOptional()
	@IsString()
	centerId?: string;

	@ApiPropertyOptional({ description: "Filter by department ID" })
	@IsOptional()
	@IsString()
	departmentId?: string;

	@ApiPropertyOptional({ description: "Filter by position ID" })
	@IsOptional()
	@IsString()
	positionId?: string;

	@ApiPropertyOptional({ description: "Filter by rank ID (military only)" })
	@IsOptional()
	@IsString()
	rankId?: string;

	@ApiPropertyOptional({ description: "Page number (1-based)" })
	@IsOptional()
	@IsNumber()
	@Min(1)
	@Type(() => Number)
	page?: number;

	@ApiPropertyOptional({ description: "Page size (default: 20, max: 100)" })
	@IsOptional()
	@IsNumber()
	@Min(1)
	@Max(100)
	@Type(() => Number)
	pageSize?: number;

	@ApiPropertyOptional({ description: "Sort field" })
	@IsOptional()
	@IsString()
	sortBy?: string;

	@ApiPropertyOptional({ description: "Sort order (asc/desc)" })
	@IsOptional()
	@IsString()
	sortOrder?: "asc" | "desc";
}

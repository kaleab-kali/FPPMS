import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import type { HolidayType } from "./create-holiday.dto";
import { HOLIDAY_TYPE } from "./create-holiday.dto";

export class HolidayQueryDto {
	@ApiPropertyOptional({ description: "Filter by year (Gregorian)", example: 2025 })
	@IsInt()
	@Min(2000)
	@Max(2100)
	@Transform(({ value }) => Number.parseInt(value, 10))
	@IsOptional()
	year?: number;

	@ApiPropertyOptional({ description: "Filter by month (Gregorian, 1-12)", example: 9 })
	@IsInt()
	@Min(1)
	@Max(12)
	@Transform(({ value }) => Number.parseInt(value, 10))
	@IsOptional()
	month?: number;

	@ApiPropertyOptional({ description: "Filter by Ethiopian year", example: 2017 })
	@IsInt()
	@Min(1900)
	@Max(2100)
	@Transform(({ value }) => Number.parseInt(value, 10))
	@IsOptional()
	ethiopianYear?: number;

	@ApiPropertyOptional({ description: "Filter by Ethiopian month (1-13)", example: 1 })
	@IsInt()
	@Min(1)
	@Max(13)
	@Transform(({ value }) => Number.parseInt(value, 10))
	@IsOptional()
	ethiopianMonth?: number;

	@ApiPropertyOptional({ description: "Start date filter (Gregorian)" })
	@IsDateString()
	@IsOptional()
	startDate?: string;

	@ApiPropertyOptional({ description: "End date filter (Gregorian)" })
	@IsDateString()
	@IsOptional()
	endDate?: string;

	@ApiPropertyOptional({ description: "Filter by holiday type", enum: HOLIDAY_TYPE, enumName: "HolidayType" })
	@IsEnum(HOLIDAY_TYPE)
	@IsOptional()
	holidayType?: HolidayType;

	@ApiPropertyOptional({ description: "Filter by appliesTo (center or department ID)" })
	@IsString()
	@IsOptional()
	appliesTo?: string;

	@ApiPropertyOptional({ description: "Include only recurring holidays" })
	@Transform(({ value }) => value === "true")
	@IsOptional()
	recurringOnly?: boolean;
}

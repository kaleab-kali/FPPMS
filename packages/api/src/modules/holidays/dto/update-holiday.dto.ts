import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import type { HolidayType, RecurrenceType } from "./create-holiday.dto";
import { HOLIDAY_TYPE, RECURRENCE_TYPE } from "./create-holiday.dto";

export class UpdateHolidayDto {
	@ApiPropertyOptional({ description: "Holiday name in English" })
	@IsString()
	@IsOptional()
	name?: string;

	@ApiPropertyOptional({ description: "Holiday name in Amharic" })
	@IsString()
	@IsOptional()
	nameAm?: string;

	@ApiPropertyOptional({ description: "Holiday date (Gregorian)" })
	@IsDateString()
	@IsOptional()
	holidayDate?: string;

	@ApiPropertyOptional({
		description: "Type of holiday",
		enum: HOLIDAY_TYPE,
		enumName: "HolidayType",
	})
	@IsEnum(HOLIDAY_TYPE)
	@IsOptional()
	holidayType?: HolidayType;

	@ApiPropertyOptional({ description: "Whether this is a half-day holiday" })
	@IsBoolean()
	@IsOptional()
	isHalfDay?: boolean;

	@ApiPropertyOptional({ description: "Whether this holiday recurs yearly" })
	@IsBoolean()
	@IsOptional()
	isRecurring?: boolean;

	@ApiPropertyOptional({
		description: "Type of recurrence",
		enum: RECURRENCE_TYPE,
		enumName: "RecurrenceType",
	})
	@IsEnum(RECURRENCE_TYPE)
	@IsOptional()
	recurrenceType?: RecurrenceType;

	@ApiPropertyOptional({ description: "Ethiopian month for recurring Ethiopian holidays (1-13)" })
	@IsInt()
	@Min(1)
	@Max(13)
	@IsOptional()
	ethiopianMonth?: number;

	@ApiPropertyOptional({ description: "Ethiopian day for recurring Ethiopian holidays (1-30)" })
	@IsInt()
	@Min(1)
	@Max(30)
	@IsOptional()
	ethiopianDay?: number;

	@ApiPropertyOptional({ description: "Which groups this holiday applies to" })
	@IsArray()
	@IsString({ each: true })
	@IsOptional()
	appliesTo?: string[];

	@ApiPropertyOptional({ description: "Description of the holiday" })
	@IsString()
	@IsOptional()
	description?: string;
}

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export const HOLIDAY_TYPE = {
	NATIONAL: "NATIONAL",
	RELIGIOUS: "RELIGIOUS",
	COMPANY: "COMPANY",
	REGIONAL: "REGIONAL",
} as const;

export type HolidayType = (typeof HOLIDAY_TYPE)[keyof typeof HOLIDAY_TYPE];

export const RECURRENCE_TYPE = {
	YEARLY_GREGORIAN: "YEARLY_GREGORIAN",
	YEARLY_ETHIOPIAN: "YEARLY_ETHIOPIAN",
	NONE: "NONE",
} as const;

export type RecurrenceType = (typeof RECURRENCE_TYPE)[keyof typeof RECURRENCE_TYPE];

export class CreateHolidayDto {
	@ApiProperty({ description: "Holiday name in English", example: "Ethiopian New Year" })
	@IsString()
	name: string;

	@ApiProperty({ description: "Holiday name in Amharic", example: "እንቁጣጣሽ" })
	@IsString()
	nameAm: string;

	@ApiProperty({ description: "Holiday date (Gregorian)", example: "2025-09-11" })
	@IsDateString()
	holidayDate: string;

	@ApiProperty({
		description: "Type of holiday",
		enum: HOLIDAY_TYPE,
		enumName: "HolidayType",
		example: HOLIDAY_TYPE.NATIONAL,
	})
	@IsEnum(HOLIDAY_TYPE)
	holidayType: HolidayType;

	@ApiPropertyOptional({ description: "Whether this is a half-day holiday", default: false })
	@IsBoolean()
	@IsOptional()
	isHalfDay?: boolean;

	@ApiPropertyOptional({ description: "Whether this holiday recurs yearly", default: false })
	@IsBoolean()
	@IsOptional()
	isRecurring?: boolean;

	@ApiPropertyOptional({
		description: "Type of recurrence",
		enum: RECURRENCE_TYPE,
		enumName: "RecurrenceType",
		example: RECURRENCE_TYPE.YEARLY_ETHIOPIAN,
	})
	@IsEnum(RECURRENCE_TYPE)
	@IsOptional()
	recurrenceType?: RecurrenceType;

	@ApiPropertyOptional({ description: "Ethiopian month for recurring Ethiopian holidays (1-13)", example: 1 })
	@IsInt()
	@Min(1)
	@Max(13)
	@IsOptional()
	ethiopianMonth?: number;

	@ApiPropertyOptional({ description: "Ethiopian day for recurring Ethiopian holidays (1-30)", example: 1 })
	@IsInt()
	@Min(1)
	@Max(30)
	@IsOptional()
	ethiopianDay?: number;

	@ApiPropertyOptional({
		description: "Which groups this holiday applies to (ALL, or specific center/department IDs)",
		example: ["ALL"],
		default: ["ALL"],
	})
	@IsArray()
	@IsString({ each: true })
	@IsOptional()
	appliesTo?: string[];

	@ApiPropertyOptional({ description: "Description of the holiday" })
	@IsString()
	@IsOptional()
	description?: string;
}

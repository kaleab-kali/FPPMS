import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { HOLIDAY_TYPE, RECURRENCE_TYPE } from "./create-holiday.dto";

export class HolidayResponseDto {
	@ApiProperty({ description: "Holiday ID" })
	id: string;

	@ApiProperty({ description: "Tenant ID" })
	tenantId: string;

	@ApiProperty({ description: "Holiday name in English" })
	name: string;

	@ApiProperty({ description: "Holiday name in Amharic" })
	nameAm: string;

	@ApiProperty({ description: "Holiday date (Gregorian)" })
	holidayDate: Date;

	@ApiProperty({ description: "Type of holiday", enum: HOLIDAY_TYPE, enumName: "HolidayType" })
	holidayType: string;

	@ApiProperty({ description: "Whether this is a half-day holiday" })
	isHalfDay: boolean;

	@ApiProperty({ description: "Whether this holiday recurs yearly" })
	isRecurring: boolean;

	@ApiPropertyOptional({ description: "Type of recurrence", enum: RECURRENCE_TYPE, enumName: "RecurrenceType" })
	recurrenceType?: string;

	@ApiPropertyOptional({ description: "Ethiopian month (1-13)" })
	ethiopianMonth?: number;

	@ApiPropertyOptional({ description: "Ethiopian day (1-30)" })
	ethiopianDay?: number;

	@ApiProperty({ description: "Which groups this holiday applies to", type: [String] })
	appliesTo: string[];

	@ApiPropertyOptional({ description: "Description" })
	description?: string;

	@ApiProperty({ description: "Created timestamp" })
	createdAt: Date;

	@ApiProperty({ description: "Updated timestamp" })
	updatedAt: Date;

	@ApiPropertyOptional({ description: "Created by user ID" })
	createdBy?: string;

	@ApiPropertyOptional({ description: "Ethiopian date formatted string" })
	ethiopianDateFormatted?: string;
}

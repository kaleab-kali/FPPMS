import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { WorkScheduleType } from "@prisma/client";
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Matches, Max, Min } from "class-validator";

export class CreateShiftDefinitionDto {
	@ApiProperty({ description: "Unique shift code", example: "SHIFT-001" })
	@IsString()
	@IsNotEmpty()
	code: string;

	@ApiProperty({ description: "Shift name in English", example: "Morning Shift" })
	@IsString()
	@IsNotEmpty()
	name: string;

	@ApiPropertyOptional({ description: "Shift name in Amharic" })
	@IsString()
	@IsOptional()
	nameAm?: string;

	@ApiProperty({
		description: "Schedule type",
		enum: WorkScheduleType,
		enumName: "WorkScheduleType",
		default: WorkScheduleType.REGULAR,
	})
	@IsEnum(WorkScheduleType)
	@IsNotEmpty()
	scheduleType: WorkScheduleType;

	@ApiProperty({ description: "Start time in HH:mm format", example: "08:00" })
	@Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Start time must be in HH:mm format" })
	@IsNotEmpty()
	startTime: string;

	@ApiProperty({ description: "End time in HH:mm format", example: "17:00" })
	@Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "End time must be in HH:mm format" })
	@IsNotEmpty()
	endTime: string;

	@ApiPropertyOptional({ description: "Whether shift spans overnight", default: false })
	@IsBoolean()
	@IsOptional()
	isOvernight?: boolean;

	@ApiPropertyOptional({ description: "Break duration in minutes", default: 30 })
	@IsInt()
	@Min(0)
	@Max(120)
	@IsOptional()
	breakMinutes?: number;

	@ApiPropertyOptional({ description: "Whether to exclude holidays from working days", default: true })
	@IsBoolean()
	@IsOptional()
	holidayAware?: boolean;

	@ApiPropertyOptional({ description: "Color for UI display (hex)", example: "#3B82F6" })
	@IsString()
	@IsOptional()
	color?: string;

	@ApiPropertyOptional({ description: "Whether shift is active", default: true })
	@IsBoolean()
	@IsOptional()
	isActive?: boolean;
}

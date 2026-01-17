import { ApiPropertyOptional } from "@nestjs/swagger";
import { WorkScheduleType } from "@prisma/client";
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Matches, Max, Min } from "class-validator";

export class UpdateShiftDefinitionDto {
	@ApiPropertyOptional({ description: "Shift name in English", example: "Morning Shift" })
	@IsString()
	@IsOptional()
	name?: string;

	@ApiPropertyOptional({ description: "Shift name in Amharic" })
	@IsString()
	@IsOptional()
	nameAm?: string;

	@ApiPropertyOptional({
		description: "Schedule type",
		enum: WorkScheduleType,
		enumName: "WorkScheduleType",
	})
	@IsEnum(WorkScheduleType)
	@IsOptional()
	scheduleType?: WorkScheduleType;

	@ApiPropertyOptional({ description: "Start time in HH:mm format", example: "08:00" })
	@Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Start time must be in HH:mm format" })
	@IsOptional()
	startTime?: string;

	@ApiPropertyOptional({ description: "End time in HH:mm format", example: "17:00" })
	@Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "End time must be in HH:mm format" })
	@IsOptional()
	endTime?: string;

	@ApiPropertyOptional({ description: "Whether shift spans overnight" })
	@IsBoolean()
	@IsOptional()
	isOvernight?: boolean;

	@ApiPropertyOptional({ description: "Break duration in minutes" })
	@IsInt()
	@Min(0)
	@Max(120)
	@IsOptional()
	breakMinutes?: number;

	@ApiPropertyOptional({ description: "Whether to exclude holidays from working days" })
	@IsBoolean()
	@IsOptional()
	holidayAware?: boolean;

	@ApiPropertyOptional({ description: "Color for UI display (hex)", example: "#3B82F6" })
	@IsString()
	@IsOptional()
	color?: string;

	@ApiPropertyOptional({ description: "Whether shift is active" })
	@IsBoolean()
	@IsOptional()
	isActive?: boolean;
}

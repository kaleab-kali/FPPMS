import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { WorkScheduleType } from "@prisma/client";

export class ShiftDefinitionResponseDto {
	@ApiProperty({ description: "Shift ID" })
	id: string;

	@ApiProperty({ description: "Tenant ID" })
	tenantId: string;

	@ApiProperty({ description: "Shift code" })
	code: string;

	@ApiProperty({ description: "Shift name in English" })
	name: string;

	@ApiPropertyOptional({ description: "Shift name in Amharic" })
	nameAm?: string;

	@ApiProperty({ description: "Schedule type", enum: WorkScheduleType, enumName: "WorkScheduleType" })
	scheduleType: WorkScheduleType;

	@ApiProperty({ description: "Start time (HH:mm)" })
	startTime: string;

	@ApiProperty({ description: "End time (HH:mm)" })
	endTime: string;

	@ApiProperty({ description: "Whether shift spans overnight" })
	isOvernight: boolean;

	@ApiProperty({ description: "Break duration in minutes" })
	breakMinutes: number;

	@ApiProperty({ description: "Whether to exclude holidays" })
	holidayAware: boolean;

	@ApiPropertyOptional({ description: "Color for UI display" })
	color?: string;

	@ApiProperty({ description: "Whether shift is active" })
	isActive: boolean;

	@ApiProperty({ description: "Created timestamp" })
	createdAt: Date;

	@ApiProperty({ description: "Updated timestamp" })
	updatedAt: Date;

	@ApiPropertyOptional({ description: "Calculated working hours per day" })
	workingHours?: number;
}

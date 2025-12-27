import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class RecordNotificationDto {
	@ApiProperty({
		description: "Date when the accused employee was notified (ISO 8601 format)",
		example: "2025-01-21",
	})
	@IsDateString()
	@IsNotEmpty()
	notificationDate: string;

	@ApiPropertyOptional({
		description: "Additional notes about the notification process",
		example: "Employee was notified in person by HR officer",
		maxLength: 1000,
	})
	@IsString()
	@IsOptional()
	@MaxLength(1000)
	notes?: string;
}

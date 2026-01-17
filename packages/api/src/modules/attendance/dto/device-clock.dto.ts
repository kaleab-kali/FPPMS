import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { CLOCK_METHOD } from "./create-attendance-record.dto";

export class DeviceClockInDto {
	@ApiProperty({ description: "Employee ID (from biometric data)" })
	@IsString()
	@IsNotEmpty()
	employeeId: string;

	@ApiProperty({ description: "Device ID that recorded the clock in" })
	@IsString()
	@IsNotEmpty()
	deviceId: string;

	@ApiPropertyOptional({ description: "Clock in timestamp (defaults to now)", example: "2025-01-15T08:00:00Z" })
	@IsDateString()
	@IsOptional()
	timestamp?: string;

	@ApiProperty({
		description: "Clock method",
		enum: Object.values(CLOCK_METHOD),
		default: CLOCK_METHOD.BIOMETRIC_FINGERPRINT,
	})
	@IsString()
	@IsNotEmpty()
	method: string;
}

export class DeviceClockOutDto {
	@ApiProperty({ description: "Employee ID (from biometric data)" })
	@IsString()
	@IsNotEmpty()
	employeeId: string;

	@ApiProperty({ description: "Device ID that recorded the clock out" })
	@IsString()
	@IsNotEmpty()
	deviceId: string;

	@ApiPropertyOptional({ description: "Clock out timestamp (defaults to now)", example: "2025-01-15T17:00:00Z" })
	@IsDateString()
	@IsOptional()
	timestamp?: string;

	@ApiProperty({
		description: "Clock method",
		enum: Object.values(CLOCK_METHOD),
		default: CLOCK_METHOD.BIOMETRIC_FINGERPRINT,
	})
	@IsString()
	@IsNotEmpty()
	method: string;
}

export class DeviceClockResponseDto {
	@ApiProperty({ description: "Success status" })
	success: boolean;

	@ApiProperty({ description: "Message" })
	message: string;

	@ApiPropertyOptional({ description: "Attendance record ID if created" })
	attendanceRecordId?: string;

	@ApiPropertyOptional({ description: "Clock in/out time recorded" })
	timestamp?: Date;
}

export class DeviceRegistrationDto {
	@ApiProperty({ description: "Unique device identifier" })
	@IsString()
	@IsNotEmpty()
	deviceId: string;

	@ApiProperty({ description: "Device name/description" })
	@IsString()
	@IsNotEmpty()
	name: string;

	@ApiPropertyOptional({ description: "Location/placement of the device" })
	@IsString()
	@IsOptional()
	location?: string;

	@ApiProperty({
		description: "Type of device",
		enum: ["FINGERPRINT", "FACE_RECOGNITION", "CARD_READER", "COMBO"],
	})
	@IsString()
	@IsNotEmpty()
	deviceType: string;
}

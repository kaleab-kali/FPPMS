import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString } from "class-validator";
import { PaginationMetaDto } from "./audit-log-response.dto";

export class CreateLoginHistoryDto {
	@ApiProperty({
		description: "ID of the user attempting to login",
		example: "clx0987654321",
	})
	@IsString()
	userId: string;

	@ApiProperty({
		description: "IP address of the client",
		example: "192.168.1.100",
	})
	@IsString()
	ipAddress: string;

	@ApiPropertyOptional({
		description: "Raw user agent string from the request",
		example: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
	})
	@IsString()
	@IsOptional()
	userAgent?: string;

	@ApiPropertyOptional({
		description: "Detected device type",
		example: "desktop",
	})
	@IsString()
	@IsOptional()
	deviceType?: string;

	@ApiPropertyOptional({
		description: "Detected browser name",
		example: "Chrome",
	})
	@IsString()
	@IsOptional()
	browser?: string;

	@ApiPropertyOptional({
		description: "Detected operating system",
		example: "Windows 10",
	})
	@IsString()
	@IsOptional()
	os?: string;

	@ApiPropertyOptional({
		description: "Geographic location of the client",
		example: "Addis Ababa, Ethiopia",
	})
	@IsString()
	@IsOptional()
	location?: string;

	@ApiProperty({
		description: "Unique session identifier",
		example: "sess_abc123xyz789",
	})
	@IsString()
	sessionId: string;

	@ApiProperty({
		description: "Whether the login attempt was successful",
		example: true,
		default: true,
	})
	@IsBoolean()
	@IsOptional()
	isSuccessful?: boolean = true;

	@ApiPropertyOptional({
		description: "Reason for login failure if unsuccessful",
		example: "Invalid credentials",
	})
	@IsString()
	@IsOptional()
	failureReason?: string;
}

export class LoginHistoryResponseDto {
	@ApiProperty({
		description: "Unique identifier for the login history entry",
		example: "clx1234567890",
	})
	id: string;

	@ApiProperty({
		description: "ID of the user who attempted login",
		example: "clx0987654321",
	})
	userId: string;

	@ApiPropertyOptional({
		description: "Username of the user",
		example: "FPC-0001-25",
	})
	username: string | null;

	@ApiPropertyOptional({
		description: "Employee ID linked to the user",
		example: "emp_12345",
	})
	employeeId: string | null;

	@ApiProperty({
		description: "Timestamp of the login attempt",
		example: "2025-01-15T10:30:00.000Z",
	})
	loginAt: Date;

	@ApiPropertyOptional({
		description: "Timestamp of logout if logged out",
		example: "2025-01-15T18:30:00.000Z",
	})
	logoutAt: Date | null;

	@ApiProperty({
		description: "IP address of the client",
		example: "192.168.1.100",
	})
	ipAddress: string;

	@ApiPropertyOptional({
		description: "Raw user agent string from the request",
		example: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
	})
	userAgent: string | null;

	@ApiPropertyOptional({
		description: "Detected device type",
		example: "desktop",
	})
	deviceType: string | null;

	@ApiPropertyOptional({
		description: "Detected browser name",
		example: "Chrome",
	})
	browser: string | null;

	@ApiPropertyOptional({
		description: "Detected operating system",
		example: "Windows 10",
	})
	os: string | null;

	@ApiPropertyOptional({
		description: "Geographic location of the client",
		example: "Addis Ababa, Ethiopia",
	})
	location: string | null;

	@ApiProperty({
		description: "Session identifier",
		example: "sess_abc123xyz789",
	})
	sessionId: string;

	@ApiProperty({
		description: "Whether the login attempt was successful",
		example: true,
	})
	isSuccessful: boolean;

	@ApiPropertyOptional({
		description: "Reason for login failure if unsuccessful",
		example: "Invalid credentials",
	})
	failureReason: string | null;
}

export class PaginatedLoginHistoryResponseDto {
	@ApiProperty({
		description: "Array of login history entries",
		type: [LoginHistoryResponseDto],
	})
	data: LoginHistoryResponseDto[];

	@ApiProperty({
		description: "Pagination metadata",
		type: PaginationMetaDto,
	})
	meta: PaginationMetaDto;
}

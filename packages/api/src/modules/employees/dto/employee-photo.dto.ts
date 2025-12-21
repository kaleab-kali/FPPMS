import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateEmployeePhotoDto {
	@ApiProperty({ description: "Employee ID" })
	@IsString()
	@IsNotEmpty()
	employeeId: string;

	@ApiProperty({ description: "Capture method", enum: ["WEBCAM", "UPLOAD"] })
	@IsString()
	@IsNotEmpty()
	captureMethod: string;
}

export class EmployeePhotoResponseDto {
	id: string;
	employeeId: string;
	filePath: string;
	fileName: string;
	fileSize: number;
	mimeType: string;
	captureMethod: string;
	capturedAt: Date;
	capturedBy: string;
	isActive: boolean;
	employee?: {
		id: string;
		employeeId: string;
		fullName: string;
		fullNameAm: string;
	};
}

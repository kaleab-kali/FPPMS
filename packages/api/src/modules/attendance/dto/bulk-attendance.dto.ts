import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, ValidateNested } from "class-validator";
import { CreateAttendanceRecordDto } from "./create-attendance-record.dto";

export class BulkAttendanceDto {
	@ApiProperty({
		type: [CreateAttendanceRecordDto],
		description: "Array of attendance records to create",
	})
	@IsArray()
	@ArrayMinSize(1)
	@ValidateNested({ each: true })
	@Type(() => CreateAttendanceRecordDto)
	records: CreateAttendanceRecordDto[];
}

export class BulkAttendanceResponseDto {
	@ApiProperty({ description: "Number of records successfully created" })
	created: number;

	@ApiProperty({ description: "Number of records that failed" })
	failed: number;

	@ApiProperty({ description: "Error messages for failed records", type: [String] })
	errors: string[];
}

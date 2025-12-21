import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateMaritalStatusDto {
	@IsString()
	@IsNotEmpty()
	employeeId: string;

	@IsString()
	@IsNotEmpty()
	status: string;

	@Type(() => Date)
	@IsDate()
	@IsNotEmpty()
	effectiveDate: Date;

	@IsString()
	@IsOptional()
	certificatePath?: string;

	@IsString()
	@IsOptional()
	courtOrderPath?: string;

	@IsString()
	@IsOptional()
	remarks?: string;
}

export class UpdateMaritalStatusDto {
	@IsString()
	@IsOptional()
	status?: string;

	@Type(() => Date)
	@IsDate()
	@IsOptional()
	effectiveDate?: Date;

	@IsString()
	@IsOptional()
	certificatePath?: string;

	@IsString()
	@IsOptional()
	courtOrderPath?: string;

	@IsString()
	@IsOptional()
	remarks?: string;
}

export class MaritalStatusResponseDto {
	id: string;
	employeeId: string;
	status: string;
	effectiveDate: Date;
	certificatePath: string | null;
	courtOrderPath: string | null;
	remarks: string | null;
	recordedBy: string | null;
	createdAt: Date;
	updatedAt: Date;
}

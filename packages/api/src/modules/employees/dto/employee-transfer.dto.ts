import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateTransferDto {
	@IsString()
	@IsNotEmpty()
	employeeId: string;

	@IsString()
	@IsNotEmpty()
	targetCenterId: string;

	@IsString()
	@IsOptional()
	targetDepartmentId?: string;

	@IsString()
	@IsOptional()
	targetPositionId?: string;

	@Type(() => Date)
	@IsDate()
	@IsNotEmpty()
	effectiveDate: Date;

	@IsString()
	@IsNotEmpty()
	transferReason: string;

	@IsString()
	@IsOptional()
	remarks?: string;
}

export class ExternalTransferDto {
	@IsString()
	@IsNotEmpty()
	employeeId: string;

	@IsString()
	@IsNotEmpty()
	sourceOrganization: string;

	@Type(() => Date)
	@IsDate()
	@IsNotEmpty()
	originalEmploymentDate: Date;

	@Type(() => Date)
	@IsDate()
	@IsNotEmpty()
	transferDate: Date;

	@IsString()
	@IsOptional()
	transferReason?: string;

	@IsString()
	@IsOptional()
	remarks?: string;
}

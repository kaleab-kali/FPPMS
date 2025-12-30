import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateTransferRequestDto {
	@ApiProperty({ description: "Employee ID to transfer" })
	@IsString()
	@IsNotEmpty()
	employeeId: string;

	@ApiProperty({ description: "Target center ID" })
	@IsString()
	@IsNotEmpty()
	toCenterId: string;

	@ApiPropertyOptional({ description: "Target department ID" })
	@IsString()
	@IsOptional()
	toDepartmentId?: string;

	@ApiPropertyOptional({ description: "Target position ID" })
	@IsString()
	@IsOptional()
	toPositionId?: string;

	@ApiProperty({ description: "Effective date of transfer" })
	@Type(() => Date)
	@IsDate()
	@IsNotEmpty()
	effectiveDate: Date;

	@ApiProperty({ description: "Reason for transfer" })
	@IsString()
	@IsNotEmpty()
	transferReason: string;

	@ApiPropertyOptional({ description: "Additional remarks" })
	@IsString()
	@IsOptional()
	remarks?: string;

	@ApiPropertyOptional({ description: "Transfer order number" })
	@IsString()
	@IsOptional()
	orderNumber?: string;
}

export class AcceptTransferDto {
	@ApiPropertyOptional({ description: "Department ID at receiving center" })
	@IsString()
	@IsOptional()
	departmentId?: string;

	@ApiPropertyOptional({ description: "Position ID at receiving center" })
	@IsString()
	@IsOptional()
	positionId?: string;

	@ApiPropertyOptional({ description: "Remarks from receiving center" })
	@IsString()
	@IsOptional()
	remarks?: string;
}

export class RejectTransferDto {
	@ApiProperty({ description: "Reason for rejection" })
	@IsString()
	@IsNotEmpty()
	rejectionReason: string;
}

export class CancelTransferDto {
	@ApiProperty({ description: "Reason for cancellation" })
	@IsString()
	@IsNotEmpty()
	cancellationReason: string;
}

export class CreateDepartureDto {
	@ApiProperty({ description: "Employee ID" })
	@IsString()
	@IsNotEmpty()
	employeeId: string;

	@ApiProperty({ description: "Departure date" })
	@Type(() => Date)
	@IsDate()
	@IsNotEmpty()
	departureDate: Date;

	@ApiProperty({ description: "Reason for departure" })
	@IsString()
	@IsNotEmpty()
	departureReason: string;

	@ApiPropertyOptional({ description: "Destination organization if transferring out" })
	@IsString()
	@IsOptional()
	destinationOrganization?: string;

	@ApiPropertyOptional({ description: "Additional remarks" })
	@IsString()
	@IsOptional()
	remarks?: string;

	@ApiPropertyOptional({ description: "Whether clearance is completed" })
	@IsOptional()
	clearanceCompleted?: boolean;

	@ApiPropertyOptional({ description: "Final settlement amount" })
	@IsOptional()
	finalSettlementAmount?: number;
}

export class UpdateDepartureDto {
	@ApiPropertyOptional({ description: "Departure date" })
	@Type(() => Date)
	@IsDate()
	@IsOptional()
	departureDate?: Date;

	@ApiPropertyOptional({ description: "Reason for departure" })
	@IsString()
	@IsOptional()
	departureReason?: string;

	@ApiPropertyOptional({ description: "Destination organization" })
	@IsString()
	@IsOptional()
	destinationOrganization?: string;

	@ApiPropertyOptional({ description: "Additional remarks" })
	@IsString()
	@IsOptional()
	remarks?: string;

	@ApiPropertyOptional({ description: "Whether clearance is completed" })
	@IsOptional()
	clearanceCompleted?: boolean;

	@ApiPropertyOptional({ description: "Final settlement amount" })
	@IsOptional()
	finalSettlementAmount?: number;
}

export class AssignToHqDto {
	@ApiProperty({ description: "Employee ID to assign to HQ" })
	@IsString()
	@IsNotEmpty()
	employeeId: string;

	@ApiProperty({ description: "Effective date of HQ assignment" })
	@Type(() => Date)
	@IsDate()
	@IsNotEmpty()
	effectiveDate: Date;

	@ApiProperty({ description: "Reason for HQ assignment" })
	@IsString()
	@IsNotEmpty()
	reason: string;

	@ApiPropertyOptional({ description: "Additional remarks" })
	@IsString()
	@IsOptional()
	remarks?: string;

	@ApiPropertyOptional({ description: "Order/reference number" })
	@IsString()
	@IsOptional()
	orderNumber?: string;
}

export class AssignFromHqToCenterDto {
	@ApiProperty({ description: "Employee ID to assign from HQ to center" })
	@IsString()
	@IsNotEmpty()
	employeeId: string;

	@ApiProperty({ description: "Target center ID" })
	@IsString()
	@IsNotEmpty()
	centerId: string;

	@ApiPropertyOptional({ description: "Target department ID" })
	@IsString()
	@IsOptional()
	departmentId?: string;

	@ApiPropertyOptional({ description: "Target position ID" })
	@IsString()
	@IsOptional()
	positionId?: string;

	@ApiProperty({ description: "Effective date of center assignment" })
	@Type(() => Date)
	@IsDate()
	@IsNotEmpty()
	effectiveDate: Date;

	@ApiProperty({ description: "Reason for center assignment" })
	@IsString()
	@IsNotEmpty()
	reason: string;

	@ApiPropertyOptional({ description: "Additional remarks" })
	@IsString()
	@IsOptional()
	remarks?: string;

	@ApiPropertyOptional({ description: "Order/reference number" })
	@IsString()
	@IsOptional()
	orderNumber?: string;
}

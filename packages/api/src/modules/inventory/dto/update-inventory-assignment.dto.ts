import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsDateString, IsOptional, IsString } from "class-validator";

export class UpdateInventoryAssignmentDto {
	@ApiPropertyOptional({ description: "Serial number" })
	@IsString()
	@IsOptional()
	serialNumber?: string;

	@ApiPropertyOptional({ description: "Asset tag" })
	@IsString()
	@IsOptional()
	assetTag?: string;

	@ApiPropertyOptional({ description: "Size" })
	@IsString()
	@IsOptional()
	size?: string;

	@ApiPropertyOptional({ description: "Whether assignment is permanent" })
	@IsBoolean()
	@IsOptional()
	isPermanent?: boolean;

	@ApiPropertyOptional({ description: "Expected return date (YYYY-MM-DD)" })
	@IsDateString()
	@IsOptional()
	expectedReturnDate?: string;

	@ApiPropertyOptional({ description: "Additional remarks" })
	@IsString()
	@IsOptional()
	remarks?: string;
}

export class ReturnInventoryDto {
	@ApiPropertyOptional({ description: "Return date (YYYY-MM-DD). Defaults to today." })
	@IsDateString()
	@IsOptional()
	returnedDate?: string;

	@ApiPropertyOptional({ description: "Condition at return" })
	@IsString()
	@IsOptional()
	conditionAtReturn?: string;

	@ApiPropertyOptional({ description: "Whether item is lost" })
	@IsBoolean()
	@IsOptional()
	isLost?: boolean;

	@ApiPropertyOptional({ description: "Whether item is damaged" })
	@IsBoolean()
	@IsOptional()
	isDamaged?: boolean;

	@ApiPropertyOptional({ description: "Damage notes if damaged" })
	@IsString()
	@IsOptional()
	damageNotes?: string;

	@ApiPropertyOptional({ description: "Cost recovery amount if lost/damaged" })
	@IsString()
	@IsOptional()
	costRecovery?: string;
}

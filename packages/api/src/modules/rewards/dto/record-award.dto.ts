import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsOptional, IsString } from "class-validator";

export class RecordAwardDto {
	@ApiProperty({
		description: "Date when the award was given",
		example: "2025-03-01",
	})
	@IsDateString()
	awardDate: string;

	@ApiPropertyOptional({
		description: "Details about the ceremony",
		example: "Annual recognition ceremony held at headquarters",
	})
	@IsString()
	@IsOptional()
	ceremonyDetails?: string;

	@ApiPropertyOptional({
		description: "Certificate number issued",
		example: "CERT-2025-0001",
	})
	@IsString()
	@IsOptional()
	certificateNumber?: string;

	@ApiPropertyOptional({
		description: "Path to the uploaded certificate file",
		example: "/uploads/certificates/cert-2025-0001.pdf",
	})
	@IsString()
	@IsOptional()
	certificatePath?: string;

	@ApiPropertyOptional({
		description: "Path to the uploaded photo from the ceremony",
		example: "/uploads/photos/ceremony-2025-0001.jpg",
	})
	@IsString()
	@IsOptional()
	photoPath?: string;

	@ApiPropertyOptional({
		description: "Additional notes about the award",
		example: "Commissioner personally presented the award",
	})
	@IsString()
	@IsOptional()
	notes?: string;
}

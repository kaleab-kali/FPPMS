import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { AttachableType } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class UploadAttachmentDto {
	@ApiProperty({
		description: "The type of entity this attachment belongs to",
		enum: AttachableType,
		enumName: "AttachableType",
		example: AttachableType.EMPLOYEE,
	})
	@IsEnum(AttachableType)
	@IsNotEmpty()
	attachableType: AttachableType;

	@ApiProperty({
		description: "The ID of the entity this attachment belongs to",
		example: "clx1234567890abcdef",
	})
	@IsString()
	@IsNotEmpty()
	attachableId: string;

	@ApiProperty({
		description: "Title of the attachment",
		example: "Employment Contract",
		maxLength: 200,
	})
	@IsString()
	@IsNotEmpty()
	@MaxLength(200)
	title: string;

	@ApiPropertyOptional({
		description: "Category to organize attachments",
		example: "contracts",
		maxLength: 100,
	})
	@IsString()
	@IsOptional()
	@MaxLength(100)
	category?: string;

	@ApiPropertyOptional({
		description: "Description of the attachment",
		example: "Signed employment contract dated 2025-01-15",
		maxLength: 500,
	})
	@IsString()
	@IsOptional()
	@MaxLength(500)
	description?: string;
}

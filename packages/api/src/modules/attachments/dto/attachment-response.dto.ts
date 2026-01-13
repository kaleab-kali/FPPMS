import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { AttachableType } from "@prisma/client";

export class AttachmentResponseDto {
	@ApiProperty({
		description: "Unique identifier of the attachment",
		example: "clx1234567890abcdef",
	})
	id: string;

	@ApiProperty({
		description: "Tenant ID the attachment belongs to",
		example: "clx0987654321fedcba",
	})
	tenantId: string;

	@ApiProperty({
		description: "The type of entity this attachment belongs to",
		enum: AttachableType,
		enumName: "AttachableType",
		example: AttachableType.EMPLOYEE,
	})
	attachableType: AttachableType;

	@ApiProperty({
		description: "The ID of the entity this attachment belongs to",
		example: "clx1234567890abcdef",
	})
	attachableId: string;

	@ApiPropertyOptional({
		description: "Category of the attachment",
		example: "contracts",
		nullable: true,
	})
	category: string | null;

	@ApiProperty({
		description: "Title of the attachment",
		example: "Employment Contract",
	})
	title: string;

	@ApiPropertyOptional({
		description: "Description of the attachment",
		example: "Signed employment contract dated 2025-01-15",
		nullable: true,
	})
	description: string | null;

	@ApiProperty({
		description: "Server path to the file",
		example: "uploads/attachments/tenant123/EMPLOYEE/emp456/1705312800000-abc123.pdf",
	})
	filePath: string;

	@ApiProperty({
		description: "Original filename of the uploaded file",
		example: "employment_contract.pdf",
	})
	fileName: string;

	@ApiProperty({
		description: "File size in bytes",
		example: 1048576,
	})
	fileSize: number;

	@ApiProperty({
		description: "MIME type of the file",
		example: "application/pdf",
	})
	mimeType: string;

	@ApiPropertyOptional({
		description: "SHA-256 hash of the file content",
		example: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
		nullable: true,
	})
	fileHash: string | null;

	@ApiProperty({
		description: "ID of the user who uploaded the file",
		example: "clx1234567890abcdef",
	})
	uploadedBy: string;

	@ApiProperty({
		description: "Timestamp when the file was uploaded",
		example: "2025-01-15T10:30:00.000Z",
	})
	uploadedAt: Date;

	@ApiPropertyOptional({
		description: "Timestamp when the attachment was soft deleted",
		example: null,
		nullable: true,
	})
	deletedAt: Date | null;
}

export class AttachmentListResponseDto {
	@ApiProperty({
		description: "List of attachments",
		type: [AttachmentResponseDto],
	})
	data: AttachmentResponseDto[];

	@ApiProperty({
		description: "Total number of attachments matching the filter",
		example: 25,
	})
	total: number;
}

export class AttachmentDeleteResponseDto {
	@ApiProperty({
		description: "Success message",
		example: "Attachment deleted successfully",
	})
	message: string;
}

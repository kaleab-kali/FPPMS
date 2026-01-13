export type AttachableType =
	| "EMPLOYEE"
	| "COMPLAINT"
	| "INVENTORY"
	| "WEAPON"
	| "DOCUMENT"
	| "TRANSFER"
	| "RETIREMENT"
	| "APPRAISAL"
	| "LEAVE_REQUEST"
	| "CENTER";

export interface Attachment {
	id: string;
	tenantId: string;
	attachableType: AttachableType;
	attachableId: string;
	category: string | null;
	title: string;
	description: string | null;
	filePath: string;
	fileName: string;
	fileSize: number;
	mimeType: string;
	fileHash: string | null;
	uploadedBy: string;
	uploadedAt: string;
	deletedAt: string | null;
}

export interface UploadAttachmentRequest {
	attachableType: AttachableType;
	attachableId: string;
	title: string;
	category?: string;
	description?: string;
	file: File;
}

export interface AttachmentListResponse {
	data: Attachment[];
	total: number;
}

export interface AttachmentDeleteResponse {
	message: string;
}

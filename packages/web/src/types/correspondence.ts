export type DocumentDirection = "INCOMING" | "OUTGOING";

export interface DocumentAttachment {
	id: string;
	filePath: string;
	fileName: string;
	fileSize: number;
	mimeType: string;
	uploadedBy: string;
	uploadedAt: string;
}

export interface CorrespondenceDocument {
	id: string;
	tenantId: string;
	documentTypeId: string;
	documentTypeName?: string;
	referenceNumber: string;
	direction: DocumentDirection;
	documentDate: string;
	receivedDate?: string;
	sentDate?: string;
	sourceOrganization?: string;
	destinationOrganization?: string;
	senderName?: string;
	recipientName?: string;
	subject: string;
	summary?: string;
	priority: string;
	actionRequired?: string;
	deadline?: string;
	assignedTo?: string;
	assignedDepartmentId?: string;
	assignedDepartmentName?: string;
	filePath?: string;
	status: string;
	registeredBy: string;
	folderNumber?: string;
	shelfNumber?: string;
	officeLocation?: string;
	responseDeadline?: string;
	responseDate?: string;
	isUrgent: boolean;
	concernedEmployeeId?: string;
	concernedEmployeeName?: string;
	centerId?: string;
	centerName?: string;
	category?: string;
	isOverdue: boolean;
	isResponseOverdue: boolean;
	attachments?: DocumentAttachment[];
	createdAt: string;
	updatedAt: string;
}

export interface CreateCorrespondenceDto {
	documentTypeId: string;
	direction: DocumentDirection;
	documentDate: string;
	receivedDate?: string;
	sentDate?: string;
	sourceOrganization?: string;
	destinationOrganization?: string;
	subject: string;
	summary?: string;
	priority?: string;
	actionRequired?: string;
	deadline?: string;
	assignedTo?: string;
	assignedDepartmentId?: string;
	filePath?: string;
	folderNumber?: string;
	shelfNumber?: string;
	officeLocation?: string;
	responseDeadline?: string;
	isUrgent?: boolean;
	concernedEmployeeId?: string;
	centerId?: string;
	category?: string;
}

export interface UpdateCorrespondenceDto {
	subject?: string;
	summary?: string;
	priority?: string;
	actionRequired?: string;
	deadline?: string;
	assignedTo?: string;
	assignedDepartmentId?: string;
	status?: string;
	folderNumber?: string;
	shelfNumber?: string;
	officeLocation?: string;
	responseDeadline?: string;
	responseDate?: string;
	isUrgent?: boolean;
	concernedEmployeeId?: string;
	centerId?: string;
	category?: string;
}

export interface CorrespondenceFilter {
	page?: number;
	limit?: number;
	direction?: DocumentDirection;
	documentTypeId?: string;
	status?: string;
	priority?: string;
	category?: string;
	centerId?: string;
	concernedEmployeeId?: string;
	assignedDepartmentId?: string;
	isUrgent?: boolean;
	startDate?: string;
	endDate?: string;
	isOverdue?: boolean;
	isResponseOverdue?: boolean;
	search?: string;
}

export const DOCUMENT_PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"] as const;

export const DOCUMENT_CATEGORIES = ["LEGAL", "HR", "FINANCE", "OPERATIONS", "GENERAL"] as const;

export const DOCUMENT_STATUSES = ["PENDING", "IN_PROGRESS", "RESPONDED", "COMPLETED", "ARCHIVED"] as const;

export type AuditAction =
	| "CREATE"
	| "UPDATE"
	| "DELETE"
	| "VIEW"
	| "LOGIN"
	| "LOGOUT"
	| "APPROVE"
	| "REJECT"
	| "EXPORT"
	| "IMPORT";

export interface AuditLog {
	id: string;
	tenantId: string;
	timestamp: Date;
	userId: string | null;
	username: string | null;
	userRole: string | null;
	userCenter: string | null;
	action: AuditAction;
	module: string;
	resource: string;
	resourceId: string | null;
	ipAddress: string;
	userAgent: string | null;
	deviceType: string | null;
	browser: string | null;
	os: string | null;
	sessionId: string | null;
	requestId: string | null;
	previousValue: Record<string, unknown> | null;
	newValue: Record<string, unknown> | null;
	changedFields: string[];
	description: string | null;
	reason: string | null;
	relatedAuditId: string | null;
}

export interface LoginHistory {
	id: string;
	userId: string;
	username: string | null;
	employeeId: string | null;
	loginAt: Date;
	logoutAt: Date | null;
	ipAddress: string;
	userAgent: string | null;
	deviceType: string | null;
	browser: string | null;
	os: string | null;
	location: string | null;
	sessionId: string;
	isSuccessful: boolean;
	failureReason: string | null;
}

export interface AuditLogFilter {
	page?: number;
	limit?: number;
	dateFrom?: string;
	dateTo?: string;
	userId?: string;
	action?: AuditAction;
	module?: string;
	resource?: string;
	resourceId?: string;
	ipAddress?: string;
	search?: string;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}

export interface AuditLogListResponse {
	data: AuditLog[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
	};
}

export interface LoginHistoryListResponse {
	data: LoginHistory[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
	};
}

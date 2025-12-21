export interface MaritalStatusRecord {
	id: string;
	tenantId: string;
	employeeId: string;
	status: string;
	effectiveDate: string;
	certificatePath: string | null;
	courtOrderPath: string | null;
	remarks: string | null;
	recordedBy: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface CreateMaritalStatusRequest {
	employeeId: string;
	status: string;
	effectiveDate: string;
	certificatePath?: string;
	courtOrderPath?: string;
	remarks?: string;
}

export interface UpdateMaritalStatusRequest {
	status?: string;
	effectiveDate?: string;
	certificatePath?: string;
	courtOrderPath?: string;
	remarks?: string;
}

export interface CurrentMaritalStatus {
	currentStatus: string | null;
	marriageDate: string | null;
	lastChange: MaritalStatusRecord | null;
}

export const MARITAL_STATUSES = {
	SINGLE: "SINGLE",
	MARRIED: "MARRIED",
	DIVORCED: "DIVORCED",
	WIDOWED: "WIDOWED",
	SEPARATED: "SEPARATED",
} as const;

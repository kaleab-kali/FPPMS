export interface InternalTransferRequest {
	employeeId: string;
	targetCenterId: string;
	targetDepartmentId?: string;
	targetPositionId?: string;
	effectiveDate: string;
	transferReason: string;
	remarks?: string;
}

export interface ExternalTransferRequest {
	employeeId: string;
	sourceOrganization: string;
	originalEmploymentDate: string;
	transferDate: string;
	transferReason?: string;
	remarks?: string;
}

export interface TransferHistory {
	id: string;
	employeeId: string;
	fullName: string;
	isTransfer: boolean;
	sourceOrganization: string | null;
	originalEmploymentDate: string | null;
	employmentDate: string;
	center: {
		id: string;
		name: string;
		nameAm: string | null;
	} | null;
	department: {
		id: string;
		name: string;
		nameAm: string | null;
	} | null;
	position: {
		id: string;
		name: string;
		nameAm: string | null;
	} | null;
}

export interface ExternalTransferEmployee {
	id: string;
	employeeId: string;
	fullName: string;
	fullNameAm: string | null;
	sourceOrganization: string | null;
	originalEmploymentDate: string | null;
	employmentDate: string;
	center: {
		id: string;
		name: string;
		nameAm: string | null;
	} | null;
}

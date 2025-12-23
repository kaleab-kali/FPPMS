export type TransferStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";
export type TransferSource = "MANUAL" | "APPRAISAL";

export interface CreateTransferRequestDto {
	employeeId: string;
	toCenterId: string;
	toDepartmentId?: string;
	toPositionId?: string;
	effectiveDate: string;
	transferReason: string;
	remarks?: string;
	orderNumber?: string;
}

export interface AcceptTransferDto {
	departmentId?: string;
	positionId?: string;
	remarks?: string;
}

export interface RejectTransferDto {
	rejectionReason: string;
}

export interface CancelTransferDto {
	cancellationReason: string;
}

export interface CreateDepartureDto {
	employeeId: string;
	departureDate: string;
	departureReason: string;
	destinationOrganization?: string;
	remarks?: string;
	clearanceCompleted?: boolean;
	finalSettlementAmount?: number;
}

export interface UpdateDepartureDto {
	departureDate?: string;
	departureReason?: string;
	destinationOrganization?: string;
	remarks?: string;
	clearanceCompleted?: boolean;
	finalSettlementAmount?: number;
}

export interface TransferRequest {
	id: string;
	tenantId: string;
	employeeId: string;
	transferSource: TransferSource;
	status: TransferStatus;
	fromCenterId: string;
	fromDepartmentId: string | null;
	fromPositionId: string | null;
	toCenterId: string;
	toDepartmentId: string | null;
	toPositionId: string | null;
	effectiveDate: string;
	transferReason: string;
	remarks: string | null;
	orderNumber: string | null;
	attachmentPath: string | null;
	initiatedBy: string;
	initiatedAt: string;
	reviewedBy: string | null;
	reviewedAt: string | null;
	rejectionReason: string | null;
	appraisalId: string | null;
	completedAt: string | null;
	employee: {
		id: string;
		employeeId: string;
		fullName: string;
		fullNameAm: string | null;
	};
	fromCenter: {
		id: string;
		name: string;
		nameAm: string | null;
	};
	fromDepartment: {
		id: string;
		name: string;
		nameAm: string | null;
	} | null;
	fromPosition: {
		id: string;
		name: string;
		nameAm: string | null;
	} | null;
	toCenter: {
		id: string;
		name: string;
		nameAm: string | null;
	};
	toDepartment: {
		id: string;
		name: string;
		nameAm: string | null;
	} | null;
	toPosition: {
		id: string;
		name: string;
		nameAm: string | null;
	} | null;
	initiator: {
		id: string;
		firstName: string;
		lastName: string;
	};
	reviewer: {
		id: string;
		firstName: string;
		lastName: string;
	} | null;
}

export interface DepartureAttachment {
	id: string;
	departureId: string;
	fileName: string;
	filePath: string;
	fileSize: number;
	mimeType: string;
	documentType: string;
	uploadedBy: string;
	uploadedAt: string;
}

export interface EmployeeDeparture {
	id: string;
	tenantId: string;
	employeeId: string;
	departureDate: string;
	departureReason: string;
	destinationOrganization: string | null;
	remarks: string | null;
	clearanceCompleted: boolean;
	finalSettlementAmount: string | null;
	recordedBy: string;
	createdAt: string;
	updatedAt: string;
	employee: {
		id: string;
		employeeId: string;
		fullName: string;
		fullNameAm: string | null;
		centerId: string | null;
		departmentId: string | null;
		positionId: string | null;
	};
	attachments: DepartureAttachment[];
	recorder: {
		id: string;
		firstName: string;
		lastName: string;
	};
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

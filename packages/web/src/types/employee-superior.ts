export interface EmployeeBasicInfo {
	id: string;
	employeeId: string;
	fullName: string;
	fullNameAm: string | null;
	currentPhotoId: string | null;
	position: { id: string; name: string; nameAm: string | null } | null;
	department: { id: string; name: string; nameAm: string | null } | null;
	rank: { id: string; name: string; nameAm: string | null } | null;
}

export interface EmployeeWithSuperior extends EmployeeBasicInfo {
	directSuperior: EmployeeBasicInfo | null;
	subordinateCount: number;
}

export interface SuperiorAssignmentHistory {
	id: string;
	tenantId: string;
	employeeId: string;
	previousSuperiorId: string | null;
	newSuperiorId: string | null;
	assignedDate: string;
	endDate: string | null;
	reason: string | null;
	remarks: string | null;
	assignedBy: string;
	createdAt: string;
	previousSuperior: EmployeeBasicInfo | null;
}

export interface AssignSuperiorDto {
	superiorId: string;
	effectiveDate: string;
	reason?: string;
	remarks?: string;
}

export interface BulkAssignSuperiorDto {
	employeeIds: string[];
	superiorId: string;
	effectiveDate: string;
	reason?: string;
	remarks?: string;
}

export interface RemoveSuperiorDto {
	effectiveDate: string;
	reason?: string;
	remarks?: string;
}

export interface OrgChartNode extends EmployeeBasicInfo {
	subordinates?: OrgChartNode[];
}

export interface Department {
	id: string;
	tenantId: string;
	code: string;
	name: string;
	nameAm?: string;
	description?: string;
	parentId?: string;
	headEmployeeId?: string;
	sortOrder: number;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface CreateDepartmentRequest {
	code: string;
	name: string;
	nameAm?: string;
	description?: string;
	parentId?: string;
	headEmployeeId?: string;
	sortOrder?: number;
	isActive?: boolean;
}

export interface UpdateDepartmentRequest {
	name?: string;
	nameAm?: string;
	description?: string;
	parentId?: string;
	headEmployeeId?: string;
	sortOrder?: number;
	isActive?: boolean;
}

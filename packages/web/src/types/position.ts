export interface Position {
	id: string;
	tenantId: string;
	code: string;
	name: string;
	nameAm?: string;
	description?: string;
	departmentId?: string;
	sortOrder: number;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface CreatePositionRequest {
	code: string;
	name: string;
	nameAm?: string;
	description?: string;
	departmentId?: string;
	sortOrder?: number;
	isActive?: boolean;
}

export interface UpdatePositionRequest {
	name?: string;
	nameAm?: string;
	description?: string;
	departmentId?: string;
	sortOrder?: number;
	isActive?: boolean;
}

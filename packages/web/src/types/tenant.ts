export interface Tenant {
	id: string;
	name: string;
	nameAm?: string;
	code: string;
	type?: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface CreateTenantRequest {
	name: string;
	code: string;
	nameAm?: string;
	type?: string;
	isActive?: boolean;
}

export interface UpdateTenantRequest {
	name?: string;
	nameAm?: string;
	type?: string;
	isActive?: boolean;
}

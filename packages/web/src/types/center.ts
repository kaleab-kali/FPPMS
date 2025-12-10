export interface Center {
	id: string;
	tenantId: string;
	code: string;
	name: string;
	nameAm?: string;
	type?: string;
	regionId?: string;
	subCityId?: string;
	woredaId?: string;
	address?: string;
	phone?: string;
	email?: string;
	parentCenterId?: string;
	commanderId?: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface CreateCenterRequest {
	code: string;
	name: string;
	nameAm?: string;
	type?: string;
	regionId?: string;
	subCityId?: string;
	woredaId?: string;
	address?: string;
	phone?: string;
	email?: string;
	parentCenterId?: string;
	commanderId?: string;
	isActive?: boolean;
}

export interface UpdateCenterRequest {
	name?: string;
	nameAm?: string;
	type?: string;
	regionId?: string;
	subCityId?: string;
	woredaId?: string;
	address?: string;
	phone?: string;
	email?: string;
	parentCenterId?: string;
	commanderId?: string;
	isActive?: boolean;
}

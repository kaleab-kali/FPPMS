export interface Region {
	id: string;
	code: string;
	name: string;
	nameAm: string;
	sortOrder: number;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface CreateRegionRequest {
	code: string;
	name: string;
	nameAm: string;
	sortOrder?: number;
	isActive?: boolean;
}

export interface UpdateRegionRequest {
	name?: string;
	nameAm?: string;
	sortOrder?: number;
	isActive?: boolean;
}

export interface SubCity {
	id: string;
	regionId: string;
	region?: Region;
	code: string;
	name: string;
	nameAm: string;
	sortOrder: number;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface CreateSubCityRequest {
	regionId: string;
	code: string;
	name: string;
	nameAm: string;
	sortOrder?: number;
	isActive?: boolean;
}

export interface UpdateSubCityRequest {
	name?: string;
	nameAm?: string;
	sortOrder?: number;
	isActive?: boolean;
}

export interface Woreda {
	id: string;
	subCityId: string;
	subCity?: SubCity;
	code: string;
	name: string;
	nameAm: string;
	sortOrder: number;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface CreateWoredaRequest {
	subCityId: string;
	code: string;
	name: string;
	nameAm: string;
	sortOrder?: number;
	isActive?: boolean;
}

export interface UpdateWoredaRequest {
	name?: string;
	nameAm?: string;
	sortOrder?: number;
	isActive?: boolean;
}

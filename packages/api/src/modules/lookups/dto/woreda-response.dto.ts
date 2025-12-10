export class SubCityNestedDto {
	id: string;
	code: string;
	name: string;
	nameAm: string;
}

export class WoredaResponseDto {
	id: string;
	tenantId: string;
	subCityId: string;
	code: string;
	name: string;
	nameAm: string;
	sortOrder: number;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
	subCity?: SubCityNestedDto;
}

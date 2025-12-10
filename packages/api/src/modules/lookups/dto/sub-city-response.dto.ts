export class RegionNestedDto {
	id: string;
	code: string;
	name: string;
	nameAm: string;
}

export class SubCityResponseDto {
	id: string;
	tenantId: string;
	regionId: string;
	code: string;
	name: string;
	nameAm: string;
	sortOrder: number;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
	region?: RegionNestedDto;
}

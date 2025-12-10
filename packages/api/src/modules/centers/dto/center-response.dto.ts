export class CenterResponseDto {
	id: string;
	tenantId: string;
	code: string;
	name: string;
	nameAm: string | undefined;
	type: string;
	regionId: string | undefined;
	subCityId: string | undefined;
	woredaId: string | undefined;
	address: string | undefined;
	phone: string | undefined;
	email: string | undefined;
	parentCenterId: string | undefined;
	commanderId: string | undefined;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

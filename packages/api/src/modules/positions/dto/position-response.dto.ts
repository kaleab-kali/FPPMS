export class PositionResponseDto {
	id: string;
	tenantId: string;
	departmentId: string | undefined;
	code: string;
	name: string;
	nameAm: string | undefined;
	description: string | undefined;
	sortOrder: number;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

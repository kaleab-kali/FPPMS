export class PositionDepartmentDto {
	id: string;
	name: string;
	nameAm: string | undefined;
}

export class PositionResponseDto {
	id: string;
	tenantId: string;
	departmentId: string | undefined;
	department: PositionDepartmentDto | undefined;
	code: string;
	name: string;
	nameAm: string | undefined;
	description: string | undefined;
	sortOrder: number;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

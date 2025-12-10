export class DepartmentResponseDto {
	id: string;
	tenantId: string;
	code: string;
	name: string;
	nameAm: string | undefined;
	description: string | undefined;
	parentId: string | undefined;
	headEmployeeId: string | undefined;
	sortOrder: number;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

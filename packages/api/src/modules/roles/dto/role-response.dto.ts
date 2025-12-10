export class RolePermissionDto {
	id: string;
	module: string;
	action: string;
	resource: string;
	description?: string;
}

export class RoleResponseDto {
	id: string;
	tenantId: string | undefined;
	code: string;
	name: string;
	nameAm: string | undefined;
	description: string | undefined;
	isSystemRole: boolean;
	level: number;
	accessScope: string;
	isActive: boolean;
	permissions: RolePermissionDto[];
	createdAt: Date;
	updatedAt: Date;
}

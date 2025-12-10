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
	createdAt: Date;
	updatedAt: Date;
}

import type { Permission } from "#web/types/permission.ts";

export interface Role {
	id: string;
	tenantId?: string;
	code: string;
	name: string;
	nameAm?: string;
	description?: string;
	isSystemRole: boolean;
	level: number;
	accessScope: string;
	isActive: boolean;
	permissions: Permission[];
	createdAt: string;
	updatedAt: string;
}

export interface CreateRoleRequest {
	code: string;
	name: string;
	nameAm?: string;
	description?: string;
	level?: number;
	accessScope?: string;
	isActive?: boolean;
	permissionIds?: string[];
}

export interface UpdateRoleRequest {
	name?: string;
	nameAm?: string;
	description?: string;
	level?: number;
	accessScope?: string;
	isActive?: boolean;
	permissionIds?: string[];
}

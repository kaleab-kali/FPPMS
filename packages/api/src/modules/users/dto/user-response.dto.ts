export class UserRoleDto {
	id: string;
	code: string;
	name: string;
}

export class UserResponseDto {
	id: string;
	tenantId: string;
	centerId: string | undefined;
	employeeId: string | undefined;
	username: string;
	email: string | undefined;
	status: string;
	mustChangePassword: boolean;
	lastLoginAt: Date | undefined;
	roles: UserRoleDto[];
	createdAt: Date;
	updatedAt: Date;
}

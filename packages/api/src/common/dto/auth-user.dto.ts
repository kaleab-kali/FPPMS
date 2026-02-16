export class AuthUserDto {
	id: string;
	username: string;
	tenantId: string;
	centerId?: string;
	employeeId?: string;
	roles: string[];
	permissions: string[];
	accessScopes: string[];
	effectiveAccessScope: string;
}

export class AuthUserDto {
	id: string;
	username: string;
	tenantId: string;
	centerId?: string;
	roles: string[];
	permissions: string[];
}

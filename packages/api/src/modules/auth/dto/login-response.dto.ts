export class LoginUserDto {
	id: string;
	username: string;
	tenantId: string;
	centerId: string | undefined;
	employeeId: string | undefined;
	roles: string[];
	permissions: string[];
	requirePasswordChange: boolean;
	permissionVersion: number;
}

export class LoginResponseDto {
	accessToken: string;
	refreshToken: string;
	user: LoginUserDto;
}

export class RefreshTokenResponseDto {
	accessToken: string;
	refreshToken: string;
}

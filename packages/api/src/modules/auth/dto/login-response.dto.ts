export class LoginUserDto {
	id: string;
	username: string;
	tenantId: string;
	centerId: string | undefined;
	roles: string[];
	permissions: string[];
	requirePasswordChange: boolean;
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

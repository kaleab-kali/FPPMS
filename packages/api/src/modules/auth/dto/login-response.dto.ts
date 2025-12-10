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
	user: LoginUserDto;
}

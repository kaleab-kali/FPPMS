export interface LoginRequest {
	username: string;
	password: string;
}

export interface LoginResponse {
	accessToken: string;
	refreshToken: string;
	user: AuthUser;
}

export interface AuthUser {
	id: string;
	username: string;
	email: string;
	firstName: string;
	lastName: string;
	role: {
		id: string;
		name: string;
		code: string;
	};
	tenantId: string;
	centerId?: string;
	isActive: boolean;
}

export interface ChangePasswordRequest {
	currentPassword: string;
	newPassword: string;
}

export interface RefreshTokenRequest {
	refreshToken: string;
}

export interface RefreshTokenResponse {
	accessToken: string;
	refreshToken: string;
}

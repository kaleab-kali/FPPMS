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
	tenantId: string;
	centerId?: string;
	employeeId?: string;
	roles: string[];
	permissions: string[];
	requirePasswordChange: boolean;
	permissionVersion: number;
}

export interface ChangePasswordRequest {
	currentPassword: string;
	newPassword: string;
	confirmPassword: string;
}

export interface RefreshTokenRequest {
	refreshToken: string;
}

export interface RefreshTokenResponse {
	accessToken: string;
	refreshToken: string;
}

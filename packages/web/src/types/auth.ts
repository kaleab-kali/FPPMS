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
	accessScopes: string[];
	effectiveAccessScope: string;
	requirePasswordChange: boolean;
	permissionVersion: number;
}

export const ACCESS_SCOPES = {
	ALL_CENTERS: "ALL_CENTERS",
	OWN_CENTER: "OWN_CENTER",
} as const;

export type AccessScope = (typeof ACCESS_SCOPES)[keyof typeof ACCESS_SCOPES];

export const canAccessAllCenters = (effectiveAccessScope: string): boolean => {
	return effectiveAccessScope === ACCESS_SCOPES.ALL_CENTERS;
};

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

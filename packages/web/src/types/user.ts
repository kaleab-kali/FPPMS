export interface UserRole {
	id: string;
	code: string;
	name: string;
}

export interface User {
	id: string;
	tenantId: string;
	centerId?: string;
	employeeId?: string;
	username: string;
	email?: string;
	status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING";
	mustChangePassword: boolean;
	lastLoginAt?: string;
	roles: UserRole[];
	createdAt: string;
	updatedAt: string;
}

export interface CreateUserRequest {
	username: string;
	email?: string;
	password: string;
	centerId?: string;
	employeeId?: string;
	roleIds?: string[];
}

export interface UpdateUserRequest {
	email?: string;
	centerId?: string;
	status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING";
	mustChangePassword?: boolean;
	roleIds?: string[];
}

export interface ResetPasswordRequest {
	newPassword: string;
}

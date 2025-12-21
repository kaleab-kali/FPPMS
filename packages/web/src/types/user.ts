export interface UserRole {
	id: string;
	code: string;
	name: string;
}

export type UserStatus = "ACTIVE" | "INACTIVE" | "LOCKED" | "PENDING" | "TRANSFERRED" | "TERMINATED";

export interface User {
	id: string;
	tenantId: string;
	centerId?: string;
	employeeId?: string;
	username: string;
	email?: string;
	status: UserStatus;
	mustChangePassword: boolean;
	lastLoginAt?: string;
	roles: UserRole[];
	createdAt: string;
	updatedAt: string;
	statusChangedAt?: string;
	statusChangeReason?: string;
}

export interface AvailableEmployee {
	id: string;
	employeeId: string;
	fullName: string;
	fullNameAm: string;
	departmentName?: string;
	positionName?: string;
}

export interface CreateUserFromEmployeeRequest {
	employeeId: string;
	centerId?: string;
	roleIds?: string[];
	newDepartmentId?: string;
	newPositionId?: string;
}

export interface CreateUserFromEmployeeResponse {
	user: User;
	generatedUsername: string;
	generatedPassword: string;
}

export interface CreateUserRequest {
	employeeId: string;
	username: string;
	password: string;
	centerId?: string;
	roleIds?: string[];
}

export interface UpdateUserRequest {
	email?: string;
	centerId?: string;
	status?: UserStatus;
	mustChangePassword?: boolean;
	roleIds?: string[];
}

export interface ChangeUserStatusRequest {
	status: UserStatus;
	reason: string;
}

export interface ResetPasswordResponse {
	message: string;
	newPassword: string;
}

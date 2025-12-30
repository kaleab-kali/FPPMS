import { Request } from "express";

export interface JwtPayload {
	sub: string;
	username: string;
	tenantId: string;
	centerId?: string;
	employeeId?: string;
	roles: string[];
	permissions: string[];
	accessScopes: string[];
	effectiveAccessScope: string;
	iat?: number;
	exp?: number;
}

export interface RequestUser {
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

export interface RequestWithUser extends Request {
	user: RequestUser;
	tenantId?: string;
}

import { Request } from "express";

export interface JwtPayload {
	sub: string;
	username: string;
	tenantId: string;
	centerId?: string;
	roles: string[];
	permissions: string[];
	iat?: number;
	exp?: number;
}

export interface RequestUser {
	id: string;
	username: string;
	tenantId: string;
	centerId?: string;
	roles: string[];
	permissions: string[];
}

export interface RequestWithUser extends Request {
	user: RequestUser;
	tenantId?: string;
}

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

interface JwtPayloadData {
	sub: string;
	username: string;
	tenantId: string;
	centerId?: string;
	roles: string[];
	permissions: string[];
}

interface ValidatedUser {
	id: string;
	username: string;
	tenantId: string;
	centerId?: string;
	roles: string[];
	permissions: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(configService: ConfigService) {
		const secret = configService.get<string>("auth.jwtSecret") || "default-secret-change-in-production";
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: secret,
		});
	}

	validate(payload: JwtPayloadData): ValidatedUser {
		return {
			id: payload.sub,
			username: payload.username,
			tenantId: payload.tenantId,
			centerId: payload.centerId,
			roles: payload.roles,
			permissions: payload.permissions,
		};
	}
}

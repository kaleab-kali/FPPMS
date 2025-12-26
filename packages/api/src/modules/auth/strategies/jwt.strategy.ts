import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "#api/database/prisma.service";

interface JwtPayloadData {
	sub: string;
	username: string;
	tenantId: string;
	centerId?: string;
	roles: string[];
	permissions: string[];
	permissionVersion?: number;
}

interface ValidatedUser {
	id: string;
	username: string;
	tenantId: string;
	centerId?: string;
	roles: string[];
	permissions: string[];
	permissionVersion: number;
}

const ACTIVE_STATUSES = ["ACTIVE", "PENDING"] as const;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		configService: ConfigService,
		private prisma: PrismaService,
	) {
		const secret = configService.get<string>("auth.jwtSecret") || "default-secret-change-in-production";
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: secret,
		});
	}

	async validate(payload: JwtPayloadData): Promise<ValidatedUser> {
		const user = await this.prisma.user.findFirst({
			where: {
				id: payload.sub,
				deletedAt: null,
			},
			select: {
				id: true,
				status: true,
				permissionVersion: true,
			},
		});

		if (!user) {
			throw new UnauthorizedException("User not found");
		}

		if (!ACTIVE_STATUSES.includes(user.status as (typeof ACTIVE_STATUSES)[number])) {
			throw new UnauthorizedException("Account is not active. Please contact administrator.");
		}

		const tokenVersion = payload.permissionVersion ?? 1;
		if (user.permissionVersion > tokenVersion) {
			throw new UnauthorizedException({
				message: "Your permissions have changed. Please login again.",
				code: "PERMISSIONS_CHANGED",
			});
		}

		return {
			id: payload.sub,
			username: payload.username,
			tenantId: payload.tenantId,
			centerId: payload.centerId,
			roles: payload.roles,
			permissions: payload.permissions,
			permissionVersion: user.permissionVersion,
		};
	}
}

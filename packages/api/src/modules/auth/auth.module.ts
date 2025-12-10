import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { DatabaseModule } from "#api/database";
import { AuthController } from "#api/modules/auth/auth.controller";
import { AuthService } from "#api/modules/auth/auth.service";
import { JwtStrategy } from "#api/modules/auth/strategies/jwt.strategy";
import { LocalStrategy } from "#api/modules/auth/strategies/local.strategy";

@Module({
	imports: [
		DatabaseModule,
		PassportModule,
		JwtModule.registerAsync({
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => {
				const expiresIn = configService.get<string>("auth.jwtExpiresIn") || "1d";
				return {
					secret: configService.get<string>("auth.jwtSecret") || "default-secret-change-in-production",
					signOptions: {
						expiresIn: expiresIn as "1d" | "7d" | "30d",
					},
				};
			},
		}),
	],
	controllers: [AuthController],
	providers: [AuthService, LocalStrategy, JwtStrategy],
	exports: [AuthService],
})
export class AuthModule {}

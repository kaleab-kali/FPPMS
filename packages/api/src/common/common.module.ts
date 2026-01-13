import { Global, Module, ValidationPipe as NestValidationPipe } from "@nestjs/common";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE, DiscoveryModule } from "@nestjs/core";
import { AllExceptionsFilter } from "#api/common/filters/all-exceptions.filter";
import { HttpExceptionFilter } from "#api/common/filters/http-exception.filter";
import { PrismaExceptionFilter } from "#api/common/filters/prisma-exception.filter";
import { JwtAuthGuard } from "#api/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "#api/common/guards/permissions.guard";
import { RolesGuard } from "#api/common/guards/roles.guard";
import { TenantGuard } from "#api/common/guards/tenant.guard";
import { AuditInterceptor } from "#api/common/interceptors/audit.interceptor";
import { LoggingInterceptor } from "#api/common/interceptors/logging.interceptor";
import { TenantContextInterceptor } from "#api/common/interceptors/tenant-context.interceptor";
import { PermissionDiscoveryService } from "#api/common/services/permission-discovery.service";
import { DatabaseModule } from "#api/database/database.module";

@Global()
@Module({
	imports: [DiscoveryModule, DatabaseModule],
	providers: [
		PermissionDiscoveryService,
		{
			provide: APP_FILTER,
			useClass: AllExceptionsFilter,
		},
		{
			provide: APP_FILTER,
			useClass: HttpExceptionFilter,
		},
		{
			provide: APP_FILTER,
			useClass: PrismaExceptionFilter,
		},
		{
			provide: APP_PIPE,
			useFactory: () =>
				new NestValidationPipe({
					whitelist: true,
					forbidNonWhitelisted: true,
					transform: true,
					validateCustomDecorators: false,
				}),
		},
		{
			provide: APP_GUARD,
			useClass: JwtAuthGuard,
		},
		{
			provide: APP_GUARD,
			useClass: RolesGuard,
		},
		{
			provide: APP_GUARD,
			useClass: PermissionsGuard,
		},
		{
			provide: APP_GUARD,
			useClass: TenantGuard,
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: TenantContextInterceptor,
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: LoggingInterceptor,
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: AuditInterceptor,
		},
	],
})
export class CommonModule {}

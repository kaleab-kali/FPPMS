import { Module, Global } from "@nestjs/common";
import { APP_FILTER, APP_GUARD, APP_PIPE, APP_INTERCEPTOR } from "@nestjs/core";
import { JwtAuthGuard } from "#api/common/guards/jwt-auth.guard";
import { RolesGuard } from "#api/common/guards/roles.guard";
import { PermissionsGuard } from "#api/common/guards/permissions.guard";
import { TenantGuard } from "#api/common/guards/tenant.guard";
import { HttpExceptionFilter } from "#api/common/filters/http-exception.filter";
import { PrismaExceptionFilter } from "#api/common/filters/prisma-exception.filter";
import { AllExceptionsFilter } from "#api/common/filters/all-exceptions.filter";
import { ValidationPipe } from "#api/common/pipes/validation.pipe";
import { TenantContextInterceptor } from "#api/common/interceptors/tenant-context.interceptor";
import { LoggingInterceptor } from "#api/common/interceptors/logging.interceptor";

@Global()
@Module({
	providers: [
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
			useClass: ValidationPipe,
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
	],
})
export class CommonModule {}

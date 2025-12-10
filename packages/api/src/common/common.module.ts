import { Global, Module } from "@nestjs/common";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";
import { AllExceptionsFilter } from "#api/common/filters/all-exceptions.filter";
import { HttpExceptionFilter } from "#api/common/filters/http-exception.filter";
import { PrismaExceptionFilter } from "#api/common/filters/prisma-exception.filter";
import { JwtAuthGuard } from "#api/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "#api/common/guards/permissions.guard";
import { RolesGuard } from "#api/common/guards/roles.guard";
import { TenantGuard } from "#api/common/guards/tenant.guard";
import { LoggingInterceptor } from "#api/common/interceptors/logging.interceptor";
import { TenantContextInterceptor } from "#api/common/interceptors/tenant-context.interceptor";
import { ValidationPipe } from "#api/common/pipes/validation.pipe";

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

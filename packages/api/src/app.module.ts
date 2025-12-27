import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AppController } from "#api/app.controller";
import { AppService } from "#api/app.service";
import { CommonModule } from "#api/common/common.module";
import { LoggerMiddleware } from "#api/common/middleware/logger.middleware";
import { TenantMiddleware } from "#api/common/middleware/tenant.middleware";
import { ConfigModule } from "#api/config";
import { DatabaseModule } from "#api/database";
import { AuthModule } from "#api/modules/auth/auth.module";
import { CentersModule } from "#api/modules/centers/centers.module";
import { CommitteesModule } from "#api/modules/committees/committees.module";
import { ComplaintsModule } from "#api/modules/complaints/complaints.module";
import { DashboardModule } from "#api/modules/dashboard/dashboard.module";
import { DepartmentsModule } from "#api/modules/departments/departments.module";
import { EmployeesModule } from "#api/modules/employees/employees.module";
import { LookupsModule } from "#api/modules/lookups/lookups.module";
import { PermissionsModule } from "#api/modules/permissions/permissions.module";
import { PositionsModule } from "#api/modules/positions/positions.module";
import { RanksModule } from "#api/modules/ranks/ranks.module";
import { RolesModule } from "#api/modules/roles/roles.module";
import { TenantsModule } from "#api/modules/tenants/tenants.module";
import { UsersModule } from "#api/modules/users/users.module";

@Module({
	imports: [
		ConfigModule,
		DatabaseModule,
		CommonModule,
		AuthModule,
		TenantsModule,
		CentersModule,
		CommitteesModule,
		ComplaintsModule,
		DashboardModule,
		DepartmentsModule,
		PositionsModule,
		LookupsModule,
		PermissionsModule,
		RanksModule,
		RolesModule,
		UsersModule,
		EmployeesModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer): void {
		consumer.apply(LoggerMiddleware, TenantMiddleware).forRoutes("*");
	}
}

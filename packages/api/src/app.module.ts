import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { AppController } from "#api/app.controller";
import { AppService } from "#api/app.service";
import { CommonModule } from "#api/common/common.module";
import { LoggerMiddleware } from "#api/common/middleware/logger.middleware";
import { TenantMiddleware } from "#api/common/middleware/tenant.middleware";
import { ConfigModule } from "#api/config";
import { DatabaseModule } from "#api/database";
import { AttachmentsModule } from "#api/modules/attachments/attachments.module";
import { AttendanceModule } from "#api/modules/attendance/attendance.module";
import { AuditLogModule } from "#api/modules/audit-log/audit-log.module";
import { AuthModule } from "#api/modules/auth/auth.module";
import { CentersModule } from "#api/modules/centers/centers.module";
import { CommitteesModule } from "#api/modules/committees/committees.module";
import { ComplaintsModule } from "#api/modules/complaints/complaints.module";
import { CorrespondenceModule } from "#api/modules/correspondence/correspondence.module";
import { DashboardModule } from "#api/modules/dashboard/dashboard.module";
import { DepartmentsModule } from "#api/modules/departments/departments.module";
import { EmployeesModule } from "#api/modules/employees/employees.module";
import { HolidaysModule } from "#api/modules/holidays/holidays.module";
import { InventoryModule } from "#api/modules/inventory/inventory.module";
import { LookupsModule } from "#api/modules/lookups/lookups.module";
import { PermissionsModule } from "#api/modules/permissions/permissions.module";
import { PositionsModule } from "#api/modules/positions/positions.module";
import { RanksModule } from "#api/modules/ranks/ranks.module";
import { RewardsModule } from "#api/modules/rewards/rewards.module";
import { RolesModule } from "#api/modules/roles/roles.module";
import { SalaryManagementModule } from "#api/modules/salary-management/salary-management.module";
import { SalaryScaleModule } from "#api/modules/salary-scale/salary-scale.module";
import { TenantsModule } from "#api/modules/tenants/tenants.module";
import { UsersModule } from "#api/modules/users/users.module";
import { WeaponsModule } from "#api/modules/weapons/weapons.module";

@Module({
	imports: [
		ConfigModule,
		DatabaseModule,
		ThrottlerModule.forRoot([
			{
				name: "short",
				ttl: 1000,
				limit: 3,
			},
			{
				name: "medium",
				ttl: 10000,
				limit: 20,
			},
			{
				name: "long",
				ttl: 60000,
				limit: 100,
			},
		]),
		AttachmentsModule,
		AttendanceModule,
		AuditLogModule,
		CommonModule,
		AuthModule,
		TenantsModule,
		CentersModule,
		CommitteesModule,
		ComplaintsModule,
		CorrespondenceModule,
		DashboardModule,
		DepartmentsModule,
		InventoryModule,
		PositionsModule,
		LookupsModule,
		PermissionsModule,
		RanksModule,
		RewardsModule,
		RolesModule,
		SalaryManagementModule,
		SalaryScaleModule,
		UsersModule,
		EmployeesModule,
		HolidaysModule,
		WeaponsModule,
	],
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		},
	],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer): void {
		consumer.apply(LoggerMiddleware, TenantMiddleware).forRoutes("*");
	}
}

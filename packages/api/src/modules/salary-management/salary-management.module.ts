import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { DatabaseModule } from "#api/database/database.module";
import { SalaryManagementController } from "#api/modules/salary-management/salary-management.controller";
import { SalaryManagementService } from "#api/modules/salary-management/salary-management.service";
import { SalaryCalculationService } from "#api/modules/salary-management/services/salary-calculation.service";
import { SalaryHistoryService } from "#api/modules/salary-management/services/salary-history.service";
import { SalaryProgressionService } from "#api/modules/salary-management/services/salary-progression.service";

@Module({
	imports: [DatabaseModule, ScheduleModule.forRoot()],
	controllers: [SalaryManagementController],
	providers: [SalaryManagementService, SalaryCalculationService, SalaryHistoryService, SalaryProgressionService],
	exports: [SalaryManagementService, SalaryCalculationService, SalaryHistoryService, SalaryProgressionService],
})
export class SalaryManagementModule {}

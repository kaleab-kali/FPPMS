import { Module } from "@nestjs/common";
import { DatabaseModule } from "#api/database/database.module";
import { EmployeesController } from "#api/modules/employees/employees.controller";
import { EmployeesService } from "#api/modules/employees/employees.service";
import { EmployeeIdGeneratorService } from "#api/modules/employees/services/employee-id-generator.service";
import { RetirementCalculationService } from "#api/modules/employees/services/retirement-calculation.service";

@Module({
	imports: [DatabaseModule],
	controllers: [EmployeesController],
	providers: [EmployeesService, EmployeeIdGeneratorService, RetirementCalculationService],
	exports: [EmployeesService, EmployeeIdGeneratorService, RetirementCalculationService],
})
export class EmployeesModule {}

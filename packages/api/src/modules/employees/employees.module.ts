import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { DatabaseModule } from "#api/database/database.module";
import { AuthModule } from "#api/modules/auth/auth.module";
import { EmployeeFamilyController } from "#api/modules/employees/controllers/employee-family.controller";
import { EmployeeMaritalStatusController } from "#api/modules/employees/controllers/employee-marital-status.controller";
import { EmployeeMedicalController } from "#api/modules/employees/controllers/employee-medical.controller";
import { EmployeePhotoController } from "#api/modules/employees/controllers/employee-photo.controller";
import { EmployeeSuperiorController } from "#api/modules/employees/controllers/employee-superior.controller";
import { EmployeeTransferController } from "#api/modules/employees/controllers/employee-transfer.controller";
import { EmployeesController } from "#api/modules/employees/employees.controller";
import { EmployeesService } from "#api/modules/employees/employees.service";
import { EmployeeFamilyService } from "#api/modules/employees/services/employee-family.service";
import { EmployeeIdGeneratorService } from "#api/modules/employees/services/employee-id-generator.service";
import { EmployeeMaritalStatusService } from "#api/modules/employees/services/employee-marital-status.service";
import { EmployeeMedicalService } from "#api/modules/employees/services/employee-medical.service";
import { EmployeePhotoService } from "#api/modules/employees/services/employee-photo.service";
import { EmployeeSuperiorService } from "#api/modules/employees/services/employee-superior.service";
import { EmployeeTransferService } from "#api/modules/employees/services/employee-transfer.service";
import { RetirementCalculationService } from "#api/modules/employees/services/retirement-calculation.service";

@Module({
	imports: [
		DatabaseModule,
		AuthModule,
		MulterModule.register({
			storage: memoryStorage(),
			limits: {
				fileSize: 10 * 1024 * 1024,
			},
		}),
	],
	controllers: [
		EmployeeSuperiorController,
		EmployeePhotoController,
		EmployeeFamilyController,
		EmployeeMedicalController,
		EmployeeMaritalStatusController,
		EmployeeTransferController,
		EmployeesController,
	],
	providers: [
		EmployeesService,
		EmployeeIdGeneratorService,
		RetirementCalculationService,
		EmployeePhotoService,
		EmployeeFamilyService,
		EmployeeMedicalService,
		EmployeeMaritalStatusService,
		EmployeeSuperiorService,
		EmployeeTransferService,
	],
	exports: [
		EmployeesService,
		EmployeeIdGeneratorService,
		RetirementCalculationService,
		EmployeePhotoService,
		EmployeeFamilyService,
		EmployeeMedicalService,
		EmployeeMaritalStatusService,
		EmployeeSuperiorService,
		EmployeeTransferService,
	],
})
export class EmployeesModule {}

import { Module } from "@nestjs/common";
import { PrismaService } from "#api/database/prisma.service";
import { AttendanceController } from "./attendance.controller";
import { AttendanceService } from "./attendance.service";
import { AttendanceDeviceController } from "./controllers/attendance-device.controller";
import { AttendanceReportController } from "./controllers/attendance-report.controller";
import { ShiftAssignmentController } from "./controllers/shift-assignment.controller";
import { ShiftDefinitionController } from "./controllers/shift-definition.controller";
import { AttendanceCalculationService } from "./services/attendance-calculation.service";
import { AttendanceReportService } from "./services/attendance-report.service";
import { ShiftAssignmentService } from "./services/shift-assignment.service";
import { ShiftDefinitionService } from "./services/shift-definition.service";

@Module({
	controllers: [
		AttendanceController,
		ShiftDefinitionController,
		ShiftAssignmentController,
		AttendanceReportController,
		AttendanceDeviceController,
	],
	providers: [
		PrismaService,
		AttendanceService,
		ShiftDefinitionService,
		ShiftAssignmentService,
		AttendanceCalculationService,
		AttendanceReportService,
	],
	exports: [AttendanceService, ShiftDefinitionService, ShiftAssignmentService, AttendanceCalculationService],
})
export class AttendanceModule {}

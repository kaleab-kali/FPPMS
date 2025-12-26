import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "#api/common/decorators/current-user.decorator";
import { Permissions } from "#api/common/decorators/permissions.decorator";
import { AuthUserDto } from "#api/common/dto/auth-user.dto";
import { CreateMedicalRecordDto, UpdateMedicalRecordDto } from "#api/modules/employees/dto";
import { EmployeeMedicalService } from "#api/modules/employees/services/employee-medical.service";

@ApiTags("employee-medical")
@ApiBearerAuth("JWT-auth")
@Controller("employees/medical")
export class EmployeeMedicalController {
	constructor(private medicalService: EmployeeMedicalService) {}

	@Post()
	@Permissions("employees.manage.medical")
	@ApiOperation({ summary: "Create medical record" })
	@ApiResponse({ status: 201, description: "Medical record created" })
	create(@CurrentUser() user: AuthUserDto, @Body() dto: CreateMedicalRecordDto) {
		return this.medicalService.create(user.tenantId, dto, user.id);
	}

	@Get("employee/:employeeId")
	@Permissions("employees.read.medical")
	@ApiOperation({ summary: "Get all medical records for employee" })
	@ApiResponse({ status: 200, description: "List of medical records" })
	findAllByEmployee(@CurrentUser() user: AuthUserDto, @Param("employeeId") employeeId: string) {
		return this.medicalService.findAllByEmployee(user.tenantId, employeeId);
	}

	@Get("employee/:employeeId/stats")
	@Permissions("employees.read.medical")
	@ApiOperation({ summary: "Get medical stats for employee" })
	@ApiResponse({ status: 200, description: "Medical statistics" })
	getStats(@CurrentUser() user: AuthUserDto, @Param("employeeId") employeeId: string) {
		return this.medicalService.getMedicalStats(user.tenantId, employeeId);
	}

	@Get("employee/:employeeId/eligible-family")
	@Permissions("employees.read.medical")
	@ApiOperation({ summary: "Get eligible family members for medical coverage" })
	@ApiResponse({ status: 200, description: "List of eligible family members" })
	getEligibleFamily(@CurrentUser() user: AuthUserDto, @Param("employeeId") employeeId: string) {
		return this.medicalService.getEligibleFamilyMembers(user.tenantId, employeeId);
	}

	@Get(":id")
	@Permissions("employees.read.medical")
	@ApiOperation({ summary: "Get medical record by ID" })
	@ApiResponse({ status: 200, description: "Medical record" })
	findOne(@CurrentUser() user: AuthUserDto, @Param("id") id: string) {
		return this.medicalService.findOne(user.tenantId, id);
	}

	@Patch(":id")
	@Permissions("employees.manage.medical")
	@ApiOperation({ summary: "Update medical record" })
	@ApiResponse({ status: 200, description: "Medical record updated" })
	update(@CurrentUser() user: AuthUserDto, @Param("id") id: string, @Body() dto: UpdateMedicalRecordDto) {
		return this.medicalService.update(user.tenantId, id, dto);
	}

	@Delete(":id")
	@Permissions("employees.delete.medical")
	@ApiOperation({ summary: "Delete medical record" })
	@ApiResponse({ status: 200, description: "Medical record deleted" })
	delete(@CurrentUser() user: AuthUserDto, @Param("id") id: string) {
		return this.medicalService.delete(user.tenantId, id);
	}
}

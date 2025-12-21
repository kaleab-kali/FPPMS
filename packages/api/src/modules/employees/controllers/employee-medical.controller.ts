import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SYSTEM_ROLES } from "#api/common/constants/roles.constant";
import { CurrentUser } from "#api/common/decorators/current-user.decorator";
import { Roles } from "#api/common/decorators/roles.decorator";
import { AuthUserDto } from "#api/common/dto/auth-user.dto";
import { CreateMedicalRecordDto, UpdateMedicalRecordDto } from "#api/modules/employees/dto";
import { EmployeeMedicalService } from "#api/modules/employees/services/employee-medical.service";

@ApiTags("employee-medical")
@ApiBearerAuth("JWT-auth")
@Controller("employees/medical")
export class EmployeeMedicalController {
	constructor(private medicalService: EmployeeMedicalService) {}

	@Post()
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN, SYSTEM_ROLES.HR_DIRECTOR, SYSTEM_ROLES.HR_OFFICER)
	@ApiOperation({ summary: "Create medical record" })
	@ApiResponse({ status: 201, description: "Medical record created" })
	create(@CurrentUser() user: AuthUserDto, @Body() dto: CreateMedicalRecordDto) {
		return this.medicalService.create(user.tenantId, dto, user.id);
	}

	@Get("employee/:employeeId")
	@ApiOperation({ summary: "Get all medical records for employee" })
	@ApiResponse({ status: 200, description: "List of medical records" })
	findAllByEmployee(@CurrentUser() user: AuthUserDto, @Param("employeeId") employeeId: string) {
		return this.medicalService.findAllByEmployee(user.tenantId, employeeId);
	}

	@Get("employee/:employeeId/stats")
	@ApiOperation({ summary: "Get medical stats for employee" })
	@ApiResponse({ status: 200, description: "Medical statistics" })
	getStats(@CurrentUser() user: AuthUserDto, @Param("employeeId") employeeId: string) {
		return this.medicalService.getMedicalStats(user.tenantId, employeeId);
	}

	@Get("employee/:employeeId/eligible-family")
	@ApiOperation({ summary: "Get eligible family members for medical coverage" })
	@ApiResponse({ status: 200, description: "List of eligible family members" })
	getEligibleFamily(@CurrentUser() user: AuthUserDto, @Param("employeeId") employeeId: string) {
		return this.medicalService.getEligibleFamilyMembers(user.tenantId, employeeId);
	}

	@Get(":id")
	@ApiOperation({ summary: "Get medical record by ID" })
	@ApiResponse({ status: 200, description: "Medical record" })
	findOne(@CurrentUser() user: AuthUserDto, @Param("id") id: string) {
		return this.medicalService.findOne(user.tenantId, id);
	}

	@Patch(":id")
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN, SYSTEM_ROLES.HR_DIRECTOR, SYSTEM_ROLES.HR_OFFICER)
	@ApiOperation({ summary: "Update medical record" })
	@ApiResponse({ status: 200, description: "Medical record updated" })
	update(@CurrentUser() user: AuthUserDto, @Param("id") id: string, @Body() dto: UpdateMedicalRecordDto) {
		return this.medicalService.update(user.tenantId, id, dto);
	}

	@Delete(":id")
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN, SYSTEM_ROLES.HR_DIRECTOR)
	@ApiOperation({ summary: "Delete medical record" })
	@ApiResponse({ status: 200, description: "Medical record deleted" })
	delete(@CurrentUser() user: AuthUserDto, @Param("id") id: string) {
		return this.medicalService.delete(user.tenantId, id);
	}
}

import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SYSTEM_ROLES } from "#api/common/constants/roles.constant";
import { CurrentUser } from "#api/common/decorators/current-user.decorator";
import { Roles } from "#api/common/decorators/roles.decorator";
import { AuthUserDto } from "#api/common/dto/auth-user.dto";
import { CreateMaritalStatusDto, UpdateMaritalStatusDto } from "#api/modules/employees/dto";
import { EmployeeMaritalStatusService } from "#api/modules/employees/services/employee-marital-status.service";

@ApiTags("employee-marital-status")
@ApiBearerAuth("JWT-auth")
@Controller("employees/marital-status")
export class EmployeeMaritalStatusController {
	constructor(private maritalStatusService: EmployeeMaritalStatusService) {}

	@Post()
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN, SYSTEM_ROLES.HR_DIRECTOR, SYSTEM_ROLES.HR_OFFICER)
	@ApiOperation({ summary: "Record marital status change" })
	@ApiResponse({ status: 201, description: "Marital status recorded" })
	create(@CurrentUser() user: AuthUserDto, @Body() dto: CreateMaritalStatusDto) {
		return this.maritalStatusService.create(user.tenantId, dto, user.id);
	}

	@Get("employee/:employeeId")
	@ApiOperation({ summary: "Get marital status history for employee" })
	@ApiResponse({ status: 200, description: "List of marital status changes" })
	findAllByEmployee(@CurrentUser() user: AuthUserDto, @Param("employeeId") employeeId: string) {
		return this.maritalStatusService.findAllByEmployee(user.tenantId, employeeId);
	}

	@Get("employee/:employeeId/current")
	@ApiOperation({ summary: "Get current marital status for employee" })
	@ApiResponse({ status: 200, description: "Current marital status" })
	getCurrentStatus(@CurrentUser() user: AuthUserDto, @Param("employeeId") employeeId: string) {
		return this.maritalStatusService.getCurrentStatus(user.tenantId, employeeId);
	}

	@Get(":id")
	@ApiOperation({ summary: "Get marital status record by ID" })
	@ApiResponse({ status: 200, description: "Marital status record" })
	findOne(@CurrentUser() user: AuthUserDto, @Param("id") id: string) {
		return this.maritalStatusService.findOne(user.tenantId, id);
	}

	@Patch(":id")
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN, SYSTEM_ROLES.HR_DIRECTOR, SYSTEM_ROLES.HR_OFFICER)
	@ApiOperation({ summary: "Update marital status record" })
	@ApiResponse({ status: 200, description: "Marital status updated" })
	update(@CurrentUser() user: AuthUserDto, @Param("id") id: string, @Body() dto: UpdateMaritalStatusDto) {
		return this.maritalStatusService.update(user.tenantId, id, dto);
	}

	@Delete(":id")
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN, SYSTEM_ROLES.HR_DIRECTOR)
	@ApiOperation({ summary: "Delete marital status record" })
	@ApiResponse({ status: 200, description: "Marital status deleted" })
	delete(@CurrentUser() user: AuthUserDto, @Param("id") id: string) {
		return this.maritalStatusService.delete(user.tenantId, id);
	}
}

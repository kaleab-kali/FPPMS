import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "#api/common/decorators/current-user.decorator";
import { Permissions } from "#api/common/decorators/permissions.decorator";
import { AuthUserDto } from "#api/common/dto/auth-user.dto";
import { CreateFamilyMemberDto, UpdateFamilyMemberDto } from "#api/modules/employees/dto";
import { EmployeeFamilyService } from "#api/modules/employees/services/employee-family.service";

@ApiTags("employee-family")
@ApiBearerAuth("JWT-auth")
@Controller("employees/family")
export class EmployeeFamilyController {
	constructor(private familyService: EmployeeFamilyService) {}

	@Post()
	@Permissions("employees.manage.family")
	@ApiOperation({ summary: "Add family member" })
	@ApiResponse({ status: 201, description: "Family member added" })
	create(@CurrentUser() user: AuthUserDto, @Body() dto: CreateFamilyMemberDto) {
		return this.familyService.create(user.tenantId, dto);
	}

	@Get("employee/:employeeId")
	@Permissions("employees.read.family")
	@ApiOperation({ summary: "Get family members for employee" })
	@ApiResponse({ status: 200, description: "List of family members" })
	findByEmployee(@CurrentUser() user: AuthUserDto, @Param("employeeId") employeeId: string) {
		return this.familyService.findAllByEmployee(user.tenantId, employeeId);
	}

	@Get("employee/:employeeId/spouse")
	@Permissions("employees.read.family")
	@ApiOperation({ summary: "Get spouse for employee" })
	@ApiResponse({ status: 200, description: "Spouse details" })
	getSpouse(@CurrentUser() user: AuthUserDto, @Param("employeeId") employeeId: string) {
		return this.familyService.getSpouse(user.tenantId, employeeId);
	}

	@Get("employee/:employeeId/children")
	@Permissions("employees.read.family")
	@ApiOperation({ summary: "Get children for employee" })
	@ApiResponse({ status: 200, description: "List of children" })
	getChildren(@CurrentUser() user: AuthUserDto, @Param("employeeId") employeeId: string) {
		return this.familyService.getChildren(user.tenantId, employeeId);
	}

	@Get(":id")
	@Permissions("employees.read.family")
	@ApiOperation({ summary: "Get family member by ID" })
	@ApiResponse({ status: 200, description: "Family member details" })
	findOne(@CurrentUser() user: AuthUserDto, @Param("id") id: string) {
		return this.familyService.findOne(user.tenantId, id);
	}

	@Patch(":id")
	@Permissions("employees.manage.family")
	@ApiOperation({ summary: "Update family member" })
	@ApiResponse({ status: 200, description: "Family member updated" })
	update(@CurrentUser() user: AuthUserDto, @Param("id") id: string, @Body() dto: UpdateFamilyMemberDto) {
		return this.familyService.update(user.tenantId, id, dto);
	}

	@Delete(":id")
	@Permissions("employees.manage.family")
	@ApiOperation({ summary: "Delete family member" })
	@ApiResponse({ status: 200, description: "Family member deleted" })
	delete(@CurrentUser() user: AuthUserDto, @Param("id") id: string) {
		return this.familyService.delete(user.tenantId, id);
	}
}

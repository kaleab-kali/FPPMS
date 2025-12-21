import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SYSTEM_ROLES } from "#api/common/constants/roles.constant";
import { CurrentUser } from "#api/common/decorators/current-user.decorator";
import { Roles } from "#api/common/decorators/roles.decorator";
import { AuthUserDto } from "#api/common/dto/auth-user.dto";
import { CreateTransferDto, ExternalTransferDto } from "#api/modules/employees/dto";
import { EmployeeTransferService } from "#api/modules/employees/services/employee-transfer.service";

@ApiTags("employee-transfer")
@ApiBearerAuth("JWT-auth")
@Controller("employees/transfer")
export class EmployeeTransferController {
	constructor(private transferService: EmployeeTransferService) {}

	@Post("internal")
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN, SYSTEM_ROLES.HR_DIRECTOR)
	@ApiOperation({ summary: "Internal transfer employee between centers" })
	@ApiResponse({ status: 200, description: "Employee transferred" })
	internalTransfer(@CurrentUser() user: AuthUserDto, @Body() dto: CreateTransferDto) {
		return this.transferService.internalTransfer(user.tenantId, dto, user.id);
	}

	@Post("external")
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN, SYSTEM_ROLES.HR_DIRECTOR)
	@ApiOperation({ summary: "Register external transfer (employee from another organization)" })
	@ApiResponse({ status: 200, description: "External transfer registered" })
	externalTransfer(@CurrentUser() user: AuthUserDto, @Body() dto: ExternalTransferDto) {
		return this.transferService.registerExternalTransfer(user.tenantId, dto, user.id);
	}

	@Get("history/:employeeId")
	@ApiOperation({ summary: "Get transfer history for employee" })
	@ApiResponse({ status: 200, description: "Transfer history" })
	getHistory(@CurrentUser() user: AuthUserDto, @Param("employeeId") employeeId: string) {
		return this.transferService.getTransferHistory(user.tenantId, employeeId);
	}

	@Get("external")
	@ApiOperation({ summary: "Get all external transfers" })
	@ApiResponse({ status: 200, description: "List of external transfers" })
	getExternalTransfers(@CurrentUser() user: AuthUserDto) {
		return this.transferService.getExternalTransfers(user.tenantId);
	}
}

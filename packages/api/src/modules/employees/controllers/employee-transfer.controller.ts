import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { TransferStatus } from "@prisma/client";
import { CurrentUser } from "#api/common/decorators/current-user.decorator";
import { Permissions } from "#api/common/decorators/permissions.decorator";
import { AuthUserDto } from "#api/common/dto/auth-user.dto";
import {
	AcceptTransferDto,
	CancelTransferDto,
	CreateDepartureDto,
	CreateTransferRequestDto,
	RejectTransferDto,
	UpdateDepartureDto,
} from "#api/modules/employees/dto";
import { EmployeeTransferService } from "#api/modules/employees/services/employee-transfer.service";

@ApiTags("employee-transfer")
@ApiBearerAuth("JWT-auth")
@Controller("employees/transfer")
export class EmployeeTransferController {
	constructor(private transferService: EmployeeTransferService) {}

	@Post("request")
	@Permissions("employees.manage.transfer")
	@ApiOperation({ summary: "Create a transfer request (source center initiates)" })
	@ApiResponse({ status: 201, description: "Transfer request created" })
	createTransferRequest(@CurrentUser() user: AuthUserDto, @Body() dto: CreateTransferRequestDto) {
		return this.transferService.createTransferRequest(user.tenantId, dto, user.id);
	}

	@Post(":id/accept")
	@Permissions("employees.manage.transfer")
	@ApiOperation({ summary: "Accept a transfer request (target center confirms)" })
	@ApiResponse({ status: 200, description: "Transfer accepted and employee moved" })
	acceptTransfer(@CurrentUser() user: AuthUserDto, @Param("id") transferId: string, @Body() dto: AcceptTransferDto) {
		return this.transferService.acceptTransfer(user.tenantId, transferId, dto, user.id);
	}

	@Post(":id/reject")
	@Permissions("employees.manage.transfer")
	@ApiOperation({ summary: "Reject a transfer request (target center declines)" })
	@ApiResponse({ status: 200, description: "Transfer rejected" })
	rejectTransfer(@CurrentUser() user: AuthUserDto, @Param("id") transferId: string, @Body() dto: RejectTransferDto) {
		return this.transferService.rejectTransfer(user.tenantId, transferId, dto, user.id);
	}

	@Post(":id/cancel")
	@Permissions("employees.manage.transfer")
	@ApiOperation({ summary: "Cancel a pending transfer request (source center cancels)" })
	@ApiResponse({ status: 200, description: "Transfer cancelled" })
	cancelTransfer(@CurrentUser() user: AuthUserDto, @Param("id") transferId: string, @Body() dto: CancelTransferDto) {
		return this.transferService.cancelTransfer(user.tenantId, transferId, dto, user.id);
	}

	@Get("all")
	@Permissions("employees.read.transfer")
	@ApiOperation({ summary: "Get all transfer requests" })
	@ApiQuery({ name: "status", required: false, enum: TransferStatus })
	@ApiResponse({ status: 200, description: "List of all transfer requests" })
	getAllTransfers(@CurrentUser() user: AuthUserDto, @Query("status") status?: TransferStatus) {
		return this.transferService.getAllTransfers(user.tenantId, status);
	}

	@Get(":id")
	@Permissions("employees.read.transfer")
	@ApiOperation({ summary: "Get transfer request by ID" })
	@ApiResponse({ status: 200, description: "Transfer request details" })
	getTransferById(@CurrentUser() user: AuthUserDto, @Param("id") transferId: string) {
		return this.transferService.getTransferById(user.tenantId, transferId);
	}

	@Get("history/:employeeId")
	@Permissions("employees.read.transfer")
	@ApiOperation({ summary: "Get transfer history for an employee" })
	@ApiResponse({ status: 200, description: "Transfer history" })
	getTransferHistory(@CurrentUser() user: AuthUserDto, @Param("employeeId") employeeId: string) {
		return this.transferService.getTransferHistory(user.tenantId, employeeId);
	}

	@Get("center/:centerId/pending")
	@Permissions("employees.read.transfer")
	@ApiOperation({ summary: "Get pending incoming transfers for a center" })
	@ApiResponse({ status: 200, description: "Pending incoming transfers" })
	getPendingTransfersForCenter(@CurrentUser() user: AuthUserDto, @Param("centerId") centerId: string) {
		return this.transferService.getPendingTransfersForCenter(user.tenantId, centerId);
	}

	@Get("center/:centerId/outgoing")
	@Permissions("employees.read.transfer")
	@ApiOperation({ summary: "Get outgoing pending transfers from a center" })
	@ApiResponse({ status: 200, description: "Outgoing pending transfers" })
	getOutgoingTransfersForCenter(@CurrentUser() user: AuthUserDto, @Param("centerId") centerId: string) {
		return this.transferService.getOutgoingTransfersForCenter(user.tenantId, centerId);
	}

	@Post("departure")
	@Permissions("employees.manage.departure")
	@ApiOperation({ summary: "Record an employee departure (leaving the organization)" })
	@ApiResponse({ status: 201, description: "Departure record created" })
	createDeparture(@CurrentUser() user: AuthUserDto, @Body() dto: CreateDepartureDto) {
		return this.transferService.createDeparture(user.tenantId, dto, user.id);
	}

	@Get("departure/all")
	@Permissions("employees.read.departure")
	@ApiOperation({ summary: "Get all departure records" })
	@ApiResponse({ status: 200, description: "List of all departures" })
	getAllDepartures(@CurrentUser() user: AuthUserDto) {
		return this.transferService.getAllDepartures(user.tenantId);
	}

	@Get("departure/employee/:employeeId")
	@Permissions("employees.read.departure")
	@ApiOperation({ summary: "Get departure record for an employee" })
	@ApiResponse({ status: 200, description: "Departure record" })
	getDeparture(@CurrentUser() user: AuthUserDto, @Param("employeeId") employeeId: string) {
		return this.transferService.getDeparture(user.tenantId, employeeId);
	}

	@Get("departure/:id")
	@Permissions("employees.read.departure")
	@ApiOperation({ summary: "Get departure record by ID" })
	@ApiResponse({ status: 200, description: "Departure record" })
	getDepartureById(@CurrentUser() user: AuthUserDto, @Param("id") departureId: string) {
		return this.transferService.getDepartureById(user.tenantId, departureId);
	}

	@Put("departure/:id")
	@Permissions("employees.manage.departure")
	@ApiOperation({ summary: "Update a departure record" })
	@ApiResponse({ status: 200, description: "Departure record updated" })
	updateDeparture(@CurrentUser() user: AuthUserDto, @Param("id") departureId: string, @Body() dto: UpdateDepartureDto) {
		return this.transferService.updateDeparture(user.tenantId, departureId, dto);
	}

	@Delete("departure/:id")
	@Permissions("employees.delete.departure")
	@ApiOperation({ summary: "Delete a departure record (reinstates employee)" })
	@ApiResponse({ status: 200, description: "Departure record deleted and employee reinstated" })
	deleteDeparture(@CurrentUser() user: AuthUserDto, @Param("id") departureId: string) {
		return this.transferService.deleteDeparture(user.tenantId, departureId, user.id);
	}
}

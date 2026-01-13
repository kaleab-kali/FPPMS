import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentTenant } from "#api/common/decorators/current-tenant.decorator";
import { CurrentUser } from "#api/common/decorators/current-user.decorator";
import { Permissions } from "#api/common/decorators/permissions.decorator";
import { JwtAuthGuard } from "#api/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "#api/common/guards/permissions.guard";
import { PaginatedResult } from "#api/common/interfaces/paginated-result.interface";
import {
	CreateInventoryAssignmentDto,
	InventoryAssignmentFilterDto,
	InventoryAssignmentResponseDto,
	ReturnInventoryDto,
	UpdateInventoryAssignmentDto,
} from "./dto";
import { InventoryService } from "./inventory.service";

@ApiTags("inventory")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("inventory")
export class InventoryController {
	constructor(private readonly inventoryService: InventoryService) {}

	@Get("assignments")
	@Permissions("inventory.read.assignment")
	@ApiOperation({ summary: "Get all inventory assignments" })
	@ApiResponse({ status: 200, description: "List of inventory assignments" })
	async findAll(
		@CurrentTenant() tenantId: string,
		@Query() filter: InventoryAssignmentFilterDto,
	): Promise<PaginatedResult<InventoryAssignmentResponseDto>> {
		return this.inventoryService.findAll(tenantId, filter);
	}

	@Get("assignments/employee/:employeeId")
	@Permissions("inventory.read.assignment")
	@ApiOperation({ summary: "Get inventory assignments for an employee" })
	@ApiResponse({ status: 200, description: "List of inventory assignments for employee" })
	async findByEmployee(
		@CurrentTenant() tenantId: string,
		@Param("employeeId") employeeId: string,
		@Query() filter: InventoryAssignmentFilterDto,
	): Promise<PaginatedResult<InventoryAssignmentResponseDto>> {
		return this.inventoryService.findByEmployee(tenantId, employeeId, filter);
	}

	@Get("assignments/overdue")
	@Permissions("inventory.read.assignment")
	@ApiOperation({ summary: "Get overdue inventory assignments" })
	@ApiResponse({ status: 200, description: "List of overdue inventory assignments" })
	async getOverdue(
		@CurrentTenant() tenantId: string,
		@Query() filter: InventoryAssignmentFilterDto,
	): Promise<PaginatedResult<InventoryAssignmentResponseDto>> {
		return this.inventoryService.getOverdueAssignments(tenantId, filter);
	}

	@Get("assignments/:id")
	@Permissions("inventory.read.assignment")
	@ApiOperation({ summary: "Get inventory assignment by ID" })
	@ApiResponse({ status: 200, description: "Inventory assignment details" })
	@ApiResponse({ status: 404, description: "Assignment not found" })
	async findOne(@CurrentTenant() tenantId: string, @Param("id") id: string): Promise<InventoryAssignmentResponseDto> {
		return this.inventoryService.findOne(tenantId, id);
	}

	@Post("assignments")
	@Permissions("inventory.create.assignment")
	@ApiOperation({ summary: "Create a new inventory assignment" })
	@ApiResponse({ status: 201, description: "Assignment created successfully" })
	@ApiResponse({ status: 400, description: "Invalid input or insufficient inventory" })
	@ApiResponse({ status: 404, description: "Employee, item type, or center not found" })
	async create(
		@CurrentTenant() tenantId: string,
		@CurrentUser("id") userId: string,
		@Body() dto: CreateInventoryAssignmentDto,
	): Promise<InventoryAssignmentResponseDto> {
		return this.inventoryService.create(tenantId, userId, dto);
	}

	@Patch("assignments/:id")
	@Permissions("inventory.update.assignment")
	@ApiOperation({ summary: "Update an inventory assignment" })
	@ApiResponse({ status: 200, description: "Assignment updated successfully" })
	@ApiResponse({ status: 400, description: "Cannot update returned assignment" })
	@ApiResponse({ status: 404, description: "Assignment not found" })
	async update(
		@CurrentTenant() tenantId: string,
		@Param("id") id: string,
		@Body() dto: UpdateInventoryAssignmentDto,
	): Promise<InventoryAssignmentResponseDto> {
		return this.inventoryService.update(tenantId, id, dto);
	}

	@Post("assignments/:id/return")
	@Permissions("inventory.manage.return")
	@ApiOperation({ summary: "Process inventory return" })
	@ApiResponse({ status: 200, description: "Return processed successfully" })
	@ApiResponse({ status: 400, description: "Assignment already returned" })
	@ApiResponse({ status: 404, description: "Assignment not found" })
	async returnAssignment(
		@CurrentTenant() tenantId: string,
		@CurrentUser("id") userId: string,
		@Param("id") id: string,
		@Body() dto: ReturnInventoryDto,
	): Promise<InventoryAssignmentResponseDto> {
		return this.inventoryService.returnAssignment(tenantId, id, userId, dto);
	}
}

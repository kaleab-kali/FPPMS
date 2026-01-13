import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentTenant } from "#api/common/decorators/current-tenant.decorator";
import { Permissions } from "#api/common/decorators/permissions.decorator";
import { JwtAuthGuard } from "#api/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "#api/common/guards/permissions.guard";
import { PaginatedResult } from "#api/common/interfaces/paginated-result.interface";
import { CenterInventoryService } from "./center-inventory.service";
import {
	AdjustCenterInventoryDto,
	CenterInventoryFilterDto,
	CenterInventoryResponseDto,
	CreateCenterInventoryDto,
	UpdateCenterInventoryDto,
} from "./dto";

@ApiTags("inventory")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("inventory/center-stock")
export class CenterInventoryController {
	constructor(private readonly centerInventoryService: CenterInventoryService) {}

	@Get()
	@Permissions("inventory.read.center-stock")
	@ApiOperation({ summary: "Get all center inventory records" })
	@ApiResponse({ status: 200, description: "List of center inventory records" })
	async findAll(
		@CurrentTenant() tenantId: string,
		@Query() filter: CenterInventoryFilterDto,
	): Promise<PaginatedResult<CenterInventoryResponseDto>> {
		return this.centerInventoryService.findAll(tenantId, filter);
	}

	@Get("low-stock")
	@Permissions("inventory.read.center-stock")
	@ApiOperation({ summary: "Get low stock items across centers" })
	@ApiResponse({ status: 200, description: "List of low stock items" })
	async getLowStock(
		@CurrentTenant() tenantId: string,
		@Query() filter: CenterInventoryFilterDto,
	): Promise<PaginatedResult<CenterInventoryResponseDto>> {
		return this.centerInventoryService.getLowStockItems(tenantId, filter);
	}

	@Get("center/:centerId")
	@Permissions("inventory.read.center-stock")
	@ApiOperation({ summary: "Get inventory for a specific center" })
	@ApiResponse({ status: 200, description: "Center inventory records" })
	async findByCenter(
		@CurrentTenant() tenantId: string,
		@Param("centerId") centerId: string,
		@Query() filter: CenterInventoryFilterDto,
	): Promise<PaginatedResult<CenterInventoryResponseDto>> {
		return this.centerInventoryService.findByCenter(tenantId, centerId, filter);
	}

	@Get(":id")
	@Permissions("inventory.read.center-stock")
	@ApiOperation({ summary: "Get center inventory record by ID" })
	@ApiResponse({ status: 200, description: "Center inventory details" })
	@ApiResponse({ status: 404, description: "Record not found" })
	async findOne(@CurrentTenant() tenantId: string, @Param("id") id: string): Promise<CenterInventoryResponseDto> {
		return this.centerInventoryService.findOne(tenantId, id);
	}

	@Post()
	@Permissions("inventory.manage.center-stock")
	@ApiOperation({ summary: "Create a new center inventory record" })
	@ApiResponse({ status: 201, description: "Record created successfully" })
	@ApiResponse({ status: 400, description: "Record already exists for this center and item type" })
	@ApiResponse({ status: 404, description: "Center or item type not found" })
	async create(
		@CurrentTenant() tenantId: string,
		@Body() dto: CreateCenterInventoryDto,
	): Promise<CenterInventoryResponseDto> {
		return this.centerInventoryService.create(tenantId, dto);
	}

	@Patch(":id")
	@Permissions("inventory.manage.center-stock")
	@ApiOperation({ summary: "Update a center inventory record" })
	@ApiResponse({ status: 200, description: "Record updated successfully" })
	@ApiResponse({ status: 400, description: "Invalid quantity adjustment" })
	@ApiResponse({ status: 404, description: "Record not found" })
	async update(
		@CurrentTenant() tenantId: string,
		@Param("id") id: string,
		@Body() dto: UpdateCenterInventoryDto,
	): Promise<CenterInventoryResponseDto> {
		return this.centerInventoryService.update(tenantId, id, dto);
	}

	@Post(":id/adjust")
	@Permissions("inventory.manage.center-stock")
	@ApiOperation({ summary: "Adjust center inventory quantity" })
	@ApiResponse({ status: 200, description: "Quantity adjusted successfully" })
	@ApiResponse({ status: 400, description: "Adjustment would result in negative inventory" })
	@ApiResponse({ status: 404, description: "Record not found" })
	async adjust(
		@CurrentTenant() tenantId: string,
		@Param("id") id: string,
		@Body() dto: AdjustCenterInventoryDto,
	): Promise<CenterInventoryResponseDto> {
		return this.centerInventoryService.adjust(tenantId, id, dto);
	}
}

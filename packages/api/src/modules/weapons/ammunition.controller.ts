import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentTenant } from "#api/common/decorators/current-tenant.decorator";
import { CurrentUser } from "#api/common/decorators/current-user.decorator";
import { Permissions } from "#api/common/decorators/permissions.decorator";
import { JwtAuthGuard } from "#api/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "#api/common/guards/permissions.guard";
import { PaginatedResult } from "#api/common/interfaces/paginated-result.interface";
import { AmmunitionService } from "./ammunition.service";
import {
	AdjustCenterAmmunitionStockDto,
	AmmunitionTransactionFilterDto,
	AmmunitionTransactionResponseDto,
	AmmunitionTypeFilterDto,
	AmmunitionTypeResponseDto,
	CenterAmmunitionStockFilterDto,
	CenterAmmunitionStockResponseDto,
	CreateAmmunitionTransactionDto,
	CreateAmmunitionTypeDto,
	CreateCenterAmmunitionStockDto,
	UpdateAmmunitionTypeDto,
	UpdateCenterAmmunitionStockDto,
} from "./dto";

@ApiTags("ammunition")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("ammunition")
export class AmmunitionController {
	constructor(private readonly ammunitionService: AmmunitionService) {}

	@Get("types")
	@Permissions("ammunition.read.type")
	@ApiOperation({ summary: "Get all ammunition types" })
	@ApiResponse({ status: 200, description: "List of ammunition types returned successfully" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	async findAllTypes(
		@CurrentTenant() tenantId: string,
		@Query() filter: AmmunitionTypeFilterDto,
	): Promise<PaginatedResult<AmmunitionTypeResponseDto>> {
		return this.ammunitionService.findAllTypes(tenantId, filter);
	}

	@Get("types/:id")
	@Permissions("ammunition.read.type")
	@ApiOperation({ summary: "Get ammunition type by ID" })
	@ApiResponse({ status: 200, description: "Ammunition type returned successfully" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Ammunition type not found" })
	async findOneType(@CurrentTenant() tenantId: string, @Param("id") id: string): Promise<AmmunitionTypeResponseDto> {
		return this.ammunitionService.findOneType(tenantId, id);
	}

	@Post("types")
	@Permissions("ammunition.create.type")
	@ApiOperation({ summary: "Create a new ammunition type" })
	@ApiResponse({ status: 201, description: "Ammunition type created successfully" })
	@ApiResponse({ status: 400, description: "Bad request - validation error or duplicate code" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Weapon type not found" })
	async createType(
		@CurrentTenant() tenantId: string,
		@Body() dto: CreateAmmunitionTypeDto,
	): Promise<AmmunitionTypeResponseDto> {
		return this.ammunitionService.createType(tenantId, dto);
	}

	@Patch("types/:id")
	@Permissions("ammunition.update.type")
	@ApiOperation({ summary: "Update an ammunition type" })
	@ApiResponse({ status: 200, description: "Ammunition type updated successfully" })
	@ApiResponse({ status: 400, description: "Bad request - validation error" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Ammunition type or weapon type not found" })
	async updateType(
		@CurrentTenant() tenantId: string,
		@Param("id") id: string,
		@Body() dto: UpdateAmmunitionTypeDto,
	): Promise<AmmunitionTypeResponseDto> {
		return this.ammunitionService.updateType(tenantId, id, dto);
	}

	@Delete("types/:id")
	@Permissions("ammunition.delete.type")
	@ApiOperation({ summary: "Delete an ammunition type" })
	@ApiResponse({ status: 200, description: "Ammunition type deleted successfully" })
	@ApiResponse({ status: 400, description: "Cannot delete ammunition type with existing stock or transactions" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Ammunition type not found" })
	async deleteType(@CurrentTenant() tenantId: string, @Param("id") id: string): Promise<void> {
		return this.ammunitionService.deleteType(tenantId, id);
	}

	@Get("stock")
	@Permissions("ammunition.read.stock")
	@ApiOperation({ summary: "Get all center ammunition stock records" })
	@ApiResponse({ status: 200, description: "List of center ammunition stock records" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	async findAllStock(
		@CurrentTenant() tenantId: string,
		@Query() filter: CenterAmmunitionStockFilterDto,
	): Promise<PaginatedResult<CenterAmmunitionStockResponseDto>> {
		return this.ammunitionService.findAllStock(tenantId, filter);
	}

	@Get("stock/low-stock")
	@Permissions("ammunition.read.stock")
	@ApiOperation({ summary: "Get low stock ammunition items across centers" })
	@ApiResponse({ status: 200, description: "List of low stock ammunition items" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	async getLowStock(
		@CurrentTenant() tenantId: string,
		@Query() filter: CenterAmmunitionStockFilterDto,
	): Promise<PaginatedResult<CenterAmmunitionStockResponseDto>> {
		return this.ammunitionService.getLowStockItems(tenantId, filter);
	}

	@Get("stock/center/:centerId")
	@Permissions("ammunition.read.stock")
	@ApiOperation({ summary: "Get ammunition stock for a specific center" })
	@ApiResponse({ status: 200, description: "Center ammunition stock records" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	async findStockByCenter(
		@CurrentTenant() tenantId: string,
		@Param("centerId") centerId: string,
		@Query() filter: CenterAmmunitionStockFilterDto,
	): Promise<PaginatedResult<CenterAmmunitionStockResponseDto>> {
		return this.ammunitionService.findStockByCenter(tenantId, centerId, filter);
	}

	@Get("stock/:id")
	@Permissions("ammunition.read.stock")
	@ApiOperation({ summary: "Get ammunition stock record by ID" })
	@ApiResponse({ status: 200, description: "Ammunition stock details" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Stock record not found" })
	async findOneStock(
		@CurrentTenant() tenantId: string,
		@Param("id") id: string,
	): Promise<CenterAmmunitionStockResponseDto> {
		return this.ammunitionService.findOneStock(tenantId, id);
	}

	@Post("stock")
	@Permissions("ammunition.manage.stock")
	@ApiOperation({ summary: "Create a new center ammunition stock record" })
	@ApiResponse({ status: 201, description: "Stock record created successfully" })
	@ApiResponse({ status: 400, description: "Stock record already exists for this center and ammunition type" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Center or ammunition type not found" })
	async createStock(
		@CurrentTenant() tenantId: string,
		@Body() dto: CreateCenterAmmunitionStockDto,
	): Promise<CenterAmmunitionStockResponseDto> {
		return this.ammunitionService.createStock(tenantId, dto);
	}

	@Patch("stock/:id")
	@Permissions("ammunition.manage.stock")
	@ApiOperation({ summary: "Update a center ammunition stock record" })
	@ApiResponse({ status: 200, description: "Stock record updated successfully" })
	@ApiResponse({ status: 400, description: "Invalid quantity adjustment" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Stock record not found" })
	async updateStock(
		@CurrentTenant() tenantId: string,
		@Param("id") id: string,
		@Body() dto: UpdateCenterAmmunitionStockDto,
	): Promise<CenterAmmunitionStockResponseDto> {
		return this.ammunitionService.updateStock(tenantId, id, dto);
	}

	@Post("stock/:id/adjust")
	@Permissions("ammunition.manage.stock")
	@ApiOperation({ summary: "Adjust center ammunition stock quantity" })
	@ApiResponse({ status: 200, description: "Stock quantity adjusted successfully" })
	@ApiResponse({ status: 400, description: "Adjustment would result in negative stock" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Stock record not found" })
	async adjustStock(
		@CurrentTenant() tenantId: string,
		@Param("id") id: string,
		@Body() dto: AdjustCenterAmmunitionStockDto,
	): Promise<CenterAmmunitionStockResponseDto> {
		return this.ammunitionService.adjustStock(tenantId, id, dto);
	}

	@Get("transactions")
	@Permissions("ammunition.read.transaction")
	@ApiOperation({ summary: "Get all ammunition transactions" })
	@ApiResponse({ status: 200, description: "List of ammunition transactions" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	async findAllTransactions(
		@CurrentTenant() tenantId: string,
		@Query() filter: AmmunitionTransactionFilterDto,
	): Promise<PaginatedResult<AmmunitionTransactionResponseDto>> {
		return this.ammunitionService.findAllTransactions(tenantId, filter);
	}

	@Get("transactions/employee/:employeeId")
	@Permissions("ammunition.read.transaction")
	@ApiOperation({ summary: "Get ammunition transactions for an employee" })
	@ApiResponse({ status: 200, description: "List of ammunition transactions for employee" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	async findTransactionsByEmployee(
		@CurrentTenant() tenantId: string,
		@Param("employeeId") employeeId: string,
		@Query() filter: AmmunitionTransactionFilterDto,
	): Promise<PaginatedResult<AmmunitionTransactionResponseDto>> {
		return this.ammunitionService.findTransactionsByEmployee(tenantId, employeeId, filter);
	}

	@Post("transactions")
	@Permissions("ammunition.create.transaction")
	@ApiOperation({ summary: "Create a new ammunition transaction" })
	@ApiResponse({ status: 201, description: "Transaction created successfully" })
	@ApiResponse({ status: 400, description: "Insufficient ammunition available or no stock record exists" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Ammunition type, center, or employee not found" })
	async createTransaction(
		@CurrentTenant() tenantId: string,
		@CurrentUser("id") userId: string,
		@Body() dto: CreateAmmunitionTransactionDto,
	): Promise<AmmunitionTransactionResponseDto> {
		return this.ammunitionService.createTransaction(tenantId, userId, dto);
	}
}

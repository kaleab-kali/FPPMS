import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentTenant } from "#api/common/decorators/current-tenant.decorator";
import { CurrentUser } from "#api/common/decorators/current-user.decorator";
import { Permissions } from "#api/common/decorators/permissions.decorator";
import { JwtAuthGuard } from "#api/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "#api/common/guards/permissions.guard";
import { PaginatedResult } from "#api/common/interfaces/paginated-result.interface";
import {
	CreateWeaponAssignmentDto,
	CreateWeaponCategoryDto,
	CreateWeaponDto,
	CreateWeaponTypeDto,
	ReturnWeaponDto,
	UpdateWeaponCategoryDto,
	UpdateWeaponDto,
	UpdateWeaponTypeDto,
	WeaponAssignmentResponseDto,
	WeaponCategoryFilterDto,
	WeaponCategoryResponseDto,
	WeaponFilterDto,
	WeaponResponseDto,
	WeaponTypeFilterDto,
	WeaponTypeResponseDto,
} from "./dto";
import { WeaponsService } from "./weapons.service";

@ApiTags("weapons")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("weapons")
export class WeaponsController {
	constructor(private readonly weaponsService: WeaponsService) {}

	@Get("categories")
	@Permissions("weapons.read.category")
	@ApiOperation({ summary: "Get all weapon categories" })
	@ApiResponse({ status: 200, description: "List of weapon categories returned successfully" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	async findAllCategories(
		@CurrentTenant() tenantId: string,
		@Query() filter: WeaponCategoryFilterDto,
	): Promise<PaginatedResult<WeaponCategoryResponseDto>> {
		return this.weaponsService.findAllCategories(tenantId, filter);
	}

	@Get("categories/:id")
	@Permissions("weapons.read.category")
	@ApiOperation({ summary: "Get weapon category by ID" })
	@ApiResponse({ status: 200, description: "Weapon category returned successfully" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Weapon category not found" })
	async findOneCategory(
		@CurrentTenant() tenantId: string,
		@Param("id") id: string,
	): Promise<WeaponCategoryResponseDto> {
		return this.weaponsService.findOneCategory(tenantId, id);
	}

	@Post("categories")
	@Permissions("weapons.create.category")
	@ApiOperation({ summary: "Create a new weapon category" })
	@ApiResponse({ status: 201, description: "Weapon category created successfully" })
	@ApiResponse({ status: 400, description: "Bad request - validation error or duplicate code" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	async createCategory(
		@CurrentTenant() tenantId: string,
		@Body() dto: CreateWeaponCategoryDto,
	): Promise<WeaponCategoryResponseDto> {
		return this.weaponsService.createCategory(tenantId, dto);
	}

	@Patch("categories/:id")
	@Permissions("weapons.update.category")
	@ApiOperation({ summary: "Update a weapon category" })
	@ApiResponse({ status: 200, description: "Weapon category updated successfully" })
	@ApiResponse({ status: 400, description: "Bad request - validation error" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Weapon category not found" })
	async updateCategory(
		@CurrentTenant() tenantId: string,
		@Param("id") id: string,
		@Body() dto: UpdateWeaponCategoryDto,
	): Promise<WeaponCategoryResponseDto> {
		return this.weaponsService.updateCategory(tenantId, id, dto);
	}

	@Delete("categories/:id")
	@Permissions("weapons.delete.category")
	@ApiOperation({ summary: "Delete a weapon category" })
	@ApiResponse({ status: 200, description: "Weapon category deleted successfully" })
	@ApiResponse({ status: 400, description: "Cannot delete category with existing weapon types" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Weapon category not found" })
	async deleteCategory(@CurrentTenant() tenantId: string, @Param("id") id: string): Promise<void> {
		return this.weaponsService.deleteCategory(tenantId, id);
	}

	@Get("types")
	@Permissions("weapons.read.type")
	@ApiOperation({ summary: "Get all weapon types" })
	@ApiResponse({ status: 200, description: "List of weapon types returned successfully" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	async findAllTypes(
		@CurrentTenant() tenantId: string,
		@Query() filter: WeaponTypeFilterDto,
	): Promise<PaginatedResult<WeaponTypeResponseDto>> {
		return this.weaponsService.findAllTypes(tenantId, filter);
	}

	@Get("types/:id")
	@Permissions("weapons.read.type")
	@ApiOperation({ summary: "Get weapon type by ID" })
	@ApiResponse({ status: 200, description: "Weapon type returned successfully" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Weapon type not found" })
	async findOneType(@CurrentTenant() tenantId: string, @Param("id") id: string): Promise<WeaponTypeResponseDto> {
		return this.weaponsService.findOneType(tenantId, id);
	}

	@Post("types")
	@Permissions("weapons.create.type")
	@ApiOperation({ summary: "Create a new weapon type" })
	@ApiResponse({ status: 201, description: "Weapon type created successfully" })
	@ApiResponse({ status: 400, description: "Bad request - validation error or duplicate code" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Weapon category not found" })
	async createType(
		@CurrentTenant() tenantId: string,
		@Body() dto: CreateWeaponTypeDto,
	): Promise<WeaponTypeResponseDto> {
		return this.weaponsService.createType(tenantId, dto);
	}

	@Patch("types/:id")
	@Permissions("weapons.update.type")
	@ApiOperation({ summary: "Update a weapon type" })
	@ApiResponse({ status: 200, description: "Weapon type updated successfully" })
	@ApiResponse({ status: 400, description: "Bad request - validation error" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Weapon type or category not found" })
	async updateType(
		@CurrentTenant() tenantId: string,
		@Param("id") id: string,
		@Body() dto: UpdateWeaponTypeDto,
	): Promise<WeaponTypeResponseDto> {
		return this.weaponsService.updateType(tenantId, id, dto);
	}

	@Delete("types/:id")
	@Permissions("weapons.delete.type")
	@ApiOperation({ summary: "Delete a weapon type" })
	@ApiResponse({ status: 200, description: "Weapon type deleted successfully" })
	@ApiResponse({ status: 400, description: "Cannot delete weapon type with existing weapons" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Weapon type not found" })
	async deleteType(@CurrentTenant() tenantId: string, @Param("id") id: string): Promise<void> {
		return this.weaponsService.deleteType(tenantId, id);
	}

	@Get()
	@Permissions("weapons.read.weapon")
	@ApiOperation({ summary: "Get all weapons" })
	@ApiResponse({ status: 200, description: "List of weapons returned successfully" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	async findAllWeapons(
		@CurrentTenant() tenantId: string,
		@Query() filter: WeaponFilterDto,
	): Promise<PaginatedResult<WeaponResponseDto>> {
		return this.weaponsService.findAllWeapons(tenantId, filter);
	}

	@Get(":id")
	@Permissions("weapons.read.weapon")
	@ApiOperation({ summary: "Get weapon by ID" })
	@ApiResponse({ status: 200, description: "Weapon returned successfully" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Weapon not found" })
	async findOneWeapon(@CurrentTenant() tenantId: string, @Param("id") id: string): Promise<WeaponResponseDto> {
		return this.weaponsService.findOneWeapon(tenantId, id);
	}

	@Post()
	@Permissions("weapons.create.weapon")
	@ApiOperation({ summary: "Register a new weapon" })
	@ApiResponse({ status: 201, description: "Weapon registered successfully" })
	@ApiResponse({ status: 400, description: "Bad request - validation error or duplicate serial number" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Weapon type or center not found" })
	async createWeapon(@CurrentTenant() tenantId: string, @Body() dto: CreateWeaponDto): Promise<WeaponResponseDto> {
		return this.weaponsService.createWeapon(tenantId, dto);
	}

	@Patch(":id")
	@Permissions("weapons.update.weapon")
	@ApiOperation({ summary: "Update a weapon" })
	@ApiResponse({ status: 200, description: "Weapon updated successfully" })
	@ApiResponse({ status: 400, description: "Bad request - validation error" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Weapon, weapon type, or center not found" })
	async updateWeapon(
		@CurrentTenant() tenantId: string,
		@Param("id") id: string,
		@Body() dto: UpdateWeaponDto,
	): Promise<WeaponResponseDto> {
		return this.weaponsService.updateWeapon(tenantId, id, dto);
	}

	@Post("assignments")
	@Permissions("weapons.create.assignment")
	@ApiOperation({ summary: "Assign a weapon to an employee" })
	@ApiResponse({ status: 201, description: "Weapon assigned successfully" })
	@ApiResponse({ status: 400, description: "Weapon already assigned or not in service" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Weapon or employee not found" })
	async assignWeapon(
		@CurrentTenant() tenantId: string,
		@CurrentUser("id") userId: string,
		@Body() dto: CreateWeaponAssignmentDto,
	): Promise<WeaponAssignmentResponseDto> {
		return this.weaponsService.assignWeapon(tenantId, userId, dto);
	}

	@Post("assignments/:id/return")
	@Permissions("weapons.manage.return")
	@ApiOperation({ summary: "Return a weapon" })
	@ApiResponse({ status: 200, description: "Weapon returned successfully" })
	@ApiResponse({ status: 400, description: "Weapon already returned" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Assignment not found" })
	async returnWeapon(
		@CurrentTenant() tenantId: string,
		@CurrentUser("id") userId: string,
		@Param("id") id: string,
		@Body() dto: ReturnWeaponDto,
	): Promise<WeaponAssignmentResponseDto> {
		return this.weaponsService.returnWeapon(tenantId, id, userId, dto);
	}

	@Get("assignments/employee/:employeeId")
	@Permissions("weapons.read.assignment")
	@ApiOperation({ summary: "Get weapon assignments for an employee" })
	@ApiResponse({ status: 200, description: "List of weapon assignments for employee" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	async findAssignmentsByEmployee(
		@CurrentTenant() tenantId: string,
		@Param("employeeId") employeeId: string,
		@Query("isReturned") isReturned?: string,
	): Promise<WeaponAssignmentResponseDto[]> {
		const returned = isReturned === "true" ? true : isReturned === "false" ? false : undefined;
		return this.weaponsService.findAssignmentsByEmployee(tenantId, employeeId, returned);
	}

	@Get(":id/assignments")
	@Permissions("weapons.read.assignment")
	@ApiOperation({ summary: "Get assignment history for a weapon" })
	@ApiResponse({ status: 200, description: "List of assignments for the weapon" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	async findAssignmentsByWeapon(
		@CurrentTenant() tenantId: string,
		@Param("id") weaponId: string,
	): Promise<WeaponAssignmentResponseDto[]> {
		return this.weaponsService.findAssignmentsByWeapon(tenantId, weaponId);
	}
}

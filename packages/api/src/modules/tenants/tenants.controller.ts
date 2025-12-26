import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Permissions } from "#api/common/decorators/permissions.decorator";
import { CreateTenantDto } from "#api/modules/tenants/dto/create-tenant.dto";
import { TenantResponseDto } from "#api/modules/tenants/dto/tenant-response.dto";
import { UpdateTenantDto } from "#api/modules/tenants/dto/update-tenant.dto";
import { TenantsService } from "#api/modules/tenants/tenants.service";

@ApiTags("tenants")
@ApiBearerAuth("JWT-auth")
@Controller("tenants")
export class TenantsController {
	constructor(private tenantsService: TenantsService) {}

	@Post()
	@Permissions("tenants.create.tenant")
	@ApiOperation({ summary: "Create tenant", description: "Create a new tenant organization" })
	@ApiResponse({ status: 201, description: "Tenant created", type: TenantResponseDto })
	create(@Body() dto: CreateTenantDto): Promise<TenantResponseDto> {
		return this.tenantsService.create(dto);
	}

	@Get()
	@Permissions("tenants.read.tenant")
	@ApiOperation({ summary: "List all tenants", description: "Get all tenant organizations" })
	@ApiResponse({ status: 200, description: "List of tenants", type: [TenantResponseDto] })
	findAll(): Promise<TenantResponseDto[]> {
		return this.tenantsService.findAll();
	}

	@Get(":id")
	@Permissions("tenants.read.tenant")
	@ApiOperation({ summary: "Get tenant by ID", description: "Get a single tenant by ID" })
	@ApiResponse({ status: 200, description: "Tenant details", type: TenantResponseDto })
	@ApiResponse({ status: 404, description: "Tenant not found" })
	findOne(@Param("id") id: string): Promise<TenantResponseDto> {
		return this.tenantsService.findOne(id);
	}

	@Get("code/:code")
	@Permissions("tenants.read.tenant")
	@ApiOperation({ summary: "Get tenant by code", description: "Get a single tenant by code" })
	@ApiResponse({ status: 200, description: "Tenant details", type: TenantResponseDto })
	@ApiResponse({ status: 404, description: "Tenant not found" })
	findByCode(@Param("code") code: string): Promise<TenantResponseDto> {
		return this.tenantsService.findByCode(code);
	}

	@Patch(":id")
	@Permissions("tenants.update.tenant")
	@ApiOperation({ summary: "Update tenant", description: "Update tenant details" })
	@ApiResponse({ status: 200, description: "Tenant updated", type: TenantResponseDto })
	@ApiResponse({ status: 404, description: "Tenant not found" })
	update(@Param("id") id: string, @Body() dto: UpdateTenantDto): Promise<TenantResponseDto> {
		return this.tenantsService.update(id, dto);
	}

	@Delete(":id")
	@Permissions("tenants.delete.tenant")
	@ApiOperation({ summary: "Delete tenant", description: "Delete a tenant organization" })
	@ApiResponse({ status: 200, description: "Tenant deleted" })
	@ApiResponse({ status: 404, description: "Tenant not found" })
	remove(@Param("id") id: string): Promise<{ message: string }> {
		return this.tenantsService.remove(id);
	}
}

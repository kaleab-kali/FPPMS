import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { SYSTEM_ROLES } from "#api/common/constants/roles.constant";
import { Roles } from "#api/common/decorators/roles.decorator";
import { CreateTenantDto } from "#api/modules/tenants/dto/create-tenant.dto";
import { TenantResponseDto } from "#api/modules/tenants/dto/tenant-response.dto";
import { UpdateTenantDto } from "#api/modules/tenants/dto/update-tenant.dto";
import { TenantsService } from "#api/modules/tenants/tenants.service";

@Controller("tenants")
@Roles(SYSTEM_ROLES.IT_ADMIN)
export class TenantsController {
	constructor(private tenantsService: TenantsService) {}

	@Post()
	create(@Body() dto: CreateTenantDto): Promise<TenantResponseDto> {
		return this.tenantsService.create(dto);
	}

	@Get()
	findAll(): Promise<TenantResponseDto[]> {
		return this.tenantsService.findAll();
	}

	@Get(":id")
	findOne(@Param("id") id: string): Promise<TenantResponseDto> {
		return this.tenantsService.findOne(id);
	}

	@Get("code/:code")
	findByCode(@Param("code") code: string): Promise<TenantResponseDto> {
		return this.tenantsService.findByCode(code);
	}

	@Patch(":id")
	update(@Param("id") id: string, @Body() dto: UpdateTenantDto): Promise<TenantResponseDto> {
		return this.tenantsService.update(id, dto);
	}

	@Delete(":id")
	remove(@Param("id") id: string): Promise<{ message: string }> {
		return this.tenantsService.remove(id);
	}
}

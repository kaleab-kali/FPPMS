import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { SYSTEM_ROLES } from "#api/common/constants/roles.constant";
import { CurrentUser } from "#api/common/decorators/current-user.decorator";
import { Roles } from "#api/common/decorators/roles.decorator";
import { AuthUserDto } from "#api/common/dto/auth-user.dto";
import { CreateWoredaDto } from "#api/modules/lookups/dto/create-woreda.dto";
import { UpdateWoredaDto } from "#api/modules/lookups/dto/update-woreda.dto";
import { WoredaResponseDto } from "#api/modules/lookups/dto/woreda-response.dto";
import { WoredasService } from "#api/modules/lookups/woredas.service";

@Controller("lookups/woredas")
export class WoredasController {
	constructor(private woredasService: WoredasService) {}

	@Post()
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN)
	create(@CurrentUser() user: AuthUserDto, @Body() dto: CreateWoredaDto): Promise<WoredaResponseDto> {
		return this.woredasService.create(user.tenantId, dto);
	}

	@Get()
	findAll(@CurrentUser() user: AuthUserDto, @Query("subCityId") subCityId?: string): Promise<WoredaResponseDto[]> {
		if (subCityId) {
			return this.woredasService.findBySubCity(user.tenantId, subCityId);
		}
		return this.woredasService.findAll(user.tenantId);
	}

	@Get(":id")
	findOne(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<WoredaResponseDto> {
		return this.woredasService.findOne(user.tenantId, id);
	}

	@Patch(":id")
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN)
	update(
		@CurrentUser() user: AuthUserDto,
		@Param("id") id: string,
		@Body() dto: UpdateWoredaDto,
	): Promise<WoredaResponseDto> {
		return this.woredasService.update(user.tenantId, id, dto);
	}

	@Delete(":id")
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN)
	remove(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<{ message: string }> {
		return this.woredasService.remove(user.tenantId, id);
	}
}

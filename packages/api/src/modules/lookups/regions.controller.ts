import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { SYSTEM_ROLES } from "#api/common/constants/roles.constant";
import { CurrentUser } from "#api/common/decorators/current-user.decorator";
import { Roles } from "#api/common/decorators/roles.decorator";
import { AuthUserDto } from "#api/common/dto/auth-user.dto";
import { CreateRegionDto } from "#api/modules/lookups/dto/create-region.dto";
import { RegionResponseDto } from "#api/modules/lookups/dto/region-response.dto";
import { UpdateRegionDto } from "#api/modules/lookups/dto/update-region.dto";
import { RegionsService } from "#api/modules/lookups/regions.service";

@Controller("lookups/regions")
export class RegionsController {
	constructor(private regionsService: RegionsService) {}

	@Post()
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN)
	create(@CurrentUser() user: AuthUserDto, @Body() dto: CreateRegionDto): Promise<RegionResponseDto> {
		return this.regionsService.create(user.tenantId, dto);
	}

	@Get()
	findAll(@CurrentUser() user: AuthUserDto): Promise<RegionResponseDto[]> {
		return this.regionsService.findAll(user.tenantId);
	}

	@Get(":id")
	findOne(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<RegionResponseDto> {
		return this.regionsService.findOne(user.tenantId, id);
	}

	@Patch(":id")
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN)
	update(
		@CurrentUser() user: AuthUserDto,
		@Param("id") id: string,
		@Body() dto: UpdateRegionDto,
	): Promise<RegionResponseDto> {
		return this.regionsService.update(user.tenantId, id, dto);
	}

	@Delete(":id")
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN)
	remove(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<{ message: string }> {
		return this.regionsService.remove(user.tenantId, id);
	}
}

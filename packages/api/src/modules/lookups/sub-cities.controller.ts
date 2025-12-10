import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { SYSTEM_ROLES } from "#api/common/constants/roles.constant";
import { CurrentUser } from "#api/common/decorators/current-user.decorator";
import { Roles } from "#api/common/decorators/roles.decorator";
import { AuthUserDto } from "#api/common/dto/auth-user.dto";
import { CreateSubCityDto } from "#api/modules/lookups/dto/create-sub-city.dto";
import { SubCityResponseDto } from "#api/modules/lookups/dto/sub-city-response.dto";
import { UpdateSubCityDto } from "#api/modules/lookups/dto/update-sub-city.dto";
import { SubCitiesService } from "#api/modules/lookups/sub-cities.service";

@Controller("lookups/sub-cities")
export class SubCitiesController {
	constructor(private subCitiesService: SubCitiesService) {}

	@Post()
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN)
	create(@CurrentUser() user: AuthUserDto, @Body() dto: CreateSubCityDto): Promise<SubCityResponseDto> {
		return this.subCitiesService.create(user.tenantId, dto);
	}

	@Get()
	findAll(@CurrentUser() user: AuthUserDto, @Query("regionId") regionId?: string): Promise<SubCityResponseDto[]> {
		if (regionId) {
			return this.subCitiesService.findByRegion(user.tenantId, regionId);
		}
		return this.subCitiesService.findAll(user.tenantId);
	}

	@Get(":id")
	findOne(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<SubCityResponseDto> {
		return this.subCitiesService.findOne(user.tenantId, id);
	}

	@Patch(":id")
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN)
	update(
		@CurrentUser() user: AuthUserDto,
		@Param("id") id: string,
		@Body() dto: UpdateSubCityDto,
	): Promise<SubCityResponseDto> {
		return this.subCitiesService.update(user.tenantId, id, dto);
	}

	@Delete(":id")
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN)
	remove(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<{ message: string }> {
		return this.subCitiesService.remove(user.tenantId, id);
	}
}

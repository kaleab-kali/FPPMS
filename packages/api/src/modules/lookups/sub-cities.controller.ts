import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SYSTEM_ROLES } from "#api/common/constants/roles.constant";
import { CurrentUser } from "#api/common/decorators/current-user.decorator";
import { Roles } from "#api/common/decorators/roles.decorator";
import { AuthUserDto } from "#api/common/dto/auth-user.dto";
import { CreateSubCityDto } from "#api/modules/lookups/dto/create-sub-city.dto";
import { SubCityResponseDto } from "#api/modules/lookups/dto/sub-city-response.dto";
import { UpdateSubCityDto } from "#api/modules/lookups/dto/update-sub-city.dto";
import { SubCitiesService } from "#api/modules/lookups/sub-cities.service";

@ApiTags("lookups")
@ApiBearerAuth("JWT-auth")
@Controller("lookups/sub-cities")
export class SubCitiesController {
	constructor(private subCitiesService: SubCitiesService) {}

	@Post()
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN)
	@ApiOperation({ summary: "Create sub-city", description: "Create a new sub-city" })
	@ApiResponse({ status: 201, description: "Sub-city created", type: SubCityResponseDto })
	create(@CurrentUser() user: AuthUserDto, @Body() dto: CreateSubCityDto): Promise<SubCityResponseDto> {
		return this.subCitiesService.create(user.tenantId, dto);
	}

	@Get()
	@ApiOperation({ summary: "List all sub-cities", description: "Get all sub-cities, optionally filtered by region" })
	@ApiQuery({ name: "regionId", required: false, description: "Filter by region ID" })
	@ApiResponse({ status: 200, description: "List of sub-cities", type: [SubCityResponseDto] })
	findAll(@CurrentUser() user: AuthUserDto, @Query("regionId") regionId?: string): Promise<SubCityResponseDto[]> {
		if (regionId) {
			return this.subCitiesService.findByRegion(user.tenantId, regionId);
		}
		return this.subCitiesService.findAll(user.tenantId);
	}

	@Get(":id")
	@ApiOperation({ summary: "Get sub-city by ID", description: "Get a single sub-city by ID" })
	@ApiResponse({ status: 200, description: "Sub-city details", type: SubCityResponseDto })
	@ApiResponse({ status: 404, description: "Sub-city not found" })
	findOne(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<SubCityResponseDto> {
		return this.subCitiesService.findOne(user.tenantId, id);
	}

	@Patch(":id")
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN)
	@ApiOperation({ summary: "Update sub-city", description: "Update sub-city details" })
	@ApiResponse({ status: 200, description: "Sub-city updated", type: SubCityResponseDto })
	@ApiResponse({ status: 404, description: "Sub-city not found" })
	update(
		@CurrentUser() user: AuthUserDto,
		@Param("id") id: string,
		@Body() dto: UpdateSubCityDto,
	): Promise<SubCityResponseDto> {
		return this.subCitiesService.update(user.tenantId, id, dto);
	}

	@Delete(":id")
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN)
	@ApiOperation({ summary: "Delete sub-city", description: "Delete a sub-city" })
	@ApiResponse({ status: 200, description: "Sub-city deleted" })
	@ApiResponse({ status: 404, description: "Sub-city not found" })
	remove(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<{ message: string }> {
		return this.subCitiesService.remove(user.tenantId, id);
	}
}

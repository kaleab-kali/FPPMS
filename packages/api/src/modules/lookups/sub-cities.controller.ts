import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "#api/common/decorators/current-user.decorator";
import { Permissions } from "#api/common/decorators/permissions.decorator";
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
	@Permissions("lookups.create.subcity")
	@ApiOperation({ summary: "Create sub-city", description: "Create a new sub-city" })
	@ApiResponse({ status: 201, description: "Sub-city created", type: SubCityResponseDto })
	create(@CurrentUser() user: AuthUserDto, @Body() dto: CreateSubCityDto): Promise<SubCityResponseDto> {
		return this.subCitiesService.create(user.tenantId, dto);
	}

	@Get()
	@Permissions("lookups.read.subcity")
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
	@Permissions("lookups.read.subcity")
	@ApiOperation({ summary: "Get sub-city by ID", description: "Get a single sub-city by ID" })
	@ApiResponse({ status: 200, description: "Sub-city details", type: SubCityResponseDto })
	@ApiResponse({ status: 404, description: "Sub-city not found" })
	findOne(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<SubCityResponseDto> {
		return this.subCitiesService.findOne(user.tenantId, id);
	}

	@Patch(":id")
	@Permissions("lookups.update.subcity")
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
	@Permissions("lookups.delete.subcity")
	@ApiOperation({ summary: "Delete sub-city", description: "Delete a sub-city" })
	@ApiResponse({ status: 200, description: "Sub-city deleted" })
	@ApiResponse({ status: 404, description: "Sub-city not found" })
	remove(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<{ message: string }> {
		return this.subCitiesService.remove(user.tenantId, id);
	}
}

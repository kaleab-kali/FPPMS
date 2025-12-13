import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SYSTEM_ROLES } from "#api/common/constants/roles.constant";
import { CurrentUser } from "#api/common/decorators/current-user.decorator";
import { Roles } from "#api/common/decorators/roles.decorator";
import { AuthUserDto } from "#api/common/dto/auth-user.dto";
import { CreateRegionDto } from "#api/modules/lookups/dto/create-region.dto";
import { RegionResponseDto } from "#api/modules/lookups/dto/region-response.dto";
import { UpdateRegionDto } from "#api/modules/lookups/dto/update-region.dto";
import { RegionsService } from "#api/modules/lookups/regions.service";

@ApiTags("lookups")
@ApiBearerAuth("JWT-auth")
@Controller("lookups/regions")
export class RegionsController {
	constructor(private regionsService: RegionsService) {}

	@Post()
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN)
	@ApiOperation({ summary: "Create region", description: "Create a new region" })
	@ApiResponse({ status: 201, description: "Region created", type: RegionResponseDto })
	create(@CurrentUser() user: AuthUserDto, @Body() dto: CreateRegionDto): Promise<RegionResponseDto> {
		return this.regionsService.create(user.tenantId, dto);
	}

	@Get()
	@ApiOperation({ summary: "List all regions", description: "Get all regions" })
	@ApiResponse({ status: 200, description: "List of regions", type: [RegionResponseDto] })
	findAll(@CurrentUser() user: AuthUserDto): Promise<RegionResponseDto[]> {
		return this.regionsService.findAll(user.tenantId);
	}

	@Get(":id")
	@ApiOperation({ summary: "Get region by ID", description: "Get a single region by ID" })
	@ApiResponse({ status: 200, description: "Region details", type: RegionResponseDto })
	@ApiResponse({ status: 404, description: "Region not found" })
	findOne(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<RegionResponseDto> {
		return this.regionsService.findOne(user.tenantId, id);
	}

	@Patch(":id")
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN)
	@ApiOperation({ summary: "Update region", description: "Update region details" })
	@ApiResponse({ status: 200, description: "Region updated", type: RegionResponseDto })
	@ApiResponse({ status: 404, description: "Region not found" })
	update(
		@CurrentUser() user: AuthUserDto,
		@Param("id") id: string,
		@Body() dto: UpdateRegionDto,
	): Promise<RegionResponseDto> {
		return this.regionsService.update(user.tenantId, id, dto);
	}

	@Delete(":id")
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN)
	@ApiOperation({ summary: "Delete region", description: "Delete a region" })
	@ApiResponse({ status: 200, description: "Region deleted" })
	@ApiResponse({ status: 404, description: "Region not found" })
	remove(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<{ message: string }> {
		return this.regionsService.remove(user.tenantId, id);
	}
}

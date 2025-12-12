import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SYSTEM_ROLES } from "#api/common/constants/roles.constant";
import { CurrentUser } from "#api/common/decorators/current-user.decorator";
import { Roles } from "#api/common/decorators/roles.decorator";
import { AuthUserDto } from "#api/common/dto/auth-user.dto";
import { CentersService } from "#api/modules/centers/centers.service";
import { CenterResponseDto } from "#api/modules/centers/dto/center-response.dto";
import { CreateCenterDto } from "#api/modules/centers/dto/create-center.dto";
import { UpdateCenterDto } from "#api/modules/centers/dto/update-center.dto";

@ApiTags("centers")
@ApiBearerAuth("JWT-auth")
@Controller("centers")
@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN, SYSTEM_ROLES.CENTER_ADMIN)
export class CentersController {
	constructor(private centersService: CentersService) {}

	@Post()
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN)
	@ApiOperation({ summary: "Create center", description: "Create a new center/facility" })
	@ApiResponse({ status: 201, description: "Center created", type: CenterResponseDto })
	create(@CurrentUser() user: AuthUserDto, @Body() dto: CreateCenterDto): Promise<CenterResponseDto> {
		return this.centersService.create(user.tenantId, dto);
	}

	@Get()
	@ApiOperation({ summary: "List all centers", description: "Get all centers for current tenant" })
	@ApiResponse({ status: 200, description: "List of centers", type: [CenterResponseDto] })
	findAll(@CurrentUser() user: AuthUserDto): Promise<CenterResponseDto[]> {
		return this.centersService.findAll(user.tenantId);
	}

	@Get("hierarchy")
	@ApiOperation({ summary: "Get center hierarchy", description: "Get centers in hierarchical structure" })
	@ApiQuery({ name: "parentId", required: false, description: "Parent center ID" })
	@ApiResponse({ status: 200, description: "Center hierarchy", type: [CenterResponseDto] })
	findHierarchy(@CurrentUser() user: AuthUserDto, @Query("parentId") parentId?: string): Promise<CenterResponseDto[]> {
		return this.centersService.findHierarchy(user.tenantId, parentId);
	}

	@Get(":id")
	@ApiOperation({ summary: "Get center by ID", description: "Get a single center by ID" })
	@ApiResponse({ status: 200, description: "Center details", type: CenterResponseDto })
	@ApiResponse({ status: 404, description: "Center not found" })
	findOne(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<CenterResponseDto> {
		return this.centersService.findOne(user.tenantId, id);
	}

	@Get("code/:code")
	@ApiOperation({ summary: "Get center by code", description: "Get a single center by code" })
	@ApiResponse({ status: 200, description: "Center details", type: CenterResponseDto })
	@ApiResponse({ status: 404, description: "Center not found" })
	findByCode(@CurrentUser() user: AuthUserDto, @Param("code") code: string): Promise<CenterResponseDto> {
		return this.centersService.findByCode(user.tenantId, code);
	}

	@Patch(":id")
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN)
	@ApiOperation({ summary: "Update center", description: "Update center details" })
	@ApiResponse({ status: 200, description: "Center updated", type: CenterResponseDto })
	@ApiResponse({ status: 404, description: "Center not found" })
	update(
		@CurrentUser() user: AuthUserDto,
		@Param("id") id: string,
		@Body() dto: UpdateCenterDto,
	): Promise<CenterResponseDto> {
		return this.centersService.update(user.tenantId, id, dto);
	}

	@Delete(":id")
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN)
	@ApiOperation({ summary: "Delete center", description: "Delete a center" })
	@ApiResponse({ status: 200, description: "Center deleted" })
	@ApiResponse({ status: 404, description: "Center not found" })
	remove(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<{ message: string }> {
		return this.centersService.remove(user.tenantId, id);
	}
}

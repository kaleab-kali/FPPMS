import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { SYSTEM_ROLES } from "#api/common/constants/roles.constant";
import { CurrentUser } from "#api/common/decorators/current-user.decorator";
import { Roles } from "#api/common/decorators/roles.decorator";
import { AuthUserDto } from "#api/common/dto/auth-user.dto";
import { CentersService } from "#api/modules/centers/centers.service";
import { CenterResponseDto } from "#api/modules/centers/dto/center-response.dto";
import { CreateCenterDto } from "#api/modules/centers/dto/create-center.dto";
import { UpdateCenterDto } from "#api/modules/centers/dto/update-center.dto";

@Controller("centers")
@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN, SYSTEM_ROLES.CENTER_ADMIN)
export class CentersController {
	constructor(private centersService: CentersService) {}

	@Post()
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN)
	create(@CurrentUser() user: AuthUserDto, @Body() dto: CreateCenterDto): Promise<CenterResponseDto> {
		return this.centersService.create(user.tenantId, dto);
	}

	@Get()
	findAll(@CurrentUser() user: AuthUserDto): Promise<CenterResponseDto[]> {
		return this.centersService.findAll(user.tenantId);
	}

	@Get("hierarchy")
	findHierarchy(@CurrentUser() user: AuthUserDto, @Query("parentId") parentId?: string): Promise<CenterResponseDto[]> {
		return this.centersService.findHierarchy(user.tenantId, parentId);
	}

	@Get(":id")
	findOne(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<CenterResponseDto> {
		return this.centersService.findOne(user.tenantId, id);
	}

	@Get("code/:code")
	findByCode(@CurrentUser() user: AuthUserDto, @Param("code") code: string): Promise<CenterResponseDto> {
		return this.centersService.findByCode(user.tenantId, code);
	}

	@Patch(":id")
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN)
	update(
		@CurrentUser() user: AuthUserDto,
		@Param("id") id: string,
		@Body() dto: UpdateCenterDto,
	): Promise<CenterResponseDto> {
		return this.centersService.update(user.tenantId, id, dto);
	}

	@Delete(":id")
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN)
	remove(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<{ message: string }> {
		return this.centersService.remove(user.tenantId, id);
	}
}

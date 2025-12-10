import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { SYSTEM_ROLES } from "#api/common/constants/roles.constant";
import { CurrentUser } from "#api/common/decorators/current-user.decorator";
import { Roles } from "#api/common/decorators/roles.decorator";
import { AuthUserDto } from "#api/common/dto/auth-user.dto";
import { CreatePositionDto } from "#api/modules/positions/dto/create-position.dto";
import { PositionResponseDto } from "#api/modules/positions/dto/position-response.dto";
import { UpdatePositionDto } from "#api/modules/positions/dto/update-position.dto";
import { PositionsService } from "#api/modules/positions/positions.service";

@Controller("positions")
export class PositionsController {
	constructor(private positionsService: PositionsService) {}

	@Post()
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN)
	create(@CurrentUser() user: AuthUserDto, @Body() dto: CreatePositionDto): Promise<PositionResponseDto> {
		return this.positionsService.create(user.tenantId, dto);
	}

	@Get()
	findAll(
		@CurrentUser() user: AuthUserDto,
		@Query("departmentId") departmentId?: string,
	): Promise<PositionResponseDto[]> {
		if (departmentId) {
			return this.positionsService.findByDepartment(user.tenantId, departmentId);
		}
		return this.positionsService.findAll(user.tenantId);
	}

	@Get(":id")
	findOne(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<PositionResponseDto> {
		return this.positionsService.findOne(user.tenantId, id);
	}

	@Patch(":id")
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN)
	update(
		@CurrentUser() user: AuthUserDto,
		@Param("id") id: string,
		@Body() dto: UpdatePositionDto,
	): Promise<PositionResponseDto> {
		return this.positionsService.update(user.tenantId, id, dto);
	}

	@Delete(":id")
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN)
	remove(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<{ message: string }> {
		return this.positionsService.remove(user.tenantId, id);
	}
}

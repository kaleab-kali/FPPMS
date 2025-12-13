import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SYSTEM_ROLES } from "#api/common/constants/roles.constant";
import { CurrentUser } from "#api/common/decorators/current-user.decorator";
import { Roles } from "#api/common/decorators/roles.decorator";
import { AuthUserDto } from "#api/common/dto/auth-user.dto";
import { CreatePositionDto } from "#api/modules/positions/dto/create-position.dto";
import { PositionResponseDto } from "#api/modules/positions/dto/position-response.dto";
import { UpdatePositionDto } from "#api/modules/positions/dto/update-position.dto";
import { PositionsService } from "#api/modules/positions/positions.service";

@ApiTags("positions")
@ApiBearerAuth("JWT-auth")
@Controller("positions")
export class PositionsController {
	constructor(private positionsService: PositionsService) {}

	@Post()
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN)
	@ApiOperation({ summary: "Create position", description: "Create a new job position" })
	@ApiResponse({ status: 201, description: "Position created", type: PositionResponseDto })
	create(@CurrentUser() user: AuthUserDto, @Body() dto: CreatePositionDto): Promise<PositionResponseDto> {
		return this.positionsService.create(user.tenantId, dto);
	}

	@Get()
	@ApiOperation({ summary: "List all positions", description: "Get all positions, optionally filtered by department" })
	@ApiQuery({ name: "departmentId", required: false, description: "Filter by department ID" })
	@ApiResponse({ status: 200, description: "List of positions", type: [PositionResponseDto] })
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
	@ApiOperation({ summary: "Get position by ID", description: "Get a single position by ID" })
	@ApiResponse({ status: 200, description: "Position details", type: PositionResponseDto })
	@ApiResponse({ status: 404, description: "Position not found" })
	findOne(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<PositionResponseDto> {
		return this.positionsService.findOne(user.tenantId, id);
	}

	@Patch(":id")
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN)
	@ApiOperation({ summary: "Update position", description: "Update position details" })
	@ApiResponse({ status: 200, description: "Position updated", type: PositionResponseDto })
	@ApiResponse({ status: 404, description: "Position not found" })
	update(
		@CurrentUser() user: AuthUserDto,
		@Param("id") id: string,
		@Body() dto: UpdatePositionDto,
	): Promise<PositionResponseDto> {
		return this.positionsService.update(user.tenantId, id, dto);
	}

	@Delete(":id")
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN)
	@ApiOperation({ summary: "Delete position", description: "Delete a position" })
	@ApiResponse({ status: 200, description: "Position deleted" })
	@ApiResponse({ status: 404, description: "Position not found" })
	remove(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<{ message: string }> {
		return this.positionsService.remove(user.tenantId, id);
	}
}

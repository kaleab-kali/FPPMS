import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "#api/common/decorators/current-user.decorator";
import { Permissions } from "#api/common/decorators/permissions.decorator";
import { AuthUserDto } from "#api/common/dto/auth-user.dto";
import { CreateShiftDefinitionDto, ShiftDefinitionResponseDto, UpdateShiftDefinitionDto } from "../dto";
import { ShiftDefinitionService } from "../services/shift-definition.service";

@ApiTags("shifts")
@ApiBearerAuth("JWT-auth")
@Controller("shifts")
export class ShiftDefinitionController {
	constructor(private readonly shiftDefinitionService: ShiftDefinitionService) {}

	@Post()
	@Permissions("attendance.manage.shift")
	@ApiOperation({
		summary: "Create shift definition",
		description: "Create a new shift definition",
	})
	@ApiResponse({ status: 201, description: "Shift definition created", type: ShiftDefinitionResponseDto })
	@ApiResponse({ status: 400, description: "Invalid input or shift code already exists" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Insufficient permissions" })
	create(@CurrentUser() user: AuthUserDto, @Body() dto: CreateShiftDefinitionDto): Promise<ShiftDefinitionResponseDto> {
		return this.shiftDefinitionService.create(user.tenantId, dto);
	}

	@Get()
	@Permissions("attendance.read.record")
	@ApiOperation({
		summary: "List shift definitions",
		description: "Get all shift definitions",
	})
	@ApiQuery({ name: "includeInactive", required: false, type: Boolean, description: "Include inactive shifts" })
	@ApiResponse({ status: 200, description: "List of shift definitions", type: [ShiftDefinitionResponseDto] })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Insufficient permissions" })
	findAll(
		@CurrentUser() user: AuthUserDto,
		@Query("includeInactive") includeInactive?: string,
	): Promise<ShiftDefinitionResponseDto[]> {
		return this.shiftDefinitionService.findAll(user.tenantId, includeInactive === "true");
	}

	@Get(":id")
	@Permissions("attendance.read.record")
	@ApiOperation({
		summary: "Get shift definition by ID",
		description: "Get a single shift definition by its ID",
	})
	@ApiParam({ name: "id", description: "Shift definition ID" })
	@ApiResponse({ status: 200, description: "Shift definition found", type: ShiftDefinitionResponseDto })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Insufficient permissions" })
	@ApiResponse({ status: 404, description: "Shift definition not found" })
	findOne(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<ShiftDefinitionResponseDto> {
		return this.shiftDefinitionService.findOne(user.tenantId, id);
	}

	@Get("code/:code")
	@Permissions("attendance.read.record")
	@ApiOperation({
		summary: "Get shift definition by code",
		description: "Get a single shift definition by its code",
	})
	@ApiParam({ name: "code", description: "Shift code" })
	@ApiResponse({ status: 200, description: "Shift definition found", type: ShiftDefinitionResponseDto })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Insufficient permissions" })
	@ApiResponse({ status: 404, description: "Shift definition not found" })
	findByCode(@CurrentUser() user: AuthUserDto, @Param("code") code: string): Promise<ShiftDefinitionResponseDto> {
		return this.shiftDefinitionService.findByCode(user.tenantId, code);
	}

	@Patch(":id")
	@Permissions("attendance.manage.shift")
	@ApiOperation({
		summary: "Update shift definition",
		description: "Update an existing shift definition",
	})
	@ApiParam({ name: "id", description: "Shift definition ID" })
	@ApiResponse({ status: 200, description: "Shift definition updated", type: ShiftDefinitionResponseDto })
	@ApiResponse({ status: 400, description: "Invalid input" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Insufficient permissions" })
	@ApiResponse({ status: 404, description: "Shift definition not found" })
	update(
		@CurrentUser() user: AuthUserDto,
		@Param("id") id: string,
		@Body() dto: UpdateShiftDefinitionDto,
	): Promise<ShiftDefinitionResponseDto> {
		return this.shiftDefinitionService.update(user.tenantId, id, dto);
	}

	@Delete(":id")
	@Permissions("attendance.manage.shift")
	@ApiOperation({
		summary: "Delete shift definition",
		description: "Delete a shift definition (only if no assignments or attendance records)",
	})
	@ApiParam({ name: "id", description: "Shift definition ID" })
	@ApiResponse({ status: 200, description: "Shift definition deleted" })
	@ApiResponse({ status: 400, description: "Cannot delete shift with active assignments" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Insufficient permissions" })
	@ApiResponse({ status: 404, description: "Shift definition not found" })
	delete(@CurrentUser() user: AuthUserDto, @Param("id") id: string) {
		return this.shiftDefinitionService.delete(user.tenantId, id);
	}
}

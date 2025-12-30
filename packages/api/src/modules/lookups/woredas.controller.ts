import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "#api/common/decorators/current-user.decorator";
import { Permissions } from "#api/common/decorators/permissions.decorator";
import { AuthUserDto } from "#api/common/dto/auth-user.dto";
import { CreateWoredaDto } from "#api/modules/lookups/dto/create-woreda.dto";
import { UpdateWoredaDto } from "#api/modules/lookups/dto/update-woreda.dto";
import { WoredaResponseDto } from "#api/modules/lookups/dto/woreda-response.dto";
import { WoredasService } from "#api/modules/lookups/woredas.service";

@ApiTags("lookups")
@ApiBearerAuth("JWT-auth")
@Controller("lookups/woredas")
export class WoredasController {
	constructor(private woredasService: WoredasService) {}

	@Post()
	@Permissions("lookups.create.woreda")
	@ApiOperation({ summary: "Create woreda", description: "Create a new woreda" })
	@ApiResponse({ status: 201, description: "Woreda created", type: WoredaResponseDto })
	create(@CurrentUser() user: AuthUserDto, @Body() dto: CreateWoredaDto): Promise<WoredaResponseDto> {
		return this.woredasService.create(user.tenantId, dto);
	}

	@Get()
	@Permissions("lookups.read.woreda")
	@ApiOperation({ summary: "List all woredas", description: "Get all woredas, optionally filtered by sub-city" })
	@ApiQuery({ name: "subCityId", required: false, description: "Filter by sub-city ID" })
	@ApiResponse({ status: 200, description: "List of woredas", type: [WoredaResponseDto] })
	findAll(@CurrentUser() user: AuthUserDto, @Query("subCityId") subCityId?: string): Promise<WoredaResponseDto[]> {
		if (subCityId) {
			return this.woredasService.findBySubCity(user.tenantId, subCityId);
		}
		return this.woredasService.findAll(user.tenantId);
	}

	@Get(":id")
	@Permissions("lookups.read.woreda")
	@ApiOperation({ summary: "Get woreda by ID", description: "Get a single woreda by ID" })
	@ApiResponse({ status: 200, description: "Woreda details", type: WoredaResponseDto })
	@ApiResponse({ status: 404, description: "Woreda not found" })
	findOne(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<WoredaResponseDto> {
		return this.woredasService.findOne(user.tenantId, id);
	}

	@Patch(":id")
	@Permissions("lookups.update.woreda")
	@ApiOperation({ summary: "Update woreda", description: "Update woreda details" })
	@ApiResponse({ status: 200, description: "Woreda updated", type: WoredaResponseDto })
	@ApiResponse({ status: 404, description: "Woreda not found" })
	update(
		@CurrentUser() user: AuthUserDto,
		@Param("id") id: string,
		@Body() dto: UpdateWoredaDto,
	): Promise<WoredaResponseDto> {
		return this.woredasService.update(user.tenantId, id, dto);
	}

	@Delete(":id")
	@Permissions("lookups.delete.woreda")
	@ApiOperation({ summary: "Delete woreda", description: "Delete a woreda" })
	@ApiResponse({ status: 200, description: "Woreda deleted" })
	@ApiResponse({ status: 404, description: "Woreda not found" })
	remove(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<{ message: string }> {
		return this.woredasService.remove(user.tenantId, id);
	}
}

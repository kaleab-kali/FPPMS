import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "#api/common/decorators/current-user.decorator";
import { Permissions } from "#api/common/decorators/permissions.decorator";
import { AuthUserDto } from "#api/common/dto/auth-user.dto";
import { CreateRankDto } from "#api/modules/ranks/dto/create-rank.dto";
import { RankResponseDto } from "#api/modules/ranks/dto/rank-response.dto";
import { UpdateRankDto } from "#api/modules/ranks/dto/update-rank.dto";
import { RanksService } from "#api/modules/ranks/ranks.service";

@ApiTags("ranks")
@ApiBearerAuth("JWT-auth")
@Controller("ranks")
export class RanksController {
	constructor(private ranksService: RanksService) {}

	@Post()
	@Permissions("ranks.create.rank")
	@ApiOperation({ summary: "Create rank", description: "Create a new military rank" })
	@ApiResponse({ status: 201, description: "Rank created", type: RankResponseDto })
	create(@CurrentUser() user: AuthUserDto, @Body() dto: CreateRankDto): Promise<RankResponseDto> {
		return this.ranksService.create(user.tenantId, dto);
	}

	@Get()
	@Permissions("ranks.read.rank")
	@ApiOperation({ summary: "List all ranks", description: "Get all military ranks, optionally filtered by category" })
	@ApiQuery({ name: "category", required: false, description: "Filter by rank category" })
	@ApiResponse({ status: 200, description: "List of ranks", type: [RankResponseDto] })
	findAll(@CurrentUser() user: AuthUserDto, @Query("category") category?: string): Promise<RankResponseDto[]> {
		if (category) {
			return this.ranksService.findByCategory(user.tenantId, category);
		}
		return this.ranksService.findAll(user.tenantId);
	}

	@Get(":id")
	@Permissions("ranks.read.rank")
	@ApiOperation({ summary: "Get rank by ID", description: "Get a single military rank by ID" })
	@ApiResponse({ status: 200, description: "Rank details", type: RankResponseDto })
	@ApiResponse({ status: 404, description: "Rank not found" })
	findOne(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<RankResponseDto> {
		return this.ranksService.findOne(user.tenantId, id);
	}

	@Patch(":id")
	@Permissions("ranks.update.rank")
	@ApiOperation({ summary: "Update rank", description: "Update military rank details" })
	@ApiResponse({ status: 200, description: "Rank updated", type: RankResponseDto })
	@ApiResponse({ status: 404, description: "Rank not found" })
	update(
		@CurrentUser() user: AuthUserDto,
		@Param("id") id: string,
		@Body() dto: UpdateRankDto,
	): Promise<RankResponseDto> {
		return this.ranksService.update(user.tenantId, id, dto);
	}

	@Delete(":id")
	@Permissions("ranks.delete.rank")
	@ApiOperation({ summary: "Delete rank", description: "Delete a military rank" })
	@ApiResponse({ status: 200, description: "Rank deleted" })
	@ApiResponse({ status: 404, description: "Rank not found" })
	remove(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<{ message: string }> {
		return this.ranksService.remove(user.tenantId, id);
	}
}

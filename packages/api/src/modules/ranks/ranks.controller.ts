import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { SYSTEM_ROLES } from "#api/common/constants/roles.constant";
import { CurrentUser } from "#api/common/decorators/current-user.decorator";
import { Roles } from "#api/common/decorators/roles.decorator";
import { AuthUserDto } from "#api/common/dto/auth-user.dto";
import { CreateRankDto } from "#api/modules/ranks/dto/create-rank.dto";
import { RankResponseDto } from "#api/modules/ranks/dto/rank-response.dto";
import { UpdateRankDto } from "#api/modules/ranks/dto/update-rank.dto";
import { RanksService } from "#api/modules/ranks/ranks.service";

@Controller("ranks")
export class RanksController {
	constructor(private ranksService: RanksService) {}

	@Post()
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN)
	create(@CurrentUser() user: AuthUserDto, @Body() dto: CreateRankDto): Promise<RankResponseDto> {
		return this.ranksService.create(user.tenantId, dto);
	}

	@Get()
	findAll(@CurrentUser() user: AuthUserDto, @Query("category") category?: string): Promise<RankResponseDto[]> {
		if (category) {
			return this.ranksService.findByCategory(user.tenantId, category);
		}
		return this.ranksService.findAll(user.tenantId);
	}

	@Get(":id")
	findOne(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<RankResponseDto> {
		return this.ranksService.findOne(user.tenantId, id);
	}

	@Patch(":id")
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN)
	update(
		@CurrentUser() user: AuthUserDto,
		@Param("id") id: string,
		@Body() dto: UpdateRankDto,
	): Promise<RankResponseDto> {
		return this.ranksService.update(user.tenantId, id, dto);
	}

	@Delete(":id")
	@Roles(SYSTEM_ROLES.IT_ADMIN, SYSTEM_ROLES.HQ_ADMIN)
	remove(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<{ message: string }> {
		return this.ranksService.remove(user.tenantId, id);
	}
}

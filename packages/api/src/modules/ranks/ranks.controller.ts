import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "#api/common/decorators/current-user.decorator";
import { Permissions } from "#api/common/decorators/permissions.decorator";
import { AuthUserDto } from "#api/common/dto/auth-user.dto";
import { CreateRankDto, SalaryStepDto } from "#api/modules/ranks/dto/create-rank.dto";
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
	@ApiOperation({
		summary: "Create rank with salary steps",
		description:
			"Create a new military rank. If salarySteps array is provided, those exact values will be used. Otherwise, steps will be auto-calculated from base to ceiling.",
	})
	@ApiResponse({ status: 201, description: "Rank created with salary steps", type: RankResponseDto })
	@ApiResponse({ status: 400, description: "Bad request - rank code already exists" })
	create(@CurrentUser() user: AuthUserDto, @Body() dto: CreateRankDto): Promise<RankResponseDto> {
		return this.ranksService.create(user.tenantId, dto);
	}

	@Get()
	@Permissions("ranks.read.rank")
	@ApiOperation({
		summary: "List all ranks",
		description: "Get all military ranks, optionally filtered by category and including salary steps",
	})
	@ApiQuery({ name: "category", required: false, description: "Filter by rank category" })
	@ApiQuery({
		name: "includeSteps",
		required: false,
		type: Boolean,
		description: "Include salary steps in response (default: false)",
	})
	@ApiResponse({ status: 200, description: "List of ranks", type: [RankResponseDto] })
	findAll(
		@CurrentUser() user: AuthUserDto,
		@Query("category") category?: string,
		@Query("includeSteps") includeSteps?: string,
	): Promise<RankResponseDto[]> {
		const includeStepsFlag = includeSteps === "true";
		if (category) {
			return this.ranksService.findByCategory(user.tenantId, category, includeStepsFlag);
		}
		return this.ranksService.findAll(user.tenantId, includeStepsFlag);
	}

	@Get(":id")
	@Permissions("ranks.read.rank")
	@ApiOperation({
		summary: "Get rank by ID",
		description: "Get a single military rank by ID with its salary steps",
	})
	@ApiResponse({ status: 200, description: "Rank details with salary steps", type: RankResponseDto })
	@ApiResponse({ status: 404, description: "Rank not found" })
	findOne(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<RankResponseDto> {
		return this.ranksService.findOne(user.tenantId, id, true);
	}

	@Patch(":id")
	@Permissions("ranks.update.rank")
	@ApiOperation({
		summary: "Update rank",
		description: "Update military rank details. If salarySteps array is provided, it will replace all existing steps.",
	})
	@ApiResponse({ status: 200, description: "Rank updated", type: RankResponseDto })
	@ApiResponse({ status: 404, description: "Rank not found" })
	update(
		@CurrentUser() user: AuthUserDto,
		@Param("id") id: string,
		@Body() dto: UpdateRankDto,
	): Promise<RankResponseDto> {
		return this.ranksService.update(user.tenantId, id, dto);
	}

	@Put(":id/salary-steps")
	@Permissions("ranks.update.rank")
	@ApiOperation({
		summary: "Update salary steps for a rank",
		description: "Replace all salary steps for a rank with the provided values",
	})
	@ApiBody({
		description: "Array of salary steps",
		type: [SalaryStepDto],
		examples: {
			constable: {
				summary: "Constable salary steps",
				value: [
					{ stepNumber: 0, salaryAmount: 6365 },
					{ stepNumber: 1, salaryAmount: 6591 },
					{ stepNumber: 2, salaryAmount: 6818 },
					{ stepNumber: 3, salaryAmount: 7054 },
					{ stepNumber: 4, salaryAmount: 7297 },
					{ stepNumber: 5, salaryAmount: 7549 },
					{ stepNumber: 6, salaryAmount: 7809 },
					{ stepNumber: 7, salaryAmount: 8079 },
					{ stepNumber: 8, salaryAmount: 8357 },
					{ stepNumber: 9, salaryAmount: 8646 },
				],
			},
		},
	})
	@ApiResponse({ status: 200, description: "Salary steps updated", type: RankResponseDto })
	@ApiResponse({ status: 404, description: "Rank not found" })
	updateSalarySteps(
		@CurrentUser() user: AuthUserDto,
		@Param("id") id: string,
		@Body() steps: SalaryStepDto[],
	): Promise<RankResponseDto> {
		return this.ranksService.updateSalarySteps(user.tenantId, id, steps);
	}

	@Delete(":id")
	@Permissions("ranks.delete.rank")
	@ApiOperation({
		summary: "Delete rank",
		description: "Delete a military rank and its salary steps. Cannot delete if employees are assigned.",
	})
	@ApiResponse({ status: 200, description: "Rank deleted" })
	@ApiResponse({ status: 400, description: "Cannot delete - employees are assigned to this rank" })
	@ApiResponse({ status: 404, description: "Rank not found" })
	remove(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<{ message: string }> {
		return this.ranksService.remove(user.tenantId, id);
	}
}

import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentTenant } from "#api/common/decorators/current-tenant.decorator";
import { Permissions } from "#api/common/decorators/permissions.decorator";
import { JwtAuthGuard } from "#api/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "#api/common/guards/permissions.guard";
import { CreateRewardMilestoneDto, RewardMilestoneResponseDto, UpdateRewardMilestoneDto } from "./dto";
import { RewardMilestonesService } from "./reward-milestones.service";

@ApiTags("reward-milestones")
@Controller("reward-milestones")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RewardMilestonesController {
	constructor(private readonly milestonesService: RewardMilestonesService) {}

	@Post()
	@Permissions("rewards.create.milestone")
	@ApiOperation({ summary: "Create a new reward milestone" })
	@ApiResponse({
		status: 201,
		description: "Milestone created successfully",
		type: RewardMilestoneResponseDto,
	})
	@ApiResponse({ status: 400, description: "Bad request - duplicate years of service or validation error" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	async create(@CurrentTenant() tenantId: string, @Body() dto: CreateRewardMilestoneDto) {
		return this.milestonesService.create(tenantId, dto);
	}

	@Get()
	@Permissions("rewards.read.milestone")
	@ApiOperation({ summary: "Get all reward milestones" })
	@ApiQuery({
		name: "includeInactive",
		required: false,
		type: Boolean,
		description: "Include inactive milestones",
	})
	@ApiResponse({
		status: 200,
		description: "List of reward milestones",
		type: [RewardMilestoneResponseDto],
	})
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	async findAll(@CurrentTenant() tenantId: string, @Query("includeInactive") includeInactive?: string) {
		const include = includeInactive === "true";
		return this.milestonesService.findAll(tenantId, include);
	}

	@Get("stats")
	@Permissions("rewards.read.milestone")
	@ApiOperation({ summary: "Get reward counts by milestone" })
	@ApiResponse({
		status: 200,
		description: "Milestone statistics",
	})
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	async getStats(@CurrentTenant() tenantId: string) {
		return this.milestonesService.getRewardsCountByMilestone(tenantId);
	}

	@Get(":id")
	@Permissions("rewards.read.milestone")
	@ApiOperation({ summary: "Get a reward milestone by ID" })
	@ApiParam({ name: "id", description: "Milestone ID" })
	@ApiResponse({
		status: 200,
		description: "Milestone details",
		type: RewardMilestoneResponseDto,
	})
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Milestone not found" })
	async findOne(@CurrentTenant() tenantId: string, @Param("id") id: string) {
		return this.milestonesService.findOne(tenantId, id);
	}

	@Patch(":id")
	@Permissions("rewards.update.milestone")
	@ApiOperation({ summary: "Update a reward milestone" })
	@ApiParam({ name: "id", description: "Milestone ID" })
	@ApiResponse({
		status: 200,
		description: "Milestone updated successfully",
		type: RewardMilestoneResponseDto,
	})
	@ApiResponse({ status: 400, description: "Bad request - duplicate years of service or validation error" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Milestone not found" })
	async update(@CurrentTenant() tenantId: string, @Param("id") id: string, @Body() dto: UpdateRewardMilestoneDto) {
		return this.milestonesService.update(tenantId, id, dto);
	}

	@Delete(":id")
	@Permissions("rewards.delete.milestone")
	@ApiOperation({ summary: "Delete or deactivate a reward milestone" })
	@ApiParam({ name: "id", description: "Milestone ID" })
	@ApiResponse({
		status: 200,
		description: "Milestone deleted or deactivated successfully",
		type: RewardMilestoneResponseDto,
	})
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Milestone not found" })
	async remove(@CurrentTenant() tenantId: string, @Param("id") id: string) {
		return this.milestonesService.remove(tenantId, id);
	}
}

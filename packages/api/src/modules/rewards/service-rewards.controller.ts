import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentTenant } from "#api/common/decorators/current-tenant.decorator";
import { CurrentUser } from "#api/common/decorators/current-user.decorator";
import { Permissions } from "#api/common/decorators/permissions.decorator";
import { AuthUserDto } from "#api/common/dto/auth-user.dto";
import { JwtAuthGuard } from "#api/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "#api/common/guards/permissions.guard";
import {
	ApproachingMilestoneDto,
	ApproveRewardDto,
	BatchCheckEligibilityDto,
	BatchCheckEligibilityResponseDto,
	CheckEligibilityResponseDto,
	CreateServiceRewardDto,
	EligibilityFilterDto,
	EligibilitySummaryDto,
	RecordAwardDto,
	RejectRewardDto,
	ServiceRewardFilterDto,
	ServiceRewardResponseDto,
	ServiceRewardTimelineResponseDto,
	SubmitForApprovalDto,
} from "./dto";
import { ServiceRewardsService } from "./service-rewards.service";
import { EligibilityCalculationService } from "./services/eligibility-calculation.service";

@ApiTags("rewards")
@Controller("rewards")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ServiceRewardsController {
	constructor(
		private readonly rewardsService: ServiceRewardsService,
		private readonly eligibilityService: EligibilityCalculationService,
	) {}

	@Get("eligibility")
	@Permissions("rewards.read.eligibility")
	@ApiOperation({ summary: "Get list of employees approaching milestones" })
	@ApiResponse({
		status: 200,
		description: "List of employees approaching milestones",
		type: [ApproachingMilestoneDto],
	})
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	async getApproachingMilestones(@CurrentTenant() tenantId: string, @Query() filters: EligibilityFilterDto) {
		return this.eligibilityService.getApproachingMilestones(
			tenantId,
			filters.monthsAhead ?? 6,
			filters.centerId,
			filters.milestoneId,
		);
	}

	@Get("eligibility/summary")
	@Permissions("rewards.read.eligibility")
	@ApiOperation({ summary: "Get eligibility dashboard summary" })
	@ApiResponse({
		status: 200,
		description: "Eligibility summary for dashboard",
		type: EligibilitySummaryDto,
	})
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	async getEligibilitySummary(@CurrentTenant() tenantId: string) {
		return this.eligibilityService.getEligibilitySummary(tenantId);
	}

	@Get("eligibility/check/:employeeId/:milestoneId")
	@Permissions("rewards.check.eligibility")
	@ApiOperation({ summary: "Check eligibility for a specific employee and milestone" })
	@ApiParam({ name: "employeeId", description: "Employee ID (database ID)" })
	@ApiParam({ name: "milestoneId", description: "Milestone ID" })
	@ApiResponse({
		status: 200,
		description: "Eligibility check result",
		type: CheckEligibilityResponseDto,
	})
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Employee or milestone not found" })
	async checkEligibility(
		@CurrentTenant() tenantId: string,
		@Param("employeeId") employeeId: string,
		@Param("milestoneId") milestoneId: string,
	) {
		return this.eligibilityService.checkEligibility(tenantId, employeeId, milestoneId);
	}

	@Post("eligibility/batch-check")
	@Permissions("rewards.check.eligibility")
	@ApiOperation({ summary: "Batch check eligibility for multiple employees" })
	@ApiResponse({
		status: 200,
		description: "Batch eligibility check results",
		type: BatchCheckEligibilityResponseDto,
	})
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Milestone not found" })
	async batchCheckEligibility(@CurrentTenant() tenantId: string, @Body() dto: BatchCheckEligibilityDto) {
		return this.eligibilityService.batchCheckEligibility(tenantId, dto.milestoneId, dto.centerId, dto.employeeIds);
	}

	@Get("reports/upcoming")
	@Permissions("rewards.read.report")
	@ApiOperation({ summary: "Get upcoming milestones report" })
	@ApiQuery({ name: "monthsAhead", required: false, type: Number, description: "Months to look ahead (default: 6)" })
	@ApiQuery({ name: "centerId", required: false, type: String, description: "Filter by center" })
	@ApiResponse({
		status: 200,
		description: "Upcoming milestones report",
		type: [ApproachingMilestoneDto],
	})
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	async getUpcomingReport(
		@CurrentTenant() tenantId: string,
		@Query("monthsAhead") monthsAhead?: string,
		@Query("centerId") centerId?: string,
	) {
		const months = monthsAhead ? parseInt(monthsAhead, 10) : 6;
		return this.rewardsService.getUpcomingMilestonesReport(tenantId, months, centerId);
	}

	@Get("reports/awarded")
	@Permissions("rewards.read.report")
	@ApiOperation({ summary: "Get awarded rewards report" })
	@ApiQuery({ name: "year", required: false, type: Number, description: "Year to filter by (default: current year)" })
	@ApiResponse({
		status: 200,
		description: "Awarded rewards report",
		type: [ServiceRewardResponseDto],
	})
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	async getAwardedReport(@CurrentTenant() tenantId: string, @Query("year") year?: string) {
		const targetYear = year ? parseInt(year, 10) : undefined;
		return this.rewardsService.getAwardedReport(tenantId, targetYear);
	}

	@Get("reports/by-milestone")
	@Permissions("rewards.read.report")
	@ApiOperation({ summary: "Get rewards grouped by milestone" })
	@ApiResponse({
		status: 200,
		description: "Rewards report grouped by milestone",
	})
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	async getReportByMilestone(@CurrentTenant() tenantId: string) {
		return this.rewardsService.getReportByMilestone(tenantId);
	}

	@Get()
	@Permissions("rewards.read.reward")
	@ApiOperation({ summary: "Get all service rewards with filters" })
	@ApiResponse({
		status: 200,
		description: "Paginated list of service rewards",
	})
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	async findAll(@CurrentTenant() tenantId: string, @Query() filters: ServiceRewardFilterDto) {
		return this.rewardsService.findAll(tenantId, filters);
	}

	@Get("employee/:employeeId")
	@Permissions("rewards.read.reward")
	@ApiOperation({ summary: "Get reward history for an employee" })
	@ApiParam({ name: "employeeId", description: "Employee ID (database ID)" })
	@ApiResponse({
		status: 200,
		description: "Employee reward history",
		type: [ServiceRewardResponseDto],
	})
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	async findByEmployee(@CurrentTenant() tenantId: string, @Param("employeeId") employeeId: string) {
		return this.rewardsService.findByEmployee(tenantId, employeeId);
	}

	@Get(":id")
	@Permissions("rewards.read.reward")
	@ApiOperation({ summary: "Get a service reward by ID" })
	@ApiParam({ name: "id", description: "Service reward ID" })
	@ApiResponse({
		status: 200,
		description: "Service reward details",
		type: ServiceRewardResponseDto,
	})
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Service reward not found" })
	async findOne(@CurrentTenant() tenantId: string, @Param("id") id: string) {
		return this.rewardsService.findOne(tenantId, id);
	}

	@Get(":id/timeline")
	@Permissions("rewards.read.reward")
	@ApiOperation({ summary: "Get timeline/audit trail for a service reward" })
	@ApiParam({ name: "id", description: "Service reward ID" })
	@ApiResponse({
		status: 200,
		description: "Service reward timeline",
		type: [ServiceRewardTimelineResponseDto],
	})
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Service reward not found" })
	async getTimeline(@CurrentTenant() tenantId: string, @Param("id") id: string) {
		return this.rewardsService.getTimeline(tenantId, id);
	}

	@Post()
	@Permissions("rewards.create.reward")
	@ApiOperation({ summary: "Create a new service reward record after eligibility check" })
	@ApiResponse({
		status: 201,
		description: "Service reward created successfully",
		type: ServiceRewardResponseDto,
	})
	@ApiResponse({ status: 400, description: "Bad request - duplicate record or validation error" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Employee or milestone not found" })
	async create(
		@CurrentTenant() tenantId: string,
		@CurrentUser() user: AuthUserDto,
		@Body() dto: CreateServiceRewardDto,
	) {
		return this.rewardsService.create(tenantId, user.id, dto);
	}

	@Patch(":id/submit-for-approval")
	@Permissions("rewards.submit.reward")
	@ApiOperation({ summary: "Submit an eligible reward for approval" })
	@ApiParam({ name: "id", description: "Service reward ID" })
	@ApiResponse({
		status: 200,
		description: "Reward submitted for approval",
		type: ServiceRewardResponseDto,
	})
	@ApiResponse({ status: 400, description: "Bad request - reward not in eligible status" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Service reward not found" })
	async submitForApproval(
		@CurrentTenant() tenantId: string,
		@CurrentUser() user: AuthUserDto,
		@Param("id") id: string,
		@Body() dto: SubmitForApprovalDto,
	) {
		return this.rewardsService.submitForApproval(tenantId, id, user.id, dto);
	}

	@Patch(":id/approve")
	@Permissions("rewards.approve.reward")
	@ApiOperation({ summary: "Approve a reward (HR Director)" })
	@ApiParam({ name: "id", description: "Service reward ID" })
	@ApiResponse({
		status: 200,
		description: "Reward approved",
		type: ServiceRewardResponseDto,
	})
	@ApiResponse({ status: 400, description: "Bad request - reward not awaiting approval" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Service reward not found" })
	async approve(
		@CurrentTenant() tenantId: string,
		@CurrentUser() user: AuthUserDto,
		@Param("id") id: string,
		@Body() dto: ApproveRewardDto,
	) {
		return this.rewardsService.approve(tenantId, id, user.id, dto);
	}

	@Patch(":id/reject")
	@Permissions("rewards.approve.reward")
	@ApiOperation({ summary: "Reject a reward (HR Director)" })
	@ApiParam({ name: "id", description: "Service reward ID" })
	@ApiResponse({
		status: 200,
		description: "Reward rejected",
		type: ServiceRewardResponseDto,
	})
	@ApiResponse({ status: 400, description: "Bad request - reward not awaiting approval" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Service reward not found" })
	async reject(
		@CurrentTenant() tenantId: string,
		@CurrentUser() user: AuthUserDto,
		@Param("id") id: string,
		@Body() dto: RejectRewardDto,
	) {
		return this.rewardsService.reject(tenantId, id, user.id, dto);
	}

	@Patch(":id/award")
	@Permissions("rewards.award.reward")
	@ApiOperation({ summary: "Record award details for an approved reward" })
	@ApiParam({ name: "id", description: "Service reward ID" })
	@ApiResponse({
		status: 200,
		description: "Award details recorded",
		type: ServiceRewardResponseDto,
	})
	@ApiResponse({ status: 400, description: "Bad request - reward not approved" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Service reward not found" })
	async recordAward(
		@CurrentTenant() tenantId: string,
		@CurrentUser() user: AuthUserDto,
		@Param("id") id: string,
		@Body() dto: RecordAwardDto,
	) {
		return this.rewardsService.recordAward(tenantId, id, user.id, dto);
	}

	@Patch(":id/recheck-eligibility")
	@Permissions("rewards.check.eligibility")
	@ApiOperation({ summary: "Re-check eligibility after investigation is resolved" })
	@ApiParam({ name: "id", description: "Service reward ID" })
	@ApiResponse({
		status: 200,
		description: "Eligibility rechecked",
		type: ServiceRewardResponseDto,
	})
	@ApiResponse({ status: 400, description: "Bad request - cannot recheck from current status" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Service reward not found" })
	async recheckEligibility(
		@CurrentTenant() tenantId: string,
		@CurrentUser() user: AuthUserDto,
		@Param("id") id: string,
	) {
		return this.rewardsService.recheckEligibility(tenantId, id, user.id);
	}
}

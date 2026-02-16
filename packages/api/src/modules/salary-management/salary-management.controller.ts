import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SalaryChangeType, SalaryEligibilityStatus } from "@prisma/client";
import { CurrentTenant } from "#api/common/decorators/current-tenant.decorator";
import { CurrentUser } from "#api/common/decorators/current-user.decorator";
import { Permissions } from "#api/common/decorators/permissions.decorator";
import { AuthUserDto } from "#api/common/dto/auth-user.dto";
import { JwtAuthGuard } from "#api/common/guards/jwt-auth.guard";
import { ManualStepJumpDto } from "#api/modules/salary-management/dto/manual-step-jump.dto";
import { MassRaiseDto, MassRaisePreviewDto } from "#api/modules/salary-management/dto/mass-raise.dto";
import {
	ProcessBatchIncrementDto,
	ProcessSingleIncrementDto,
	RejectEligibilityDto,
} from "#api/modules/salary-management/dto/process-step-increment.dto";
import {
	ProcessPromotionSalaryDto,
	PromotionSalaryPreviewDto,
} from "#api/modules/salary-management/dto/promotion-salary.dto";
import { SalaryEligibilityQueryDto } from "#api/modules/salary-management/dto/salary-eligibility-query.dto";
import {
	SalaryEligibilityListResponseDto,
	SalaryEligibilitySummaryDto,
	TodayEligibilityResponseDto,
} from "#api/modules/salary-management/dto/salary-eligibility-response.dto";
import {
	SalaryHistoryListResponseDto,
	SalaryHistoryQueryDto,
} from "#api/modules/salary-management/dto/salary-history-response.dto";
import {
	RankSalaryStepsResponseDto,
	SalaryProjectionResponseDto,
	StepDistributionReportDto,
} from "#api/modules/salary-management/dto/salary-projection.dto";
import { SalaryManagementService } from "#api/modules/salary-management/salary-management.service";

@ApiTags("salary-management")
@ApiBearerAuth("JWT-auth")
@UseGuards(JwtAuthGuard)
@Controller("salary")
export class SalaryManagementController {
	constructor(private readonly salaryManagementService: SalaryManagementService) {}

	@Get("eligibility")
	@Permissions("salary.read.eligibility")
	@ApiOperation({
		summary: "Get salary step eligibility list",
		description: "Retrieve a paginated list of employees eligible for salary step increments with filtering options",
	})
	@ApiQuery({ name: "rankId", required: false, description: "Filter by rank ID" })
	@ApiQuery({ name: "centerId", required: false, description: "Filter by center ID" })
	@ApiQuery({ name: "departmentId", required: false, description: "Filter by department ID" })
	@ApiQuery({
		name: "status",
		required: false,
		enum: SalaryEligibilityStatus,
		description: "Filter by eligibility status",
	})
	@ApiQuery({ name: "eligibilityDateFrom", required: false, description: "Filter by eligibility date from (ISO date)" })
	@ApiQuery({ name: "eligibilityDateTo", required: false, description: "Filter by eligibility date to (ISO date)" })
	@ApiQuery({ name: "currentStep", required: false, description: "Filter by current step number" })
	@ApiQuery({ name: "search", required: false, description: "Search by employee ID or name" })
	@ApiQuery({ name: "page", required: false, description: "Page number (default: 1)" })
	@ApiQuery({ name: "limit", required: false, description: "Items per page (default: 20)" })
	@ApiQuery({ name: "sortBy", required: false, description: "Sort by field (default: eligibilityDate)" })
	@ApiQuery({ name: "sortOrder", required: false, enum: ["asc", "desc"], description: "Sort order (default: asc)" })
	@ApiResponse({ status: 200, description: "List of salary eligibilities", type: SalaryEligibilityListResponseDto })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	getEligibilityList(
		@CurrentUser() user: AuthUserDto,
		@Query() query: SalaryEligibilityQueryDto,
	): Promise<SalaryEligibilityListResponseDto> {
		return this.salaryManagementService.getEligibilityList(user.tenantId, query, {
			centerId: user.centerId,
			effectiveAccessScope: user.effectiveAccessScope,
		}) as Promise<SalaryEligibilityListResponseDto>;
	}

	@Get("eligibility/today")
	@Permissions("salary.read.eligibility")
	@ApiOperation({
		summary: "Get employees eligible today",
		description: "Retrieve list of employees who become eligible for salary step increment today",
	})
	@ApiResponse({ status: 200, description: "List of employees eligible today", type: TodayEligibilityResponseDto })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	getTodayEligibility(@CurrentTenant() tenantId: string): Promise<TodayEligibilityResponseDto> {
		return this.salaryManagementService.getTodayEligibility(tenantId) as Promise<TodayEligibilityResponseDto>;
	}

	@Get("eligibility/summary")
	@Permissions("salary.read.eligibility")
	@ApiOperation({
		summary: "Get eligibility summary",
		description: "Get summary statistics for salary eligibilities including counts by status and rank",
	})
	@ApiResponse({ status: 200, description: "Eligibility summary statistics", type: SalaryEligibilitySummaryDto })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	getEligibilitySummary(@CurrentTenant() tenantId: string): Promise<SalaryEligibilitySummaryDto> {
		return this.salaryManagementService.getEligibilitySummary(tenantId);
	}

	@Post("process-increment")
	@Permissions("salary.approve.increment")
	@ApiOperation({
		summary: "Process single salary step increment",
		description: "Approve and process a single salary step increment for an eligible employee",
	})
	@ApiResponse({
		status: 201,
		description: "Salary increment processed successfully",
		schema: {
			type: "object",
			properties: {
				success: { type: "boolean" },
				employeeId: { type: "string" },
				employeeName: { type: "string" },
				fromStep: { type: "number" },
				toStep: { type: "number" },
				fromSalary: { type: "string" },
				toSalary: { type: "string" },
				historyId: { type: "string" },
			},
		},
	})
	@ApiResponse({ status: 400, description: "Bad request - invalid input" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Eligibility record not found" })
	processIncrement(
		@CurrentTenant() tenantId: string,
		@CurrentUser() user: AuthUserDto,
		@Body() dto: ProcessSingleIncrementDto,
	): Promise<{
		success: boolean;
		employeeId: string;
		employeeName: string;
		fromStep: number;
		toStep: number;
		fromSalary: string;
		toSalary: string;
		historyId?: string;
	}> {
		return this.salaryManagementService.processIncrement(
			tenantId,
			dto.eligibilityId,
			user.id,
			dto.effectiveDate,
			dto.notes,
		);
	}

	@Post("process-batch")
	@Permissions("salary.approve.increment")
	@ApiOperation({
		summary: "Process batch salary step increments",
		description: "Approve and process multiple salary step increments in a single batch operation",
	})
	@ApiResponse({
		status: 201,
		description: "Batch salary increments processed",
		schema: {
			type: "object",
			properties: {
				processed: { type: "number" },
				failed: { type: "number" },
				results: {
					type: "array",
					items: {
						type: "object",
						properties: {
							success: { type: "boolean" },
							employeeId: { type: "string" },
							employeeName: { type: "string" },
							fromStep: { type: "number" },
							toStep: { type: "number" },
							fromSalary: { type: "string" },
							toSalary: { type: "string" },
							historyId: { type: "string" },
							error: { type: "string" },
						},
					},
				},
			},
		},
	})
	@ApiResponse({ status: 400, description: "Bad request - invalid input" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	processBatchIncrement(
		@CurrentTenant() tenantId: string,
		@CurrentUser() user: AuthUserDto,
		@Body() dto: ProcessBatchIncrementDto,
	): Promise<{
		processed: number;
		failed: number;
		results: Array<{
			success: boolean;
			employeeId: string;
			employeeName: string;
			fromStep: number;
			toStep: number;
			fromSalary: string;
			toSalary: string;
			historyId?: string;
			error?: string;
		}>;
	}> {
		return this.salaryManagementService.processBatchIncrement(
			tenantId,
			dto.eligibilityIds,
			user.id,
			dto.effectiveDate,
			dto.notes,
		);
	}

	@Post("reject-eligibility")
	@Permissions("salary.approve.increment")
	@ApiOperation({
		summary: "Reject salary eligibility",
		description: "Reject a pending salary step eligibility with a reason",
	})
	@ApiResponse({ status: 201, description: "Eligibility rejected successfully" })
	@ApiResponse({ status: 400, description: "Bad request - invalid input" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Eligibility record not found" })
	rejectEligibility(
		@CurrentTenant() tenantId: string,
		@CurrentUser() user: AuthUserDto,
		@Body() dto: RejectEligibilityDto,
	): Promise<{ message: string }> {
		return this.salaryManagementService.rejectEligibility(tenantId, dto.eligibilityId, dto.rejectionReason, user.id);
	}

	@Post("manual-jump")
	@Permissions("salary.create.manualjump")
	@ApiOperation({
		summary: "Process manual step jump",
		description: "Apply a manual salary step jump authorized by Commissioner order",
	})
	@ApiResponse({
		status: 201,
		description: "Manual step jump processed successfully",
		schema: {
			type: "object",
			properties: {
				success: { type: "boolean" },
				employeeId: { type: "string" },
				employeeName: { type: "string" },
				fromStep: { type: "number" },
				toStep: { type: "number" },
				fromSalary: { type: "string" },
				toSalary: { type: "string" },
				historyId: { type: "string" },
			},
		},
	})
	@ApiResponse({ status: 400, description: "Bad request - invalid step or employee not eligible" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Employee not found" })
	processManualJump(
		@CurrentTenant() tenantId: string,
		@CurrentUser() user: AuthUserDto,
		@Body() dto: ManualStepJumpDto,
	): Promise<{
		success: boolean;
		employeeId: string;
		employeeName: string;
		fromStep: number;
		toStep: number;
		fromSalary: string;
		toSalary: string;
		historyId?: string;
	}> {
		return this.salaryManagementService.processManualJump(
			tenantId,
			dto.employeeId,
			dto.toStep,
			dto.orderReference,
			dto.reason,
			dto.effectiveDate,
			user.id,
			dto.documentPath,
			dto.notes,
		);
	}

	@Post("mass-raise/preview")
	@Permissions("salary.create.massraise")
	@ApiOperation({
		summary: "Preview mass raise",
		description: "Preview the effect of a mass raise before applying it",
	})
	@ApiResponse({
		status: 201,
		description: "Mass raise preview",
		schema: {
			type: "object",
			properties: {
				totalEmployees: { type: "number" },
				affectedEmployees: { type: "number" },
				skippedEmployees: { type: "number" },
				totalSalaryIncrease: { type: "string" },
				preview: {
					type: "array",
					items: {
						type: "object",
						properties: {
							employeeId: { type: "string" },
							employeeName: { type: "string" },
							currentStep: { type: "number" },
							newStep: { type: "number" },
							currentSalary: { type: "string" },
							newSalary: { type: "string" },
							willBeSkipped: { type: "boolean" },
							skipReason: { type: "string" },
						},
					},
				},
			},
		},
	})
	@ApiResponse({ status: 400, description: "Bad request - invalid input" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Rank not found" })
	getMassRaisePreview(
		@CurrentTenant() tenantId: string,
		@Body() dto: MassRaisePreviewDto,
	): Promise<{
		totalEmployees: number;
		affectedEmployees: number;
		skippedEmployees: number;
		totalSalaryIncrease: string;
		preview: Array<{
			employeeId: string;
			employeeName: string;
			currentStep: number;
			newStep: number;
			currentSalary: string;
			newSalary: string;
			willBeSkipped: boolean;
			skipReason?: string;
		}>;
	}> {
		return this.salaryManagementService.getMassRaisePreview(tenantId, dto.rankId, dto.raiseType, {
			incrementSteps: dto.incrementSteps,
			targetStep: dto.targetStep,
			centerId: dto.centerId,
		});
	}

	@Post("mass-raise")
	@Permissions("salary.create.massraise")
	@ApiOperation({
		summary: "Process mass raise",
		description: "Apply a mass salary raise for all employees of a specific rank",
	})
	@ApiResponse({
		status: 201,
		description: "Mass raise processed successfully",
		schema: {
			type: "object",
			properties: {
				totalProcessed: { type: "number" },
				successCount: { type: "number" },
				failureCount: { type: "number" },
				skippedCount: { type: "number" },
				results: {
					type: "array",
					items: {
						type: "object",
						properties: {
							success: { type: "boolean" },
							employeeId: { type: "string" },
							employeeName: { type: "string" },
							fromStep: { type: "number" },
							toStep: { type: "number" },
							fromSalary: { type: "string" },
							toSalary: { type: "string" },
							historyId: { type: "string" },
							error: { type: "string" },
						},
					},
				},
			},
		},
	})
	@ApiResponse({ status: 400, description: "Bad request - invalid input" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Rank not found" })
	processMassRaise(
		@CurrentTenant() tenantId: string,
		@CurrentUser() user: AuthUserDto,
		@Body() dto: MassRaiseDto,
	): Promise<{
		totalProcessed: number;
		successCount: number;
		failureCount: number;
		skippedCount: number;
		results: Array<{
			success: boolean;
			employeeId: string;
			employeeName: string;
			fromStep: number;
			toStep: number;
			fromSalary: string;
			toSalary: string;
			historyId?: string;
			error?: string;
		}>;
	}> {
		return this.salaryManagementService.processMassRaise(
			tenantId,
			dto.rankId,
			dto.raiseType,
			{
				incrementSteps: dto.incrementSteps,
				targetStep: dto.targetStep,
				centerId: dto.centerId,
			},
			dto.orderReference,
			dto.reason,
			dto.effectiveDate,
			user.id,
			dto.documentPath,
			dto.notes,
		);
	}

	@Get("employee/:id/history")
	@Permissions("salary.read.history")
	@ApiOperation({
		summary: "Get employee salary history",
		description: "Retrieve the complete salary change history for a specific employee",
	})
	@ApiParam({ name: "id", description: "Employee UUID" })
	@ApiQuery({
		name: "changeType",
		required: false,
		enum: SalaryChangeType,
		description: "Filter by change type",
	})
	@ApiQuery({ name: "dateFrom", required: false, description: "Filter by date range start (ISO date)" })
	@ApiQuery({ name: "dateTo", required: false, description: "Filter by date range end (ISO date)" })
	@ApiQuery({ name: "page", required: false, description: "Page number (default: 1)" })
	@ApiQuery({ name: "limit", required: false, description: "Items per page (default: 20)" })
	@ApiResponse({ status: 200, description: "Employee salary history", type: SalaryHistoryListResponseDto })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Employee not found" })
	getEmployeeSalaryHistory(
		@CurrentTenant() tenantId: string,
		@Param("id") employeeId: string,
		@Query() query: SalaryHistoryQueryDto,
	): Promise<SalaryHistoryListResponseDto> {
		return this.salaryManagementService.getEmployeeSalaryHistory(tenantId, employeeId, {
			changeType: query.changeType,
			dateFrom: query.dateFrom,
			dateTo: query.dateTo,
			page: query.page,
			limit: query.limit,
		}) as Promise<SalaryHistoryListResponseDto>;
	}

	@Get("employee/:id/projection")
	@Permissions("salary.read.projection")
	@ApiOperation({
		summary: "Get employee salary projection",
		description: "Calculate and retrieve future salary projections for a military employee",
	})
	@ApiParam({ name: "id", description: "Employee UUID" })
	@ApiResponse({ status: 200, description: "Employee salary projection", type: SalaryProjectionResponseDto })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Employee not found or not a military employee" })
	getEmployeeSalaryProjection(
		@CurrentTenant() tenantId: string,
		@Param("id") employeeId: string,
	): Promise<SalaryProjectionResponseDto> {
		return this.salaryManagementService.getEmployeeSalaryProjection(
			tenantId,
			employeeId,
		) as Promise<SalaryProjectionResponseDto>;
	}

	@Get("reports/step-distribution")
	@Permissions("salary.read.reports")
	@ApiOperation({
		summary: "Get step distribution report",
		description: "Generate a report showing distribution of employees across salary steps by rank",
	})
	@ApiQuery({ name: "centerId", required: false, description: "Filter by center ID" })
	@ApiResponse({ status: 200, description: "Step distribution report", type: StepDistributionReportDto })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	getStepDistributionReport(
		@CurrentUser() user: AuthUserDto,
		@Query("centerId") centerId?: string,
	): Promise<StepDistributionReportDto> {
		return this.salaryManagementService.getStepDistributionReport(user.tenantId, {
			centerId: user.centerId,
			effectiveAccessScope: user.effectiveAccessScope,
		}, centerId) as Promise<StepDistributionReportDto>;
	}

	@Get("ranks/:rankId/steps")
	@Permissions("salary.read.ranksteps")
	@ApiOperation({
		summary: "Get salary steps for a rank",
		description: "Retrieve all salary step information for a specific military rank",
	})
	@ApiParam({ name: "rankId", description: "Rank UUID" })
	@ApiResponse({ status: 200, description: "Rank salary steps", type: RankSalaryStepsResponseDto })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Rank not found" })
	getRankSalarySteps(
		@CurrentTenant() tenantId: string,
		@Param("rankId") rankId: string,
	): Promise<RankSalaryStepsResponseDto> {
		return this.salaryManagementService.getRankSalarySteps(tenantId, rankId) as Promise<RankSalaryStepsResponseDto>;
	}

	@Post("promotion/preview")
	@Permissions("salary.read.promotion")
	@ApiOperation({
		summary: "Preview promotion salary",
		description: "Calculate and preview the new salary step and amount after promotion to a new rank",
	})
	@ApiResponse({
		status: 201,
		description: "Promotion salary preview",
		schema: {
			type: "object",
			properties: {
				employeeId: { type: "string" },
				employeeName: { type: "string" },
				currentRank: {
					type: "object",
					properties: {
						id: { type: "string" },
						code: { type: "string" },
						name: { type: "string" },
						nameAm: { type: "string" },
					},
				},
				newRank: {
					type: "object",
					properties: {
						id: { type: "string" },
						code: { type: "string" },
						name: { type: "string" },
						nameAm: { type: "string" },
					},
				},
				currentStep: { type: "number" },
				currentSalary: { type: "string" },
				newStep: { type: "number" },
				newSalary: { type: "string" },
				salaryIncrease: { type: "string" },
				percentageIncrease: { type: "string" },
				calculationExplanation: { type: "string" },
			},
		},
	})
	@ApiResponse({ status: 400, description: "Bad request - invalid input" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Employee or rank not found" })
	getPromotionSalaryPreview(
		@CurrentTenant() tenantId: string,
		@Body() dto: PromotionSalaryPreviewDto,
	): Promise<{
		employeeId: string;
		employeeName: string;
		currentRank: { id: string; code: string; name: string; nameAm: string | null };
		newRank: { id: string; code: string; name: string; nameAm: string | null };
		currentStep: number;
		currentSalary: string;
		newStep: number;
		newSalary: string;
		salaryIncrease: string;
		percentageIncrease: string;
		calculationExplanation: string;
	}> {
		return this.salaryManagementService.getPromotionSalaryPreview(tenantId, dto.employeeId, dto.newRankId);
	}

	@Post("promotion/process")
	@Permissions("salary.create.promotion")
	@ApiOperation({
		summary: "Process promotion salary change",
		description: "Process the salary change associated with an employee promotion",
	})
	@ApiResponse({
		status: 201,
		description: "Promotion salary processed successfully",
		schema: {
			type: "object",
			properties: {
				success: { type: "boolean" },
				employeeId: { type: "string" },
				employeeName: { type: "string" },
				fromStep: { type: "number" },
				toStep: { type: "number" },
				fromSalary: { type: "string" },
				toSalary: { type: "string" },
				historyId: { type: "string" },
			},
		},
	})
	@ApiResponse({ status: 400, description: "Bad request - invalid input" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Employee or rank not found" })
	processPromotion(
		@CurrentTenant() tenantId: string,
		@CurrentUser() user: AuthUserDto,
		@Body() dto: ProcessPromotionSalaryDto,
	): Promise<{
		success: boolean;
		employeeId: string;
		employeeName: string;
		fromStep: number;
		toStep: number;
		fromSalary: string;
		toSalary: string;
		historyId?: string;
	}> {
		return this.salaryManagementService.processPromotion(
			tenantId,
			dto.employeeId,
			dto.newRankId,
			dto.effectiveDate,
			user.id,
			dto.orderReference,
			dto.reason,
			dto.documentPath,
		);
	}

	@Post("eligibility/check-daily")
	@Permissions("salary.manage.eligibility")
	@ApiOperation({
		summary: "Trigger daily eligibility check",
		description: "Manually trigger the daily eligibility check to find newly eligible employees",
	})
	@ApiResponse({
		status: 201,
		description: "Daily eligibility check completed",
		schema: {
			type: "object",
			properties: {
				newlyEligible: { type: "number" },
			},
		},
	})
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	triggerDailyEligibilityCheck(@CurrentTenant() tenantId: string): Promise<{ newlyEligible: number }> {
		return this.salaryManagementService.triggerDailyEligibilityCheck(tenantId);
	}
}

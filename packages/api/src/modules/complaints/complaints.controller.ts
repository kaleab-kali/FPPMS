import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from "@nestjs/swagger";
import { JwtAuthGuard } from "#api/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "#api/common/guards/permissions.guard";
import { Permissions } from "#api/common/decorators/permissions.decorator";
import { CurrentTenant } from "#api/common/decorators/current-tenant.decorator";
import { CurrentUser } from "#api/common/decorators/current-user.decorator";
import { ComplaintsService } from "./complaints.service";
import {
	CreateComplaintDto,
	RecordNotificationDto,
	RecordRebuttalDto,
	RecordFindingDto,
	RecordDecisionDto,
	AssignCommitteeDto,
	ForwardToHqDto,
	RecordHqDecisionDto,
	SubmitAppealDto,
	RecordAppealDecisionDto,
	CloseComplaintDto,
	ComplaintFilterDto,
	ComplaintResponseDto,
	ComplaintListResponseDto,
	ComplaintTimelineResponseDto,
	ComplaintAppealResponseDto,
} from "./dto";

@ApiTags("complaints")
@Controller("complaints")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ComplaintsController {
	constructor(private readonly complaintsService: ComplaintsService) {}

	@Post()
	@Permissions("complaints:create")
	@ApiOperation({ summary: "Register a new complaint" })
	@ApiResponse({ status: 201, description: "Complaint registered successfully", type: ComplaintResponseDto })
	@ApiResponse({ status: 400, description: "Bad request - validation error" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Accused employee not found" })
	async create(
		@CurrentTenant() tenantId: string,
		@CurrentUser() user: { id: string; centerId: string },
		@Body() dto: CreateComplaintDto,
	) {
		return this.complaintsService.create(tenantId, user.centerId, user.id, dto);
	}

	@Get()
	@Permissions("complaints:read")
	@ApiOperation({ summary: "Get all complaints with optional filters" })
	@ApiResponse({ status: 200, description: "List of complaints", type: [ComplaintListResponseDto] })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	async findAll(@CurrentTenant() tenantId: string, @Query() filters: ComplaintFilterDto) {
		return this.complaintsService.findAll(tenantId, filters);
	}

	@Get(":id")
	@Permissions("complaints:read")
	@ApiOperation({ summary: "Get complaint by ID with full details" })
	@ApiParam({ name: "id", description: "Complaint ID" })
	@ApiResponse({ status: 200, description: "Complaint details", type: ComplaintResponseDto })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Complaint not found" })
	async findOne(@CurrentTenant() tenantId: string, @Param("id") id: string) {
		return this.complaintsService.findOne(tenantId, id);
	}

	@Get(":id/timeline")
	@Permissions("complaints:read")
	@ApiOperation({ summary: "Get complaint timeline/audit trail" })
	@ApiParam({ name: "id", description: "Complaint ID" })
	@ApiResponse({ status: 200, description: "Complaint timeline", type: [ComplaintTimelineResponseDto] })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Complaint not found" })
	async getTimeline(@CurrentTenant() tenantId: string, @Param("id") id: string) {
		return this.complaintsService.getTimeline(tenantId, id);
	}

	@Patch(":id/notification")
	@Permissions("complaints:update")
	@ApiOperation({ summary: "Record notification sent to accused (Article 30)" })
	@ApiParam({ name: "id", description: "Complaint ID" })
	@ApiResponse({ status: 200, description: "Notification recorded", type: ComplaintResponseDto })
	@ApiResponse({ status: 400, description: "Bad request - invalid status or article type" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Complaint not found" })
	async recordNotification(
		@CurrentTenant() tenantId: string,
		@CurrentUser() user: { id: string },
		@Param("id") id: string,
		@Body() dto: RecordNotificationDto,
	) {
		return this.complaintsService.recordNotification(tenantId, id, user.id, dto);
	}

	@Patch(":id/rebuttal")
	@Permissions("complaints:update")
	@ApiOperation({ summary: "Record rebuttal received from accused (Article 30)" })
	@ApiParam({ name: "id", description: "Complaint ID" })
	@ApiResponse({ status: 200, description: "Rebuttal recorded", type: ComplaintResponseDto })
	@ApiResponse({ status: 400, description: "Bad request - invalid status or article type" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Complaint not found" })
	async recordRebuttal(
		@CurrentTenant() tenantId: string,
		@CurrentUser() user: { id: string },
		@Param("id") id: string,
		@Body() dto: RecordRebuttalDto,
	) {
		return this.complaintsService.recordRebuttal(tenantId, id, user.id, dto);
	}

	@Patch(":id/rebuttal-deadline-passed")
	@Permissions("complaints:update")
	@ApiOperation({ summary: "Mark rebuttal deadline as passed - automatic guilty (Article 30)" })
	@ApiParam({ name: "id", description: "Complaint ID" })
	@ApiResponse({ status: 200, description: "Deadline marked as passed", type: ComplaintResponseDto })
	@ApiResponse({ status: 400, description: "Bad request - invalid status or article type" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Complaint not found" })
	async markRebuttalDeadlinePassed(
		@CurrentTenant() tenantId: string,
		@CurrentUser() user: { id: string },
		@Param("id") id: string,
	) {
		return this.complaintsService.markRebuttalDeadlinePassed(tenantId, id, user.id);
	}

	@Patch(":id/finding")
	@Permissions("complaints:update")
	@ApiOperation({ summary: "Record finding/verdict for the complaint" })
	@ApiParam({ name: "id", description: "Complaint ID" })
	@ApiResponse({ status: 200, description: "Finding recorded", type: ComplaintResponseDto })
	@ApiResponse({ status: 400, description: "Bad request - invalid status" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Complaint not found" })
	async recordFinding(
		@CurrentTenant() tenantId: string,
		@CurrentUser() user: { id: string },
		@Param("id") id: string,
		@Body() dto: RecordFindingDto,
	) {
		return this.complaintsService.recordFinding(tenantId, id, user.id, dto);
	}

	@Patch(":id/decision")
	@Permissions("complaints:update")
	@ApiOperation({ summary: "Record punishment decision by superior (Article 30)" })
	@ApiParam({ name: "id", description: "Complaint ID" })
	@ApiResponse({ status: 200, description: "Decision recorded", type: ComplaintResponseDto })
	@ApiResponse({ status: 400, description: "Bad request - invalid status or article type" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Complaint not found" })
	async recordDecision(
		@CurrentTenant() tenantId: string,
		@CurrentUser() user: { id: string },
		@Param("id") id: string,
		@Body() dto: RecordDecisionDto,
	) {
		return this.complaintsService.recordDecision(tenantId, id, user.id, dto);
	}

	@Patch(":id/assign-committee")
	@Permissions("complaints:update")
	@ApiOperation({ summary: "Assign complaint to discipline committee (Article 31)" })
	@ApiParam({ name: "id", description: "Complaint ID" })
	@ApiResponse({ status: 200, description: "Committee assigned", type: ComplaintResponseDto })
	@ApiResponse({ status: 400, description: "Bad request - invalid article type" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Complaint or committee not found" })
	async assignCommittee(
		@CurrentTenant() tenantId: string,
		@CurrentUser() user: { id: string },
		@Param("id") id: string,
		@Body() dto: AssignCommitteeDto,
	) {
		return this.complaintsService.assignCommittee(tenantId, id, user.id, dto);
	}

	@Patch(":id/forward-to-hq")
	@Permissions("complaints:update")
	@ApiOperation({ summary: "Forward complaint to HQ committee (Article 31)" })
	@ApiParam({ name: "id", description: "Complaint ID" })
	@ApiResponse({ status: 200, description: "Forwarded to HQ", type: ComplaintResponseDto })
	@ApiResponse({ status: 400, description: "Bad request - invalid status or article type" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Complaint or HQ committee not found" })
	async forwardToHq(
		@CurrentTenant() tenantId: string,
		@CurrentUser() user: { id: string },
		@Param("id") id: string,
		@Body() dto: ForwardToHqDto,
	) {
		return this.complaintsService.forwardToHq(tenantId, id, user.id, dto);
	}

	@Patch(":id/hq-decision")
	@Permissions("complaints:update")
	@ApiOperation({ summary: "Record HQ committee decision (Article 31)" })
	@ApiParam({ name: "id", description: "Complaint ID" })
	@ApiResponse({ status: 200, description: "HQ decision recorded", type: ComplaintResponseDto })
	@ApiResponse({ status: 400, description: "Bad request - invalid status or article type" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Complaint not found" })
	async recordHqDecision(
		@CurrentTenant() tenantId: string,
		@CurrentUser() user: { id: string },
		@Param("id") id: string,
		@Body() dto: RecordHqDecisionDto,
	) {
		return this.complaintsService.recordHqDecision(tenantId, id, user.id, dto);
	}

	@Post(":id/appeals")
	@Permissions("complaints:update")
	@ApiOperation({ summary: "Submit an appeal against the decision" })
	@ApiParam({ name: "id", description: "Complaint ID" })
	@ApiResponse({ status: 201, description: "Appeal submitted", type: ComplaintAppealResponseDto })
	@ApiResponse({ status: 400, description: "Bad request - invalid status or duplicate appeal level" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Complaint not found" })
	async submitAppeal(
		@CurrentTenant() tenantId: string,
		@CurrentUser() user: { id: string },
		@Param("id") id: string,
		@Body() dto: SubmitAppealDto,
	) {
		return this.complaintsService.submitAppeal(tenantId, id, user.id, dto);
	}

	@Patch(":id/appeals/:appealId")
	@Permissions("complaints:update")
	@ApiOperation({ summary: "Record decision on an appeal" })
	@ApiParam({ name: "id", description: "Complaint ID" })
	@ApiParam({ name: "appealId", description: "Appeal ID" })
	@ApiResponse({ status: 200, description: "Appeal decision recorded", type: ComplaintAppealResponseDto })
	@ApiResponse({ status: 400, description: "Bad request - validation error" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Complaint or appeal not found" })
	async recordAppealDecision(
		@CurrentTenant() tenantId: string,
		@CurrentUser() user: { id: string },
		@Param("id") id: string,
		@Param("appealId") appealId: string,
		@Body() dto: RecordAppealDecisionDto,
	) {
		return this.complaintsService.recordAppealDecision(tenantId, id, appealId, user.id, dto);
	}

	@Patch(":id/close")
	@Permissions("complaints:update")
	@ApiOperation({ summary: "Close the complaint" })
	@ApiParam({ name: "id", description: "Complaint ID" })
	@ApiResponse({ status: 200, description: "Complaint closed", type: ComplaintResponseDto })
	@ApiResponse({ status: 400, description: "Bad request - invalid status for closing" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	@ApiResponse({ status: 404, description: "Complaint not found" })
	async closeComplaint(
		@CurrentTenant() tenantId: string,
		@CurrentUser() user: { id: string },
		@Param("id") id: string,
		@Body() dto: CloseComplaintDto,
	) {
		return this.complaintsService.closeComplaint(tenantId, id, user.id, dto);
	}

	@Get("employee/:employeeId")
	@Permissions("complaints:read")
	@ApiOperation({ summary: "Get all complaints for an employee" })
	@ApiParam({ name: "employeeId", description: "Employee ID" })
	@ApiResponse({ status: 200, description: "Employee complaint history", type: [ComplaintListResponseDto] })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
	async getEmployeeComplaintHistory(@CurrentTenant() tenantId: string, @Param("employeeId") employeeId: string) {
		return this.complaintsService.getEmployeeComplaintHistory(tenantId, employeeId);
	}
}

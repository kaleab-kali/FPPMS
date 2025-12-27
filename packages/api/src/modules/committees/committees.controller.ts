import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentTenant } from "#api/common/decorators/current-tenant.decorator";
import { CurrentUser } from "#api/common/decorators/current-user.decorator";
import { Permissions } from "#api/common/decorators/permissions.decorator";
import { CommitteesService } from "./committees.service";
import {
	CommitteeFilterDto,
	CommitteeHistoryResponseDto,
	CommitteeMemberResponseDto,
	CommitteeResponseDto,
	CreateCommitteeDto,
	DissolveCommitteeDto,
	ReactivateCommitteeDto,
	SuspendCommitteeDto,
	UpdateCommitteeDto,
} from "./dto/committee.dto";
import {
	AddCommitteeMemberDto,
	BulkAddMembersDto,
	RemoveCommitteeMemberDto,
	UpdateCommitteeMemberDto,
} from "./dto/committee-member.dto";
import { CommitteeTypeResponseDto, CreateCommitteeTypeDto, UpdateCommitteeTypeDto } from "./dto/committee-type.dto";

@ApiTags("committees")
@ApiBearerAuth("JWT-auth")
@Controller("committees")
export class CommitteesController {
	constructor(private readonly committeesService: CommitteesService) {}

	// ==================== COMMITTEE TYPE ENDPOINTS ====================

	@Post("types")
	@Permissions("committees.create.type")
	@ApiOperation({ summary: "Create committee type", description: "Create a new committee type definition" })
	@ApiResponse({ status: 201, description: "Committee type created", type: CommitteeTypeResponseDto })
	@ApiResponse({ status: 400, description: "Invalid input or duplicate code" })
	createCommitteeType(
		@CurrentTenant() tenantId: string,
		@CurrentUser("id") userId: string,
		@Body() dto: CreateCommitteeTypeDto,
	) {
		return this.committeesService.createCommitteeType(tenantId, dto, userId);
	}

	@Get("types")
	@Permissions("committees.read.type")
	@ApiOperation({ summary: "List committee types", description: "Get all committee types for current tenant" })
	@ApiQuery({ name: "includeInactive", required: false, description: "Include inactive committee types" })
	@ApiResponse({ status: 200, description: "List of committee types", type: [CommitteeTypeResponseDto] })
	findAllCommitteeTypes(@CurrentTenant() tenantId: string, @Query("includeInactive") includeInactive?: string) {
		return this.committeesService.findAllCommitteeTypes(tenantId, includeInactive === "true");
	}

	@Get("types/:id")
	@Permissions("committees.read.type")
	@ApiOperation({ summary: "Get committee type by ID", description: "Get a single committee type by ID" })
	@ApiResponse({ status: 200, description: "Committee type details", type: CommitteeTypeResponseDto })
	@ApiResponse({ status: 404, description: "Committee type not found" })
	findOneCommitteeType(@CurrentTenant() tenantId: string, @Param("id") id: string) {
		return this.committeesService.findOneCommitteeType(tenantId, id);
	}

	@Patch("types/:id")
	@Permissions("committees.update.type")
	@ApiOperation({ summary: "Update committee type", description: "Update committee type details" })
	@ApiResponse({ status: 200, description: "Committee type updated", type: CommitteeTypeResponseDto })
	@ApiResponse({ status: 404, description: "Committee type not found" })
	updateCommitteeType(@CurrentTenant() tenantId: string, @Param("id") id: string, @Body() dto: UpdateCommitteeTypeDto) {
		return this.committeesService.updateCommitteeType(tenantId, id, dto);
	}

	@Delete("types/:id")
	@Permissions("committees.delete.type")
	@ApiOperation({ summary: "Deactivate committee type", description: "Deactivate a committee type (soft delete)" })
	@ApiResponse({ status: 200, description: "Committee type deactivated", type: CommitteeTypeResponseDto })
	@ApiResponse({ status: 404, description: "Committee type not found" })
	@ApiResponse({ status: 400, description: "Cannot deactivate - active committees exist" })
	deactivateCommitteeType(@CurrentTenant() tenantId: string, @Param("id") id: string) {
		return this.committeesService.deactivateCommitteeType(tenantId, id);
	}

	// ==================== COMMITTEE ENDPOINTS ====================

	@Post()
	@Permissions("committees.create.committee")
	@ApiOperation({ summary: "Create committee", description: "Create a new committee instance" })
	@ApiResponse({ status: 201, description: "Committee created", type: CommitteeResponseDto })
	@ApiResponse({ status: 400, description: "Invalid input or duplicate code" })
	createCommittee(
		@CurrentTenant() tenantId: string,
		@CurrentUser("id") userId: string,
		@Body() dto: CreateCommitteeDto,
	) {
		return this.committeesService.createCommittee(tenantId, dto, userId);
	}

	@Get()
	@Permissions("committees.read.committee")
	@ApiOperation({ summary: "List committees", description: "Get all committees with optional filters" })
	@ApiQuery({ name: "committeeTypeId", required: false, description: "Filter by committee type ID" })
	@ApiQuery({ name: "centerId", required: false, description: "Filter by center ID" })
	@ApiQuery({ name: "status", required: false, description: "Filter by status (ACTIVE, SUSPENDED, DISSOLVED)" })
	@ApiQuery({ name: "search", required: false, description: "Search by name or code" })
	@ApiResponse({ status: 200, description: "List of committees", type: [CommitteeResponseDto] })
	findAllCommittees(@CurrentTenant() tenantId: string, @Query() filter: CommitteeFilterDto) {
		return this.committeesService.findAllCommittees(tenantId, filter);
	}

	@Get(":id")
	@Permissions("committees.read.committee")
	@ApiOperation({ summary: "Get committee by ID", description: "Get a single committee by ID with optional members" })
	@ApiQuery({ name: "includeMembers", required: false, description: "Include committee members in response" })
	@ApiResponse({ status: 200, description: "Committee details", type: CommitteeResponseDto })
	@ApiResponse({ status: 404, description: "Committee not found" })
	findOneCommittee(
		@CurrentTenant() tenantId: string,
		@Param("id") id: string,
		@Query("includeMembers") includeMembers?: string,
	) {
		return this.committeesService.findOneCommittee(tenantId, id, includeMembers === "true");
	}

	@Patch(":id")
	@Permissions("committees.update.committee")
	@ApiOperation({ summary: "Update committee", description: "Update committee details" })
	@ApiResponse({ status: 200, description: "Committee updated", type: CommitteeResponseDto })
	@ApiResponse({ status: 404, description: "Committee not found" })
	updateCommittee(
		@CurrentTenant() tenantId: string,
		@CurrentUser("id") userId: string,
		@Param("id") id: string,
		@Body() dto: UpdateCommitteeDto,
	) {
		return this.committeesService.updateCommittee(tenantId, id, dto, userId);
	}

	@Patch(":id/suspend")
	@Permissions("committees.manage.committee")
	@ApiOperation({ summary: "Suspend committee", description: "Temporarily suspend a committee" })
	@ApiResponse({ status: 200, description: "Committee suspended", type: CommitteeResponseDto })
	@ApiResponse({ status: 404, description: "Committee not found" })
	@ApiResponse({ status: 400, description: "Committee is already suspended or dissolved" })
	suspendCommittee(
		@CurrentTenant() tenantId: string,
		@CurrentUser("id") userId: string,
		@Param("id") id: string,
		@Body() dto: SuspendCommitteeDto,
	) {
		return this.committeesService.suspendCommittee(tenantId, id, dto.reason, userId);
	}

	@Patch(":id/reactivate")
	@Permissions("committees.manage.committee")
	@ApiOperation({ summary: "Reactivate committee", description: "Reactivate a suspended committee" })
	@ApiResponse({ status: 200, description: "Committee reactivated", type: CommitteeResponseDto })
	@ApiResponse({ status: 404, description: "Committee not found" })
	@ApiResponse({ status: 400, description: "Committee is not suspended" })
	reactivateCommittee(
		@CurrentTenant() tenantId: string,
		@CurrentUser("id") userId: string,
		@Param("id") id: string,
		@Body() dto: ReactivateCommitteeDto,
	) {
		return this.committeesService.reactivateCommittee(tenantId, id, dto.reason, userId);
	}

	@Patch(":id/dissolve")
	@Permissions("committees.manage.committee")
	@ApiOperation({ summary: "Dissolve committee", description: "Permanently dissolve a committee" })
	@ApiResponse({ status: 200, description: "Committee dissolved", type: CommitteeResponseDto })
	@ApiResponse({ status: 404, description: "Committee not found" })
	@ApiResponse({ status: 400, description: "Committee is already dissolved or is permanent" })
	dissolveCommittee(
		@CurrentTenant() tenantId: string,
		@CurrentUser("id") userId: string,
		@Param("id") id: string,
		@Body() dto: DissolveCommitteeDto,
	) {
		return this.committeesService.dissolveCommittee(tenantId, id, dto, userId);
	}

	@Get(":id/history")
	@Permissions("committees.read.committee")
	@ApiOperation({ summary: "Get committee history", description: "Get audit trail for a committee" })
	@ApiResponse({ status: 200, description: "Committee history", type: [CommitteeHistoryResponseDto] })
	@ApiResponse({ status: 404, description: "Committee not found" })
	getCommitteeHistory(@CurrentTenant() tenantId: string, @Param("id") id: string) {
		return this.committeesService.getCommitteeHistory(tenantId, id);
	}

	// ==================== COMMITTEE MEMBER ENDPOINTS ====================

	@Get(":id/members")
	@Permissions("committees.read.member")
	@ApiOperation({ summary: "Get committee members", description: "Get all members of a committee" })
	@ApiQuery({ name: "includeInactive", required: false, description: "Include inactive/removed members" })
	@ApiResponse({ status: 200, description: "List of committee members", type: [CommitteeMemberResponseDto] })
	@ApiResponse({ status: 404, description: "Committee not found" })
	getCommitteeMembers(
		@CurrentTenant() tenantId: string,
		@Param("id") id: string,
		@Query("includeInactive") includeInactive?: string,
	) {
		return this.committeesService.getCommitteeMembers(tenantId, id, includeInactive === "true");
	}

	@Post(":id/members")
	@Permissions("committees.manage.member")
	@ApiOperation({ summary: "Add committee member", description: "Add a new member to a committee" })
	@ApiResponse({ status: 201, description: "Member added", type: CommitteeMemberResponseDto })
	@ApiResponse({ status: 404, description: "Committee or employee not found" })
	@ApiResponse({ status: 400, description: "Employee already a member or role limit exceeded" })
	addMember(
		@CurrentTenant() tenantId: string,
		@CurrentUser("id") userId: string,
		@Param("id") id: string,
		@Body() dto: AddCommitteeMemberDto,
	) {
		return this.committeesService.addMember(tenantId, id, dto, userId);
	}

	@Post(":id/members/bulk")
	@Permissions("committees.manage.member")
	@ApiOperation({ summary: "Bulk add committee members", description: "Add multiple members to a committee at once" })
	@ApiResponse({ status: 201, description: "Members added", type: [CommitteeMemberResponseDto] })
	@ApiResponse({ status: 404, description: "Committee not found" })
	@ApiResponse({ status: 400, description: "Some employees already members or role limit exceeded" })
	bulkAddMembers(
		@CurrentTenant() tenantId: string,
		@CurrentUser("id") userId: string,
		@Param("id") id: string,
		@Body() dto: BulkAddMembersDto,
	) {
		return this.committeesService.bulkAddMembers(tenantId, id, dto, userId);
	}

	@Patch(":id/members/:memberId")
	@Permissions("committees.manage.member")
	@ApiOperation({ summary: "Update committee member", description: "Update a member's role in the committee" })
	@ApiResponse({ status: 200, description: "Member updated", type: CommitteeMemberResponseDto })
	@ApiResponse({ status: 404, description: "Committee or member not found" })
	@ApiResponse({ status: 400, description: "Role limit exceeded" })
	updateMember(
		@CurrentTenant() tenantId: string,
		@CurrentUser("id") userId: string,
		@Param("id") id: string,
		@Param("memberId") memberId: string,
		@Body() dto: UpdateCommitteeMemberDto,
	) {
		return this.committeesService.updateMember(tenantId, id, memberId, dto, userId);
	}

	@Delete(":id/members/:memberId")
	@Permissions("committees.manage.member")
	@ApiOperation({ summary: "Remove committee member", description: "Remove a member from the committee" })
	@ApiResponse({ status: 200, description: "Member removed", type: CommitteeMemberResponseDto })
	@ApiResponse({ status: 404, description: "Committee or member not found" })
	removeMember(
		@CurrentTenant() tenantId: string,
		@CurrentUser("id") userId: string,
		@Param("id") id: string,
		@Param("memberId") memberId: string,
		@Body() dto: RemoveCommitteeMemberDto,
	) {
		return this.committeesService.removeMember(tenantId, id, memberId, dto, userId);
	}

	// ==================== EMPLOYEE COMMITTEE LOOKUP ====================

	@Get("my-committees")
	@ApiOperation({
		summary: "Get current user's committees",
		description: "Get all committees the current user is a member of",
	})
	@ApiQuery({ name: "includeInactive", required: false, description: "Include inactive memberships" })
	@ApiResponse({ status: 200, description: "List of committee memberships", type: [CommitteeMemberResponseDto] })
	getMyCommittees(
		@CurrentTenant() tenantId: string,
		@CurrentUser("employeeId") employeeId: string | undefined,
		@Query("includeInactive") includeInactive?: string,
	) {
		if (!employeeId) {
			return [];
		}
		return this.committeesService.getEmployeeCommittees(tenantId, employeeId, includeInactive === "true");
	}

	@Get("employee/:employeeId")
	@Permissions("committees.read.member")
	@ApiOperation({ summary: "Get employee's committees", description: "Get all committees an employee is a member of" })
	@ApiQuery({ name: "includeInactive", required: false, description: "Include inactive memberships" })
	@ApiResponse({ status: 200, description: "List of committee memberships", type: [CommitteeMemberResponseDto] })
	@ApiResponse({ status: 404, description: "Employee not found" })
	getEmployeeCommittees(
		@CurrentTenant() tenantId: string,
		@Param("employeeId") employeeId: string,
		@Query("includeInactive") includeInactive?: string,
	) {
		return this.committeesService.getEmployeeCommittees(tenantId, employeeId, includeInactive === "true");
	}
}

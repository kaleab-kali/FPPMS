export type CommitteeMemberRole = "CHAIRMAN" | "VICE_CHAIRMAN" | "SECRETARY" | "MEMBER" | "ADVISOR";

export type CommitteeStatus = "ACTIVE" | "SUSPENDED" | "DISSOLVED";

export type TermStatus = "ACTIVE" | "COMPLETED" | "RENEWED" | "TERMINATED";

export interface CommitteeType {
	id: string;
	tenantId: string;
	code: string;
	name: string;
	nameAm?: string;
	description?: string;
	descriptionAm?: string;
	isPermanent: boolean;
	requiresCenter: boolean;
	minMembers: number;
	maxMembers?: number;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	_count?: {
		committees: number;
	};
}

export interface CreateCommitteeTypeRequest {
	code: string;
	name: string;
	nameAm?: string;
	description?: string;
	descriptionAm?: string;
	isPermanent?: boolean;
	requiresCenter?: boolean;
	minMembers?: number;
	maxMembers?: number;
}

export interface UpdateCommitteeTypeRequest {
	name?: string;
	nameAm?: string;
	description?: string;
	descriptionAm?: string;
	isPermanent?: boolean;
	requiresCenter?: boolean;
	minMembers?: number;
	maxMembers?: number;
	isActive?: boolean;
}

export interface CommitteeTypeMinimal {
	id: string;
	code: string;
	name: string;
	nameAm?: string;
	isPermanent: boolean;
	minMembers?: number;
	maxMembers?: number;
}

export interface CenterMinimal {
	id: string;
	code: string;
	name: string;
	nameAm?: string;
}

export interface PositionMinimal {
	id: string;
	name: string;
	nameAm?: string;
}

export interface EmployeeMinimal {
	id: string;
	employeeId: string;
	fullName: string;
	fullNameAm?: string;
	position?: PositionMinimal;
}

export interface CommitteeMember {
	id: string;
	tenantId: string;
	committeeId: string;
	employeeId: string;
	role: CommitteeMemberRole;
	appointedDate: string;
	endDate?: string;
	appointedBy: string;
	removedBy?: string;
	removalReason?: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	employee?: EmployeeMinimal;
}

export interface Committee {
	id: string;
	tenantId: string;
	committeeTypeId: string;
	centerId?: string;
	code: string;
	name: string;
	nameAm?: string;
	description?: string;
	descriptionAm?: string;
	status: CommitteeStatus;
	establishedDate: string;
	dissolvedDate?: string;
	dissolvedReason?: string;
	establishedBy: string;
	dissolvedBy?: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	committeeType?: CommitteeTypeMinimal;
	center?: CenterMinimal;
	members?: CommitteeMember[];
	_count?: {
		members: number;
	};
}

export interface CreateCommitteeRequest {
	committeeTypeId: string;
	centerId?: string;
	code: string;
	name: string;
	nameAm?: string;
	description?: string;
	descriptionAm?: string;
	establishedDate: string;
}

export interface UpdateCommitteeRequest {
	name?: string;
	nameAm?: string;
	description?: string;
	descriptionAm?: string;
}

export interface SuspendCommitteeRequest {
	reason?: string;
}

export interface ReactivateCommitteeRequest {
	reason?: string;
}

export interface DissolveCommitteeRequest {
	dissolvedDate: string;
	dissolvedReason: string;
}

export interface CommitteeFilterParams {
	committeeTypeId?: string;
	centerId?: string;
	status?: CommitteeStatus;
	search?: string;
}

export interface AddCommitteeMemberRequest {
	employeeId: string;
	role: CommitteeMemberRole;
	appointedDate: string;
	termLimitMonths?: number;
}

export interface UpdateCommitteeMemberRequest {
	role?: CommitteeMemberRole;
}

export interface RemoveCommitteeMemberRequest {
	endDate: string;
	removalReason?: string;
}

export interface BulkAddMembersRequest {
	employeeIds: string[];
	role: CommitteeMemberRole;
	appointedDate: string;
	termLimitMonths?: number;
}

export interface RenewMemberTermRequest {
	newTermStartDate: string;
	termLimitMonths?: number;
	notes?: string;
}

export interface TerminateMemberTermRequest {
	terminatedDate: string;
	terminatedReason: string;
}

export interface ExpiringTermsParams {
	days?: number;
	centerId?: string;
}

export interface CommitteeHistory {
	id: string;
	tenantId: string;
	committeeId: string;
	action: string;
	previousValue?: unknown;
	newValue?: unknown;
	performedBy: string;
	performedAt: string;
	notes?: string;
	ipAddress?: string;
}

export const COMMITTEE_MEMBER_ROLE_LABELS: Record<CommitteeMemberRole, string> = {
	CHAIRMAN: "Chairman",
	VICE_CHAIRMAN: "Vice Chairman",
	SECRETARY: "Secretary",
	MEMBER: "Member",
	ADVISOR: "Advisor",
} as const;

export const COMMITTEE_STATUS_LABELS: Record<CommitteeStatus, string> = {
	ACTIVE: "Active",
	SUSPENDED: "Suspended",
	DISSOLVED: "Dissolved",
} as const;

export interface CommitteeMinimalForEmployee {
	id: string;
	tenantId: string;
	committeeTypeId: string;
	centerId?: string;
	code: string;
	name: string;
	nameAm?: string;
	description?: string;
	descriptionAm?: string;
	status: CommitteeStatus;
	establishedDate: string;
	dissolvedDate?: string;
	dissolvedReason?: string;
	establishedBy: string;
	dissolvedBy?: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	committeeType?: {
		id: string;
		code: string;
		name: string;
		nameAm?: string;
	};
	center?: {
		id: string;
		code: string;
		name: string;
		nameAm?: string;
	};
}

export interface EmployeeCommitteeMembership {
	id: string;
	tenantId: string;
	committeeId: string;
	employeeId: string;
	role: CommitteeMemberRole;
	appointedDate: string;
	endDate?: string;
	appointedBy: string;
	removedBy?: string;
	removalReason?: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	committee?: CommitteeMinimalForEmployee;
}

export interface CommitteeMemberTerm {
	id: string;
	tenantId: string;
	centerId?: string;
	committeeId: string;
	memberId: string;
	employeeId: string;
	termNumber: number;
	termLimitMonths: number;
	startDate: string;
	endDate: string;
	status: TermStatus;
	renewedFromTermId?: string;
	terminatedDate?: string;
	terminatedReason?: string;
	terminatedBy?: string;
	renewedBy?: string;
	renewedDate?: string;
	notes?: string;
	createdAt: string;
	updatedAt: string;
	committee?: {
		id: string;
		code: string;
		name: string;
		nameAm?: string;
		committeeType?: {
			id: string;
			code: string;
			name: string;
			nameAm?: string;
		};
	};
	center?: {
		id: string;
		code: string;
		name: string;
		nameAm?: string;
	};
}

export const TERM_STATUS_LABELS: Record<TermStatus, string> = {
	ACTIVE: "Active",
	COMPLETED: "Completed",
	RENEWED: "Renewed",
	TERMINATED: "Terminated",
} as const;

export const TERM_STATUS_COLORS: Record<TermStatus, string> = {
	ACTIVE: "bg-green-100 text-green-800",
	COMPLETED: "bg-gray-100 text-gray-800",
	RENEWED: "bg-blue-100 text-blue-800",
	TERMINATED: "bg-red-100 text-red-800",
} as const;

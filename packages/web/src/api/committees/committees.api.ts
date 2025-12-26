import { api } from "#web/lib/api-client.ts";
import type {
	AddCommitteeMemberRequest,
	BulkAddMembersRequest,
	Committee,
	CommitteeFilterParams,
	CommitteeHistory,
	CommitteeMember,
	CommitteeType,
	CreateCommitteeRequest,
	CreateCommitteeTypeRequest,
	DissolveCommitteeRequest,
	EmployeeCommitteeMembership,
	ReactivateCommitteeRequest,
	RemoveCommitteeMemberRequest,
	SuspendCommitteeRequest,
	UpdateCommitteeMemberRequest,
	UpdateCommitteeRequest,
	UpdateCommitteeTypeRequest,
} from "#web/types/committee.ts";

const BASE_URL = "/committees";

export const committeesApi = {
	// Committee Types
	getTypes: (includeInactive = false) =>
		api.get<CommitteeType[]>(`${BASE_URL}/types${includeInactive ? "?includeInactive=true" : ""}`),
	getTypeById: (id: string) => api.get<CommitteeType>(`${BASE_URL}/types/${id}`),
	createType: (data: CreateCommitteeTypeRequest) => api.post<CommitteeType>(`${BASE_URL}/types`, data),
	updateType: (id: string, data: UpdateCommitteeTypeRequest) =>
		api.patch<CommitteeType>(`${BASE_URL}/types/${id}`, data),
	deleteType: (id: string) => api.delete<CommitteeType>(`${BASE_URL}/types/${id}`),

	// Committees
	getAll: (params?: CommitteeFilterParams) => {
		const searchParams = new URLSearchParams();
		if (params?.committeeTypeId) searchParams.append("committeeTypeId", params.committeeTypeId);
		if (params?.centerId) searchParams.append("centerId", params.centerId);
		if (params?.status) searchParams.append("status", params.status);
		if (params?.search) searchParams.append("search", params.search);
		const queryString = searchParams.toString();
		return api.get<Committee[]>(`${BASE_URL}${queryString ? `?${queryString}` : ""}`);
	},
	getById: (id: string, includeMembers = false) =>
		api.get<Committee>(`${BASE_URL}/${id}${includeMembers ? "?includeMembers=true" : ""}`),
	create: (data: CreateCommitteeRequest) => api.post<Committee>(BASE_URL, data),
	update: (id: string, data: UpdateCommitteeRequest) => api.patch<Committee>(`${BASE_URL}/${id}`, data),
	suspend: (id: string, data: SuspendCommitteeRequest) => api.patch<Committee>(`${BASE_URL}/${id}/suspend`, data),
	reactivate: (id: string, data: ReactivateCommitteeRequest) =>
		api.patch<Committee>(`${BASE_URL}/${id}/reactivate`, data),
	dissolve: (id: string, data: DissolveCommitteeRequest) => api.patch<Committee>(`${BASE_URL}/${id}/dissolve`, data),
	getHistory: (id: string) => api.get<CommitteeHistory[]>(`${BASE_URL}/${id}/history`),

	// Members
	getMembers: (committeeId: string, includeInactive = false) =>
		api.get<CommitteeMember[]>(`${BASE_URL}/${committeeId}/members${includeInactive ? "?includeInactive=true" : ""}`),
	addMember: (committeeId: string, data: AddCommitteeMemberRequest) =>
		api.post<CommitteeMember>(`${BASE_URL}/${committeeId}/members`, data),
	bulkAddMembers: (committeeId: string, data: BulkAddMembersRequest) =>
		api.post<CommitteeMember[]>(`${BASE_URL}/${committeeId}/members/bulk`, data),
	updateMember: (committeeId: string, memberId: string, data: UpdateCommitteeMemberRequest) =>
		api.patch<CommitteeMember>(`${BASE_URL}/${committeeId}/members/${memberId}`, data),
	removeMember: (committeeId: string, memberId: string, data: RemoveCommitteeMemberRequest) =>
		api.delete<CommitteeMember>(`${BASE_URL}/${committeeId}/members/${memberId}`, { data }),

	// Employee lookup
	getEmployeeCommittees: (employeeId: string, includeInactive = false) =>
		api.get<EmployeeCommitteeMembership[]>(
			`${BASE_URL}/employee/${employeeId}${includeInactive ? "?includeInactive=true" : ""}`,
		),
};

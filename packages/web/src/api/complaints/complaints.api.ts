import { api } from "#web/lib/api-client.ts";
import type {
	AssignCommitteeRequest,
	CloseComplaintRequest,
	Complaint,
	ComplaintAppeal,
	ComplaintFilterParams,
	ComplaintListItem,
	ComplaintTimeline,
	CreateComplaintRequest,
	ForwardToCommitteeRequest,
	ForwardToHqRequest,
	RecordAppealDecisionRequest,
	RecordDecisionRequest,
	RecordFindingRequest,
	RecordHqDecisionRequest,
	RecordNotificationRequest,
	RecordRebuttalRequest,
	SubmitAppealRequest,
} from "#web/types/complaint.ts";

const BASE_URL = "/complaints";

export const complaintsApi = {
	getAll: (params?: ComplaintFilterParams) => {
		const searchParams = new URLSearchParams();
		if (params?.article) searchParams.append("article", params.article);
		if (params?.status) searchParams.append("status", params.status);
		if (params?.centerId) searchParams.append("centerId", params.centerId);
		if (params?.accusedEmployeeId) searchParams.append("accusedEmployeeId", params.accusedEmployeeId);
		if (params?.search) searchParams.append("search", params.search);
		if (params?.fromDate) searchParams.append("fromDate", params.fromDate);
		if (params?.toDate) searchParams.append("toDate", params.toDate);
		const queryString = searchParams.toString();
		return api.get<ComplaintListItem[]>(`${BASE_URL}${queryString ? `?${queryString}` : ""}`);
	},

	getById: (id: string) => api.get<Complaint>(`${BASE_URL}/${id}`),

	getTimeline: (id: string) => api.get<ComplaintTimeline[]>(`${BASE_URL}/${id}/timeline`),

	getEmployeeHistory: (employeeId: string) => api.get<ComplaintListItem[]>(`${BASE_URL}/employee/${employeeId}`),

	getByCommittee: (committeeId: string, type: "assigned" | "hq" = "assigned") =>
		api.get<ComplaintListItem[]>(`${BASE_URL}/committee/${committeeId}?type=${type}`),

	create: (data: CreateComplaintRequest) => api.post<Complaint>(BASE_URL, data),

	recordNotification: (id: string, data: RecordNotificationRequest) =>
		api.patch<Complaint>(`${BASE_URL}/${id}/notification`, data),

	recordRebuttal: (id: string, data: RecordRebuttalRequest) => api.patch<Complaint>(`${BASE_URL}/${id}/rebuttal`, data),

	markRebuttalDeadlinePassed: (id: string) => api.patch<Complaint>(`${BASE_URL}/${id}/rebuttal-deadline-passed`, {}),

	recordFinding: (id: string, data: RecordFindingRequest) => api.patch<Complaint>(`${BASE_URL}/${id}/finding`, data),

	recordDecision: (id: string, data: RecordDecisionRequest) => api.patch<Complaint>(`${BASE_URL}/${id}/decision`, data),

	assignCommittee: (id: string, data: AssignCommitteeRequest) =>
		api.patch<Complaint>(`${BASE_URL}/${id}/assign-committee`, data),

	forwardToCommittee: (id: string, data: ForwardToCommitteeRequest) =>
		api.patch<Complaint>(`${BASE_URL}/${id}/forward-to-committee`, data),

	forwardToHq: (id: string, data: ForwardToHqRequest) => api.patch<Complaint>(`${BASE_URL}/${id}/forward-to-hq`, data),

	recordHqDecision: (id: string, data: RecordHqDecisionRequest) =>
		api.patch<Complaint>(`${BASE_URL}/${id}/hq-decision`, data),

	submitAppeal: (id: string, data: SubmitAppealRequest) => api.post<ComplaintAppeal>(`${BASE_URL}/${id}/appeals`, data),

	recordAppealDecision: (id: string, appealId: string, data: RecordAppealDecisionRequest) =>
		api.patch<ComplaintAppeal>(`${BASE_URL}/${id}/appeals/${appealId}`, data),

	closeComplaint: (id: string, data: CloseComplaintRequest) => api.patch<Complaint>(`${BASE_URL}/${id}/close`, data),
};

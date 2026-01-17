import { api } from "#web/lib/api-client.ts";
import type {
	BulkAssignmentResponse,
	BulkShiftAssignmentRequest,
	CreateShiftAssignmentRequest,
	CreateShiftDefinitionRequest,
	ShiftAssignment,
	ShiftDefinition,
	SwapShiftRequest,
	UpdateShiftDefinitionRequest,
} from "#web/types/attendance.ts";

const SHIFTS_URL = "/shifts";
const ASSIGNMENTS_URL = "/shift-assignments";

export const shiftsApi = {
	getAll: (includeInactive = false) => {
		const params = includeInactive ? "?includeInactive=true" : "";
		return api.get<ShiftDefinition[]>(`${SHIFTS_URL}${params}`);
	},

	getById: (id: string) => api.get<ShiftDefinition>(`${SHIFTS_URL}/${id}`),

	getByCode: (code: string) => api.get<ShiftDefinition>(`${SHIFTS_URL}/code/${code}`),

	create: (data: CreateShiftDefinitionRequest) => api.post<ShiftDefinition>(SHIFTS_URL, data),

	update: (id: string, data: UpdateShiftDefinitionRequest) => api.patch<ShiftDefinition>(`${SHIFTS_URL}/${id}`, data),

	delete: (id: string) => api.delete<void>(`${SHIFTS_URL}/${id}`),
} as const;

export const shiftAssignmentsApi = {
	getAll: (params?: { employeeId?: string; shiftId?: string; startDate?: string; endDate?: string }) => {
		const searchParams = new URLSearchParams();
		if (params?.employeeId) searchParams.append("employeeId", params.employeeId);
		if (params?.shiftId) searchParams.append("shiftId", params.shiftId);
		if (params?.startDate) searchParams.append("startDate", params.startDate);
		if (params?.endDate) searchParams.append("endDate", params.endDate);
		const queryString = searchParams.toString();
		return api.get<ShiftAssignment[]>(`${ASSIGNMENTS_URL}${queryString ? `?${queryString}` : ""}`);
	},

	getByEmployee: (employeeId: string, startDate?: string, endDate?: string) => {
		const params = new URLSearchParams();
		if (startDate) params.append("startDate", startDate);
		if (endDate) params.append("endDate", endDate);
		const queryString = params.toString();
		return api.get<ShiftAssignment[]>(
			`${ASSIGNMENTS_URL}/employee/${employeeId}${queryString ? `?${queryString}` : ""}`,
		);
	},

	getByDate: (date: string, centerId?: string) => {
		const params = centerId ? `?centerId=${centerId}` : "";
		return api.get<ShiftAssignment[]>(`${ASSIGNMENTS_URL}/date/${date}${params}`);
	},

	create: (data: CreateShiftAssignmentRequest) => api.post<ShiftAssignment>(ASSIGNMENTS_URL, data),

	createBulk: (data: BulkShiftAssignmentRequest) => api.post<BulkAssignmentResponse>(`${ASSIGNMENTS_URL}/bulk`, data),

	swap: (data: SwapShiftRequest) => api.post<ShiftAssignment>(`${ASSIGNMENTS_URL}/swap`, data),

	delete: (id: string) => api.delete<void>(`${ASSIGNMENTS_URL}/${id}`),

	deleteByDateRange: (employeeId: string, startDate: string, endDate: string) =>
		api.delete<void>(`${ASSIGNMENTS_URL}/employee/${employeeId}/range?startDate=${startDate}&endDate=${endDate}`),
} as const;

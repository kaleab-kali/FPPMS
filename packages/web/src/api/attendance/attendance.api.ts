import { api } from "#web/lib/api-client.ts";
import type {
	AttendanceQuery,
	AttendanceRecord,
	BulkAttendanceRequest,
	BulkAttendanceResponse,
	CreateAttendanceRecordRequest,
	PaginatedAttendanceResponse,
	UpdateAttendanceRecordRequest,
} from "#web/types/attendance.ts";

const BASE_URL = "/attendance";

const buildQueryString = (query: AttendanceQuery): string => {
	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(query)) {
		if (value !== undefined && value !== null && value !== "") {
			params.append(key, String(value));
		}
	}
	const queryString = params.toString();
	return queryString ? `?${queryString}` : "";
};

export const attendanceApi = {
	getAll: (query: AttendanceQuery = {}) => {
		const queryString = buildQueryString(query);
		return api.get<PaginatedAttendanceResponse>(`${BASE_URL}${queryString}`);
	},

	getById: (id: string) => api.get<AttendanceRecord>(`${BASE_URL}/${id}`),

	getByDate: (date: string, centerId?: string, departmentId?: string) => {
		const params = new URLSearchParams();
		if (centerId) params.append("centerId", centerId);
		if (departmentId) params.append("departmentId", departmentId);
		const queryString = params.toString();
		return api.get<AttendanceRecord[]>(`${BASE_URL}/daily/${date}${queryString ? `?${queryString}` : ""}`);
	},

	getByEmployee: (employeeId: string, startDate?: string, endDate?: string) => {
		const params = new URLSearchParams();
		if (startDate) params.append("startDate", startDate);
		if (endDate) params.append("endDate", endDate);
		const queryString = params.toString();
		return api.get<AttendanceRecord[]>(`${BASE_URL}/employee/${employeeId}${queryString ? `?${queryString}` : ""}`);
	},

	create: (data: CreateAttendanceRecordRequest) => api.post<AttendanceRecord>(BASE_URL, data),

	createBulk: (data: BulkAttendanceRequest) => api.post<BulkAttendanceResponse>(`${BASE_URL}/bulk`, data),

	update: (id: string, data: UpdateAttendanceRecordRequest) => api.patch<AttendanceRecord>(`${BASE_URL}/${id}`, data),

	delete: (id: string) => api.delete<void>(`${BASE_URL}/${id}`),
} as const;

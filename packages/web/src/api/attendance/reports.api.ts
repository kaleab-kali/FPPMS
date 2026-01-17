import { api } from "#web/lib/api-client.ts";
import type {
	AbsenteeismReport,
	AttendanceOverview,
	AttendanceReportQuery,
	AttendanceTrend,
	DepartmentAttendanceSummary,
	EmployeeAttendanceSummary,
	LateArrivalReport,
} from "#web/types/attendance.ts";

const BASE_URL = "/attendance/reports";

const buildQueryString = (query: AttendanceReportQuery): string => {
	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(query)) {
		if (value !== undefined && value !== null && value !== "") {
			params.append(key, String(value));
		}
	}
	const queryString = params.toString();
	return queryString ? `?${queryString}` : "";
};

export const attendanceReportsApi = {
	getOverview: (date?: string) => {
		const params = date ? `?date=${date}` : "";
		return api.get<AttendanceOverview>(`${BASE_URL}/overview${params}`);
	},

	getEmployeeMonthlySummary: (employeeId: string, month: number, year: number) =>
		api.get<EmployeeAttendanceSummary>(`${BASE_URL}/monthly/${employeeId}?month=${month}&year=${year}`),

	getDepartmentSummary: (departmentId: string, date?: string) => {
		const params = date ? `?date=${date}` : "";
		return api.get<DepartmentAttendanceSummary>(`${BASE_URL}/department/${departmentId}${params}`);
	},

	getAttendanceTrends: (query: AttendanceReportQuery) => {
		const queryString = buildQueryString(query);
		return api.get<AttendanceTrend[]>(`${BASE_URL}/trends${queryString}`);
	},

	getLateArrivalsReport: (query: AttendanceReportQuery, lateThreshold?: number) => {
		const params = { ...query, lateThreshold };
		const searchParams = new URLSearchParams();
		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined && value !== null && value !== "") {
				searchParams.append(key, String(value));
			}
		}
		const queryString = searchParams.toString();
		return api.get<LateArrivalReport[]>(`${BASE_URL}/late-arrivals${queryString ? `?${queryString}` : ""}`);
	},

	getAbsenteeismReport: (query: AttendanceReportQuery) => {
		const queryString = buildQueryString(query);
		return api.get<AbsenteeismReport[]>(`${BASE_URL}/absenteeism${queryString}`);
	},
} as const;

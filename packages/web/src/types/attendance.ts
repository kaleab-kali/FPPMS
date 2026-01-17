export const ATTENDANCE_STATUS = {
	PRESENT: "PRESENT",
	ABSENT: "ABSENT",
	LATE: "LATE",
	HALF_DAY: "HALF_DAY",
	ON_LEAVE: "ON_LEAVE",
} as const;

export type AttendanceStatus = (typeof ATTENDANCE_STATUS)[keyof typeof ATTENDANCE_STATUS];

export const CLOCK_METHOD = {
	MANUAL: "MANUAL",
	BIOMETRIC_FINGERPRINT: "BIOMETRIC_FINGERPRINT",
	BIOMETRIC_FACE: "BIOMETRIC_FACE",
	CARD_SWIPE: "CARD_SWIPE",
} as const;

export type ClockMethod = (typeof CLOCK_METHOD)[keyof typeof CLOCK_METHOD];

export const WORK_SCHEDULE_TYPE = {
	REGULAR: "REGULAR",
	FLEXIBLE: "FLEXIBLE",
	SHIFT: "SHIFT",
	PART_TIME: "PART_TIME",
} as const;

export type WorkScheduleType = (typeof WORK_SCHEDULE_TYPE)[keyof typeof WORK_SCHEDULE_TYPE];

export interface EmployeeBasic {
	id: string;
	employeeId: string;
	fullName: string;
	fullNameAm?: string;
}

export interface ShiftBasic {
	id: string;
	code: string;
	name: string;
	startTime: string;
	endTime: string;
	color?: string;
}

export interface AttendanceRecord {
	id: string;
	tenantId: string;
	employeeId: string;
	attendanceDate: string;
	shiftId?: string;
	clockIn?: string;
	clockOut?: string;
	clockInMethod?: string;
	clockOutMethod?: string;
	clockInDeviceId?: string;
	clockOutDeviceId?: string;
	status: AttendanceStatus;
	hoursWorked?: number;
	overtimeHours?: number;
	lateMinutes?: number;
	remarks?: string;
	recordedBy?: string;
	createdAt: string;
	updatedAt: string;
	employee?: EmployeeBasic;
	shift?: ShiftBasic;
}

export interface CreateAttendanceRecordRequest {
	employeeId: string;
	attendanceDate: string;
	shiftId?: string;
	clockIn?: string;
	clockOut?: string;
	clockInMethod?: ClockMethod;
	clockOutMethod?: ClockMethod;
	status: AttendanceStatus;
	lateMinutes?: number;
	remarks?: string;
}

export interface UpdateAttendanceRecordRequest {
	shiftId?: string;
	clockIn?: string;
	clockOut?: string;
	clockInMethod?: ClockMethod;
	clockOutMethod?: ClockMethod;
	status?: AttendanceStatus;
	lateMinutes?: number;
	remarks?: string;
}

export interface BulkAttendanceRequest {
	records: CreateAttendanceRecordRequest[];
}

export interface BulkAttendanceResponse {
	created: number;
	failed: number;
	errors: string[];
}

export interface AttendanceQuery {
	page?: number;
	pageSize?: number;
	employeeId?: string;
	shiftId?: string;
	centerId?: string;
	departmentId?: string;
	status?: AttendanceStatus;
	attendanceDate?: string;
	startDate?: string;
	endDate?: string;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
	search?: string;
}

export interface PaginatedAttendanceResponse {
	data: AttendanceRecord[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
	};
}

export interface ShiftDefinition {
	id: string;
	tenantId: string;
	code: string;
	name: string;
	nameAm?: string;
	scheduleType: WorkScheduleType;
	startTime: string;
	endTime: string;
	isOvernight: boolean;
	breakMinutes: number;
	holidayAware: boolean;
	color?: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	workingHours?: number;
}

export interface CreateShiftDefinitionRequest {
	code: string;
	name: string;
	nameAm?: string;
	scheduleType?: WorkScheduleType;
	startTime: string;
	endTime: string;
	isOvernight?: boolean;
	breakMinutes?: number;
	holidayAware?: boolean;
	color?: string;
	isActive?: boolean;
}

export interface UpdateShiftDefinitionRequest {
	name?: string;
	nameAm?: string;
	scheduleType?: WorkScheduleType;
	startTime?: string;
	endTime?: string;
	isOvernight?: boolean;
	breakMinutes?: number;
	holidayAware?: boolean;
	color?: string;
	isActive?: boolean;
}

export interface ShiftAssignment {
	id: string;
	tenantId: string;
	employeeId: string;
	shiftId: string;
	shiftDate: string;
	status: string;
	swappedWithEmployeeId?: string;
	swapApprovedBy?: string;
	createdAt: string;
	updatedAt: string;
	employee?: EmployeeBasic;
	shift?: ShiftBasic;
}

export interface CreateShiftAssignmentRequest {
	employeeId: string;
	shiftId: string;
	shiftDate: string;
}

export interface BulkShiftAssignmentRequest {
	employeeIds: string[];
	shiftId: string;
	startDate: string;
	endDate: string;
	daysOfWeek?: number[];
	skipHolidays?: boolean;
}

export interface BulkAssignmentResponse {
	created: number;
	skipped: number;
	failed: number;
	errors: string[];
}

export interface SwapShiftRequest {
	assignmentId: string;
	swapWithEmployeeId: string;
}

export interface AttendanceOverview {
	totalEmployees: number;
	presentToday: number;
	absentToday: number;
	lateToday: number;
	onLeaveToday: number;
	attendanceRate: number;
	notClockedIn: number;
}

export interface EmployeeAttendanceSummary {
	employeeId: string;
	employeeCode: string;
	employeeName: string;
	totalWorkingDays: number;
	daysPresent: number;
	daysAbsent: number;
	daysLate: number;
	daysOnLeave: number;
	halfDays: number;
	totalHoursWorked: number;
	totalOvertimeHours: number;
	totalLateMinutes: number;
	attendancePercentage: number;
}

export interface DepartmentAttendanceSummary {
	departmentId: string;
	departmentName: string;
	totalEmployees: number;
	avgAttendancePercentage: number;
	presentToday: number;
	absentToday: number;
	lateToday: number;
	onLeaveToday: number;
}

export interface AttendanceTrend {
	period: string;
	date: string;
	present: number;
	absent: number;
	late: number;
	onLeave: number;
	total: number;
	attendanceRate: number;
}

export interface LateArrivalReport {
	employeeId: string;
	employeeCode: string;
	employeeName: string;
	departmentName: string;
	date: string;
	expectedTime: string;
	actualTime: string;
	lateMinutes: number;
}

export interface AbsenteeismReport {
	employeeId: string;
	employeeCode: string;
	employeeName: string;
	departmentName: string;
	absentDays: number;
	dates: string[];
}

export interface AttendanceReportQuery {
	startDate?: string;
	endDate?: string;
	month?: number;
	year?: number;
	centerId?: string;
	departmentId?: string;
	groupBy?: "day" | "week" | "month";
}

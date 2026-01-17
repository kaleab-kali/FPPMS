import { z } from "zod";
import { ATTENDANCE_STATUS, CLOCK_METHOD } from "#web/types/attendance.ts";

export const attendanceRecordSchema = z.object({
	employeeId: z.string().min(1, "Employee is required"),
	attendanceDate: z.string().min(1, "Date is required"),
	shiftId: z.string().optional(),
	clockIn: z.string().optional(),
	clockOut: z.string().optional(),
	clockInMethod: z.nativeEnum(CLOCK_METHOD).optional(),
	clockOutMethod: z.nativeEnum(CLOCK_METHOD).optional(),
	status: z.nativeEnum(ATTENDANCE_STATUS),
	lateMinutes: z.number().int().min(0).optional(),
	remarks: z.string().optional(),
});

export type AttendanceRecordFormData = z.infer<typeof attendanceRecordSchema>;

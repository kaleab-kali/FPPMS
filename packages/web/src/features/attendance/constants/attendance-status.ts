import { ATTENDANCE_STATUS, type AttendanceStatus } from "#web/types/attendance.ts";

export const ATTENDANCE_STATUS_CONFIG = {
	[ATTENDANCE_STATUS.PRESENT]: {
		label: "status.present",
		variant: "default" as const,
		color: "bg-green-500",
	},
	[ATTENDANCE_STATUS.ABSENT]: {
		label: "status.absent",
		variant: "destructive" as const,
		color: "bg-red-500",
	},
	[ATTENDANCE_STATUS.LATE]: {
		label: "status.late",
		variant: "secondary" as const,
		color: "bg-yellow-500",
	},
	[ATTENDANCE_STATUS.HALF_DAY]: {
		label: "status.halfDay",
		variant: "secondary" as const,
		color: "bg-blue-500",
	},
	[ATTENDANCE_STATUS.ON_LEAVE]: {
		label: "status.onLeave",
		variant: "outline" as const,
		color: "bg-purple-500",
	},
} as const;

export const getStatusConfig = (status: AttendanceStatus) => ATTENDANCE_STATUS_CONFIG[status];

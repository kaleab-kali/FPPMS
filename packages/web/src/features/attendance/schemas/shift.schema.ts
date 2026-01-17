import { z } from "zod";
import { WORK_SCHEDULE_TYPE } from "#web/types/attendance.ts";

export const shiftDefinitionSchema = z.object({
	code: z.string().min(1, "Code is required").max(20),
	name: z.string().min(1, "Name is required"),
	nameAm: z.string().optional(),
	scheduleType: z.nativeEnum(WORK_SCHEDULE_TYPE).optional(),
	startTime: z.string().min(1, "Start time is required"),
	endTime: z.string().min(1, "End time is required"),
	isOvernight: z.boolean().optional(),
	breakMinutes: z.number().int().min(0).optional(),
	holidayAware: z.boolean().optional(),
	color: z.string().optional(),
	isActive: z.boolean(),
});

export type ShiftDefinitionFormData = z.infer<typeof shiftDefinitionSchema>;

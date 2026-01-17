import { useMutation, useQueryClient } from "@tanstack/react-query";
import { attendanceApi } from "#web/api/attendance/attendance.api.ts";
import { attendanceKeys } from "#web/api/attendance/attendance.queries.ts";
import { attendanceReportKeys } from "#web/api/attendance/reports.queries.ts";
import type {
	BulkAttendanceRequest,
	CreateAttendanceRecordRequest,
	UpdateAttendanceRecordRequest,
} from "#web/types/attendance.ts";

export const useCreateAttendanceRecord = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateAttendanceRecordRequest) => attendanceApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: attendanceKeys.all, refetchType: "all" });
			queryClient.invalidateQueries({ queryKey: attendanceReportKeys.all, refetchType: "all" });
		},
	});
};

export const useCreateBulkAttendance = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: BulkAttendanceRequest) => attendanceApi.createBulk(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: attendanceKeys.all, refetchType: "all" });
			queryClient.invalidateQueries({ queryKey: attendanceReportKeys.all, refetchType: "all" });
		},
	});
};

export const useUpdateAttendanceRecord = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateAttendanceRecordRequest }) => attendanceApi.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: attendanceKeys.all, refetchType: "all" });
			queryClient.invalidateQueries({ queryKey: attendanceReportKeys.all, refetchType: "all" });
		},
	});
};

export const useDeleteAttendanceRecord = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => attendanceApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: attendanceKeys.all, refetchType: "all" });
			queryClient.invalidateQueries({ queryKey: attendanceReportKeys.all, refetchType: "all" });
		},
	});
};

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { attendanceKeys } from "#web/api/attendance/attendance.queries.ts";
import { attendanceReportKeys } from "#web/api/attendance/reports.queries.ts";
import { shiftAssignmentsApi, shiftsApi } from "#web/api/attendance/shifts.api.ts";
import { shiftAssignmentKeys, shiftKeys } from "#web/api/attendance/shifts.queries.ts";
import type {
	BulkShiftAssignmentRequest,
	CreateShiftAssignmentRequest,
	CreateShiftDefinitionRequest,
	SwapShiftRequest,
	UpdateShiftDefinitionRequest,
} from "#web/types/attendance.ts";

export const useCreateShift = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateShiftDefinitionRequest) => shiftsApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: shiftKeys.all, refetchType: "all" });
		},
	});
};

export const useUpdateShift = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateShiftDefinitionRequest }) => shiftsApi.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: shiftKeys.all, refetchType: "all" });
			queryClient.invalidateQueries({ queryKey: attendanceKeys.all, refetchType: "all" });
		},
	});
};

export const useDeleteShift = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => shiftsApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: shiftKeys.all, refetchType: "all" });
		},
	});
};

export const useCreateShiftAssignment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateShiftAssignmentRequest) => shiftAssignmentsApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: shiftAssignmentKeys.all, refetchType: "all" });
			queryClient.invalidateQueries({ queryKey: attendanceKeys.all, refetchType: "all" });
			queryClient.invalidateQueries({ queryKey: attendanceReportKeys.all, refetchType: "all" });
		},
	});
};

export const useCreateBulkShiftAssignment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: BulkShiftAssignmentRequest) => shiftAssignmentsApi.createBulk(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: shiftAssignmentKeys.all, refetchType: "all" });
			queryClient.invalidateQueries({ queryKey: attendanceKeys.all, refetchType: "all" });
			queryClient.invalidateQueries({ queryKey: attendanceReportKeys.all, refetchType: "all" });
		},
	});
};

export const useSwapShift = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: SwapShiftRequest) => shiftAssignmentsApi.swap(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: shiftAssignmentKeys.all, refetchType: "all" });
			queryClient.invalidateQueries({ queryKey: attendanceKeys.all, refetchType: "all" });
			queryClient.invalidateQueries({ queryKey: attendanceReportKeys.all, refetchType: "all" });
		},
	});
};

export const useDeleteShiftAssignment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => shiftAssignmentsApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: shiftAssignmentKeys.all, refetchType: "all" });
			queryClient.invalidateQueries({ queryKey: attendanceKeys.all, refetchType: "all" });
			queryClient.invalidateQueries({ queryKey: attendanceReportKeys.all, refetchType: "all" });
		},
	});
};

export const useDeleteShiftAssignmentsByDateRange = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ employeeId, startDate, endDate }: { employeeId: string; startDate: string; endDate: string }) =>
			shiftAssignmentsApi.deleteByDateRange(employeeId, startDate, endDate),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: shiftAssignmentKeys.all, refetchType: "all" });
			queryClient.invalidateQueries({ queryKey: attendanceKeys.all, refetchType: "all" });
			queryClient.invalidateQueries({ queryKey: attendanceReportKeys.all, refetchType: "all" });
		},
	});
};

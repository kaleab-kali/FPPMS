import { useMutation, useQueryClient } from "@tanstack/react-query";
import { employeeTransferApi } from "#web/api/employees/employee-transfer.api.ts";
import { employeeTransferKeys } from "#web/api/employees/employee-transfer.queries.ts";
import { employeeKeys } from "#web/api/employees/employees.queries.ts";
import type {
	AcceptTransferDto,
	CancelTransferDto,
	CreateDepartureDto,
	CreateTransferRequestDto,
	RejectTransferDto,
	UpdateDepartureDto,
} from "#web/types/employee-transfer.ts";

export const useCreateTransferRequest = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateTransferRequestDto) => employeeTransferApi.createTransferRequest(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: employeeTransferKeys.all });
		},
	});
};

export const useAcceptTransfer = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ transferId, data }: { transferId: string; data: AcceptTransferDto }) =>
			employeeTransferApi.acceptTransfer(transferId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: employeeKeys.all });
			queryClient.invalidateQueries({ queryKey: employeeTransferKeys.all });
		},
	});
};

export const useRejectTransfer = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ transferId, data }: { transferId: string; data: RejectTransferDto }) =>
			employeeTransferApi.rejectTransfer(transferId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: employeeTransferKeys.all });
		},
	});
};

export const useCancelTransfer = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ transferId, data }: { transferId: string; data: CancelTransferDto }) =>
			employeeTransferApi.cancelTransfer(transferId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: employeeTransferKeys.all });
		},
	});
};

export const useCreateDeparture = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateDepartureDto) => employeeTransferApi.createDeparture(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: employeeKeys.all });
			queryClient.invalidateQueries({ queryKey: employeeTransferKeys.all });
		},
	});
};

export const useUpdateDeparture = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ departureId, data }: { departureId: string; data: UpdateDepartureDto }) =>
			employeeTransferApi.updateDeparture(departureId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: employeeTransferKeys.departures() });
		},
	});
};

export const useDeleteDeparture = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (departureId: string) => employeeTransferApi.deleteDeparture(departureId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: employeeKeys.all });
			queryClient.invalidateQueries({ queryKey: employeeTransferKeys.all });
		},
	});
};

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { employeeTransferApi } from "#web/api/employees/employee-transfer.api.ts";
import { employeeTransferKeys } from "#web/api/employees/employee-transfer.queries.ts";
import { employeeKeys } from "#web/api/employees/employees.queries.ts";
import type { ExternalTransferRequest, InternalTransferRequest } from "#web/types/employee-transfer.ts";

export const useInternalTransfer = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: InternalTransferRequest) => employeeTransferApi.internalTransfer(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: employeeKeys.all });
			queryClient.invalidateQueries({ queryKey: employeeTransferKeys.all });
		},
	});
};

export const useRegisterExternalTransfer = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: ExternalTransferRequest) => employeeTransferApi.registerExternalTransfer(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: employeeKeys.all });
			queryClient.invalidateQueries({ queryKey: employeeTransferKeys.all });
		},
	});
};

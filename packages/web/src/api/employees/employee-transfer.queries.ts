import { useQuery } from "@tanstack/react-query";
import { employeeTransferApi } from "#web/api/employees/employee-transfer.api.ts";

export const employeeTransferKeys = {
	all: ["employee-transfer"] as const,
	history: (employeeId: string) => [...employeeTransferKeys.all, "history", employeeId] as const,
	external: () => [...employeeTransferKeys.all, "external"] as const,
} as const;

export const useTransferHistory = (employeeId: string) =>
	useQuery({
		queryKey: employeeTransferKeys.history(employeeId),
		queryFn: () => employeeTransferApi.getHistory(employeeId),
		enabled: !!employeeId,
	});

export const useExternalTransfers = () =>
	useQuery({
		queryKey: employeeTransferKeys.external(),
		queryFn: () => employeeTransferApi.getExternalTransfers(),
	});

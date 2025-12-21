import { api } from "#web/lib/api-client.ts";
import type { Employee } from "#web/types/employee.ts";
import type {
	ExternalTransferEmployee,
	ExternalTransferRequest,
	InternalTransferRequest,
	TransferHistory,
} from "#web/types/employee-transfer.ts";

const BASE_URL = "/employees/transfer";

export const employeeTransferApi = {
	internalTransfer: (data: InternalTransferRequest) => api.post<Employee>(`${BASE_URL}/internal`, data),

	registerExternalTransfer: (data: ExternalTransferRequest) => api.post<Employee>(`${BASE_URL}/external`, data),

	getHistory: (employeeId: string) => api.get<TransferHistory>(`${BASE_URL}/history/${employeeId}`),

	getExternalTransfers: () => api.get<ExternalTransferEmployee[]>(`${BASE_URL}/external`),
} as const;

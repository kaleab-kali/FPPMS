import { api } from "#web/lib/api-client.ts";
import type {
	AcceptTransferDto,
	CancelTransferDto,
	CreateDepartureDto,
	CreateTransferRequestDto,
	EmployeeDeparture,
	RejectTransferDto,
	TransferRequest,
	TransferStatus,
	UpdateDepartureDto,
} from "#web/types/employee-transfer.ts";

const BASE_URL = "/employees/transfer";

export const employeeTransferApi = {
	createTransferRequest: (data: CreateTransferRequestDto) => api.post<TransferRequest>(`${BASE_URL}/request`, data),

	acceptTransfer: (transferId: string, data: AcceptTransferDto) =>
		api.post<TransferRequest>(`${BASE_URL}/${transferId}/accept`, data),

	rejectTransfer: (transferId: string, data: RejectTransferDto) =>
		api.post<TransferRequest>(`${BASE_URL}/${transferId}/reject`, data),

	cancelTransfer: (transferId: string, data: CancelTransferDto) =>
		api.post<TransferRequest>(`${BASE_URL}/${transferId}/cancel`, data),

	getTransferById: (transferId: string) => api.get<TransferRequest>(`${BASE_URL}/${transferId}`),

	getTransferHistory: (employeeId: string) => api.get<TransferRequest[]>(`${BASE_URL}/history/${employeeId}`),

	getPendingTransfersForCenter: (centerId: string) =>
		api.get<TransferRequest[]>(`${BASE_URL}/center/${centerId}/pending`),

	getOutgoingTransfersForCenter: (centerId: string) =>
		api.get<TransferRequest[]>(`${BASE_URL}/center/${centerId}/outgoing`),

	getAllTransfers: (status?: TransferStatus) =>
		api.get<TransferRequest[]>(`${BASE_URL}/all`, { params: status ? { status } : undefined }),

	createDeparture: (data: CreateDepartureDto) => api.post<EmployeeDeparture>(`${BASE_URL}/departure`, data),

	getDeparture: (employeeId: string) =>
		api.get<EmployeeDeparture | null>(`${BASE_URL}/departure/employee/${employeeId}`),

	getDepartureById: (departureId: string) => api.get<EmployeeDeparture>(`${BASE_URL}/departure/${departureId}`),

	getAllDepartures: () => api.get<EmployeeDeparture[]>(`${BASE_URL}/departure/all`),

	updateDeparture: (departureId: string, data: UpdateDepartureDto) =>
		api.put<EmployeeDeparture>(`${BASE_URL}/departure/${departureId}`, data),

	deleteDeparture: (departureId: string) => api.delete<{ message: string }>(`${BASE_URL}/departure/${departureId}`),
} as const;

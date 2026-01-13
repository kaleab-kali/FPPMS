import { api } from "#web/lib/api-client";
import type { PaginatedResponse } from "#web/types/api";
import type {
	AdjustCenterInventoryInput,
	CenterInventory,
	CenterInventoryFilter,
	CreateCenterInventoryInput,
	CreateInventoryAssignmentInput,
	InventoryAssignment,
	InventoryAssignmentFilter,
	ReturnInventoryInput,
	UpdateCenterInventoryInput,
	UpdateInventoryAssignmentInput,
} from "#web/types/inventory";

const BASE_URL = "/inventory";

export const inventoryApi = {
	getAssignments: (filter?: InventoryAssignmentFilter): Promise<PaginatedResponse<InventoryAssignment>> =>
		api.get(`${BASE_URL}/assignments`, { params: filter }),

	getAssignmentsByEmployee: (
		employeeId: string,
		filter?: InventoryAssignmentFilter,
	): Promise<PaginatedResponse<InventoryAssignment>> =>
		api.get(`${BASE_URL}/assignments/employee/${employeeId}`, { params: filter }),

	getOverdueAssignments: (filter?: InventoryAssignmentFilter): Promise<PaginatedResponse<InventoryAssignment>> =>
		api.get(`${BASE_URL}/assignments/overdue`, { params: filter }),

	getAssignmentById: (id: string): Promise<InventoryAssignment> => api.get(`${BASE_URL}/assignments/${id}`),

	createAssignment: (data: CreateInventoryAssignmentInput): Promise<InventoryAssignment> =>
		api.post(`${BASE_URL}/assignments`, data),

	updateAssignment: (id: string, data: UpdateInventoryAssignmentInput): Promise<InventoryAssignment> =>
		api.patch(`${BASE_URL}/assignments/${id}`, data),

	returnAssignment: (id: string, data: ReturnInventoryInput): Promise<InventoryAssignment> =>
		api.post(`${BASE_URL}/assignments/${id}/return`, data),

	getCenterStock: (filter?: CenterInventoryFilter): Promise<PaginatedResponse<CenterInventory>> =>
		api.get(`${BASE_URL}/center-stock`, { params: filter }),

	getCenterStockByCenter: (
		centerId: string,
		filter?: CenterInventoryFilter,
	): Promise<PaginatedResponse<CenterInventory>> =>
		api.get(`${BASE_URL}/center-stock/center/${centerId}`, { params: filter }),

	getLowStockItems: (filter?: CenterInventoryFilter): Promise<PaginatedResponse<CenterInventory>> =>
		api.get(`${BASE_URL}/center-stock/low-stock`, { params: filter }),

	getCenterStockById: (id: string): Promise<CenterInventory> => api.get(`${BASE_URL}/center-stock/${id}`),

	createCenterStock: (data: CreateCenterInventoryInput): Promise<CenterInventory> =>
		api.post(`${BASE_URL}/center-stock`, data),

	updateCenterStock: (id: string, data: UpdateCenterInventoryInput): Promise<CenterInventory> =>
		api.patch(`${BASE_URL}/center-stock/${id}`, data),

	adjustCenterStock: (id: string, data: AdjustCenterInventoryInput): Promise<CenterInventory> =>
		api.post(`${BASE_URL}/center-stock/${id}/adjust`, data),
};

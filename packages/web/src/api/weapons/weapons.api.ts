import { api } from "#web/lib/api-client";
import type { PaginatedResponse } from "#web/types/api";
import type {
	AdjustStockDto,
	AmmunitionFilter,
	AmmunitionTransaction,
	AmmunitionType,
	CenterAmmunitionStock,
	CreateAmmunitionTransactionDto,
	CreateAmmunitionTypeDto,
	CreateWeaponAssignmentDto,
	CreateWeaponCategoryDto,
	CreateWeaponDto,
	CreateWeaponTypeDto,
	ReturnWeaponDto,
	UpdateAmmunitionTypeDto,
	UpdateWeaponCategoryDto,
	UpdateWeaponDto,
	UpdateWeaponTypeDto,
	Weapon,
	WeaponAssignment,
	WeaponAssignmentFilter,
	WeaponCategory,
	WeaponFilter,
	WeaponType,
} from "#web/types/weapons";

const BASE_URL = "/weapons";
const AMMO_URL = "/ammunition";

export const weaponsApi = {
	// Weapon Categories
	getCategories: (filter?: { search?: string; isActive?: boolean }): Promise<PaginatedResponse<WeaponCategory>> =>
		api.get(`${BASE_URL}/categories`, { params: filter }),

	getCategoryById: (id: string): Promise<WeaponCategory> => api.get(`${BASE_URL}/categories/${id}`),

	createCategory: (data: CreateWeaponCategoryDto): Promise<WeaponCategory> => api.post(`${BASE_URL}/categories`, data),

	updateCategory: (id: string, data: UpdateWeaponCategoryDto): Promise<WeaponCategory> =>
		api.patch(`${BASE_URL}/categories/${id}`, data),

	deleteCategory: (id: string): Promise<void> => api.delete(`${BASE_URL}/categories/${id}`),

	// Weapon Types
	getTypes: (filter?: {
		search?: string;
		categoryId?: string;
		isActive?: boolean;
	}): Promise<PaginatedResponse<WeaponType>> => api.get(`${BASE_URL}/types`, { params: filter }),

	getTypeById: (id: string): Promise<WeaponType> => api.get(`${BASE_URL}/types/${id}`),

	createType: (data: CreateWeaponTypeDto): Promise<WeaponType> => api.post(`${BASE_URL}/types`, data),

	updateType: (id: string, data: UpdateWeaponTypeDto): Promise<WeaponType> =>
		api.patch(`${BASE_URL}/types/${id}`, data),

	deleteType: (id: string): Promise<void> => api.delete(`${BASE_URL}/types/${id}`),

	// Weapons
	getWeapons: (filter?: WeaponFilter): Promise<PaginatedResponse<Weapon>> => api.get(BASE_URL, { params: filter }),

	getWeaponById: (id: string): Promise<Weapon> => api.get(`${BASE_URL}/${id}`),

	createWeapon: (data: CreateWeaponDto): Promise<Weapon> => api.post(BASE_URL, data),

	updateWeapon: (id: string, data: UpdateWeaponDto): Promise<Weapon> => api.patch(`${BASE_URL}/${id}`, data),

	// Weapon Assignments
	assignWeapon: (data: CreateWeaponAssignmentDto): Promise<WeaponAssignment> =>
		api.post(`${BASE_URL}/assignments`, data),

	returnWeapon: (assignmentId: string, data: ReturnWeaponDto): Promise<WeaponAssignment> =>
		api.post(`${BASE_URL}/assignments/${assignmentId}/return`, data),

	getEmployeeWeaponAssignments: (
		employeeId: string,
		filter?: WeaponAssignmentFilter,
	): Promise<PaginatedResponse<WeaponAssignment>> =>
		api.get(`${BASE_URL}/assignments/employee/${employeeId}`, { params: filter }),

	getWeaponAssignmentHistory: (
		weaponId: string,
		filter?: WeaponAssignmentFilter,
	): Promise<PaginatedResponse<WeaponAssignment>> => api.get(`${BASE_URL}/${weaponId}/assignments`, { params: filter }),
};

export const ammunitionApi = {
	// Ammunition Types
	getTypes: (filter?: { search?: string; isActive?: boolean }): Promise<PaginatedResponse<AmmunitionType>> =>
		api.get(`${AMMO_URL}/types`, { params: filter }),

	getTypeById: (id: string): Promise<AmmunitionType> => api.get(`${AMMO_URL}/types/${id}`),

	createType: (data: CreateAmmunitionTypeDto): Promise<AmmunitionType> => api.post(`${AMMO_URL}/types`, data),

	updateType: (id: string, data: UpdateAmmunitionTypeDto): Promise<AmmunitionType> =>
		api.patch(`${AMMO_URL}/types/${id}`, data),

	deleteType: (id: string): Promise<void> => api.delete(`${AMMO_URL}/types/${id}`),

	// Center Ammunition Stock
	getStock: (filter?: AmmunitionFilter): Promise<PaginatedResponse<CenterAmmunitionStock>> =>
		api.get(`${AMMO_URL}/stock`, { params: filter }),

	getLowStockItems: (filter?: AmmunitionFilter): Promise<PaginatedResponse<CenterAmmunitionStock>> =>
		api.get(`${AMMO_URL}/stock/low-stock`, { params: filter }),

	getCenterStock: (centerId: string, filter?: AmmunitionFilter): Promise<PaginatedResponse<CenterAmmunitionStock>> =>
		api.get(`${AMMO_URL}/stock/center/${centerId}`, { params: filter }),

	adjustStock: (stockId: string, data: AdjustStockDto): Promise<CenterAmmunitionStock> =>
		api.post(`${AMMO_URL}/stock/${stockId}/adjust`, data),

	// Ammunition Transactions
	getTransactions: (filter?: AmmunitionFilter): Promise<PaginatedResponse<AmmunitionTransaction>> =>
		api.get(`${AMMO_URL}/transactions`, { params: filter }),

	getEmployeeTransactions: (
		employeeId: string,
		filter?: AmmunitionFilter,
	): Promise<PaginatedResponse<AmmunitionTransaction>> =>
		api.get(`${AMMO_URL}/transactions/employee/${employeeId}`, { params: filter }),

	createTransaction: (data: CreateAmmunitionTransactionDto): Promise<AmmunitionTransaction> =>
		api.post(`${AMMO_URL}/transactions`, data),
};

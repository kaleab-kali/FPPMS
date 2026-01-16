import { useQuery } from "@tanstack/react-query";
import type { AmmunitionFilter, WeaponAssignmentFilter, WeaponFilter } from "#web/types/weapons";
import { ammunitionApi, weaponsApi } from "./weapons.api";

export const weaponKeys = {
	all: ["weapons"] as const,
	categories: () => [...weaponKeys.all, "categories"] as const,
	categoriesList: (filter?: { search?: string; isActive?: boolean }) =>
		[...weaponKeys.categories(), "list", filter] as const,
	categoryDetail: (id: string) => [...weaponKeys.categories(), "detail", id] as const,
	types: () => [...weaponKeys.all, "types"] as const,
	typesList: (filter?: { search?: string; categoryId?: string; isActive?: boolean }) =>
		[...weaponKeys.types(), "list", filter] as const,
	typeDetail: (id: string) => [...weaponKeys.types(), "detail", id] as const,
	weapons: () => [...weaponKeys.all, "weapons"] as const,
	weaponsList: (filter?: WeaponFilter) => [...weaponKeys.weapons(), "list", filter] as const,
	weaponDetail: (id: string) => [...weaponKeys.weapons(), "detail", id] as const,
	weaponAssignments: (weaponId: string) => [...weaponKeys.weapons(), weaponId, "assignments"] as const,
	assignments: () => [...weaponKeys.all, "assignments"] as const,
	employeeAssignments: (employeeId: string, filter?: WeaponAssignmentFilter) =>
		[...weaponKeys.assignments(), "employee", employeeId, filter] as const,
} as const;

export const ammunitionKeys = {
	all: ["ammunition"] as const,
	types: () => [...ammunitionKeys.all, "types"] as const,
	typesList: (filter?: { search?: string; isActive?: boolean }) => [...ammunitionKeys.types(), "list", filter] as const,
	typeDetail: (id: string) => [...ammunitionKeys.types(), "detail", id] as const,
	stock: () => [...ammunitionKeys.all, "stock"] as const,
	stockList: (filter?: AmmunitionFilter) => [...ammunitionKeys.stock(), "list", filter] as const,
	lowStock: (filter?: AmmunitionFilter) => [...ammunitionKeys.stock(), "low-stock", filter] as const,
	centerStock: (centerId: string, filter?: AmmunitionFilter) =>
		[...ammunitionKeys.stock(), "center", centerId, filter] as const,
	transactions: () => [...ammunitionKeys.all, "transactions"] as const,
	transactionsList: (filter?: AmmunitionFilter) => [...ammunitionKeys.transactions(), "list", filter] as const,
	employeeTransactions: (employeeId: string, filter?: AmmunitionFilter) =>
		[...ammunitionKeys.transactions(), "employee", employeeId, filter] as const,
} as const;

// Weapon Categories - extract data array from paginated response
export const useWeaponCategories = (filter?: { search?: string; isActive?: boolean }) =>
	useQuery({
		queryKey: weaponKeys.categoriesList(filter),
		queryFn: async () => {
			const response = await weaponsApi.getCategories(filter);
			return response?.data ?? [];
		},
	});

export const useWeaponCategory = (id: string, enabled = true) =>
	useQuery({
		queryKey: weaponKeys.categoryDetail(id),
		queryFn: () => weaponsApi.getCategoryById(id),
		enabled: enabled && !!id,
	});

// Weapon Types - extract data array from paginated response
export const useWeaponTypes = (filter?: { search?: string; categoryId?: string; isActive?: boolean }) =>
	useQuery({
		queryKey: weaponKeys.typesList(filter),
		queryFn: async () => {
			const response = await weaponsApi.getTypes(filter);
			return response?.data ?? [];
		},
	});

export const useWeaponType = (id: string, enabled = true) =>
	useQuery({
		queryKey: weaponKeys.typeDetail(id),
		queryFn: () => weaponsApi.getTypeById(id),
		enabled: enabled && !!id,
	});

// Weapons
export const useWeapons = (filter?: WeaponFilter) =>
	useQuery({
		queryKey: weaponKeys.weaponsList(filter),
		queryFn: () => weaponsApi.getWeapons(filter),
	});

export const useWeapon = (id: string, enabled = true) =>
	useQuery({
		queryKey: weaponKeys.weaponDetail(id),
		queryFn: () => weaponsApi.getWeaponById(id),
		enabled: enabled && !!id,
	});

// Weapon Assignments
export const useEmployeeWeaponAssignments = (employeeId: string, filter?: WeaponAssignmentFilter, enabled = true) =>
	useQuery({
		queryKey: weaponKeys.employeeAssignments(employeeId, filter),
		queryFn: () => weaponsApi.getEmployeeWeaponAssignments(employeeId, filter),
		enabled: enabled && !!employeeId,
	});

export const useWeaponAssignmentHistory = (weaponId: string, filter?: WeaponAssignmentFilter, enabled = true) =>
	useQuery({
		queryKey: weaponKeys.weaponAssignments(weaponId),
		queryFn: () => weaponsApi.getWeaponAssignmentHistory(weaponId, filter),
		enabled: enabled && !!weaponId,
	});

// Ammunition Types - extract data array from paginated response
export const useAmmunitionTypes = (filter?: { search?: string; isActive?: boolean }) =>
	useQuery({
		queryKey: ammunitionKeys.typesList(filter),
		queryFn: async () => {
			const response = await ammunitionApi.getTypes(filter);
			return response?.data ?? [];
		},
	});

export const useAmmunitionType = (id: string, enabled = true) =>
	useQuery({
		queryKey: ammunitionKeys.typeDetail(id),
		queryFn: () => ammunitionApi.getTypeById(id),
		enabled: enabled && !!id,
	});

// Center Ammunition Stock
export const useAmmunitionStock = (filter?: AmmunitionFilter) =>
	useQuery({
		queryKey: ammunitionKeys.stockList(filter),
		queryFn: () => ammunitionApi.getStock(filter),
	});

export const useLowAmmunitionStock = (filter?: AmmunitionFilter) =>
	useQuery({
		queryKey: ammunitionKeys.lowStock(filter),
		queryFn: () => ammunitionApi.getLowStockItems(filter),
	});

export const useCenterAmmunitionStock = (centerId: string, filter?: AmmunitionFilter, enabled = true) =>
	useQuery({
		queryKey: ammunitionKeys.centerStock(centerId, filter),
		queryFn: () => ammunitionApi.getCenterStock(centerId, filter),
		enabled: enabled && !!centerId,
	});

// Ammunition Transactions
export const useAmmunitionTransactions = (filter?: AmmunitionFilter) =>
	useQuery({
		queryKey: ammunitionKeys.transactionsList(filter),
		queryFn: () => ammunitionApi.getTransactions(filter),
	});

export const useEmployeeAmmunitionTransactions = (employeeId: string, filter?: AmmunitionFilter, enabled = true) =>
	useQuery({
		queryKey: ammunitionKeys.employeeTransactions(employeeId, filter),
		queryFn: () => ammunitionApi.getEmployeeTransactions(employeeId, filter),
		enabled: enabled && !!employeeId,
	});

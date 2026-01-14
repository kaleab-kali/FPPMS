import { useQuery } from "@tanstack/react-query";
import type { CenterInventoryFilter, InventoryAssignmentFilter } from "#web/types/inventory";
import { inventoryApi } from "./inventory.api";

export const inventoryKeys = {
	all: ["inventory"] as const,
	assignments: () => [...inventoryKeys.all, "assignments"] as const,
	assignmentsList: (filter?: InventoryAssignmentFilter) => [...inventoryKeys.assignments(), "list", filter] as const,
	assignmentsByEmployee: (employeeId: string, filter?: InventoryAssignmentFilter) =>
		[...inventoryKeys.assignments(), "employee", employeeId, filter] as const,
	overdueAssignments: (filter?: InventoryAssignmentFilter) =>
		[...inventoryKeys.assignments(), "overdue", filter] as const,
	assignmentDetail: (id: string) => [...inventoryKeys.assignments(), "detail", id] as const,
	centerStock: () => [...inventoryKeys.all, "center-stock"] as const,
	centerStockList: (filter?: CenterInventoryFilter) => [...inventoryKeys.centerStock(), "list", filter] as const,
	centerStockByCenter: (centerId: string, filter?: CenterInventoryFilter) =>
		[...inventoryKeys.centerStock(), "center", centerId, filter] as const,
	lowStockItems: (filter?: CenterInventoryFilter) => [...inventoryKeys.centerStock(), "low-stock", filter] as const,
	centerStockDetail: (id: string) => [...inventoryKeys.centerStock(), "detail", id] as const,
} as const;

export const useInventoryAssignments = (filter?: InventoryAssignmentFilter) =>
	useQuery({
		queryKey: inventoryKeys.assignmentsList(filter),
		queryFn: () => inventoryApi.getAssignments(filter),
	});

export const useEmployeeInventoryAssignments = (
	employeeId: string,
	filter?: InventoryAssignmentFilter,
	enabled = true,
) =>
	useQuery({
		queryKey: inventoryKeys.assignmentsByEmployee(employeeId, filter),
		queryFn: () => inventoryApi.getAssignmentsByEmployee(employeeId, filter),
		enabled: enabled && !!employeeId,
	});

export const useOverdueInventoryAssignments = (filter?: InventoryAssignmentFilter) =>
	useQuery({
		queryKey: inventoryKeys.overdueAssignments(filter),
		queryFn: () => inventoryApi.getOverdueAssignments(filter),
	});

export const useInventoryAssignment = (id: string, enabled = true) =>
	useQuery({
		queryKey: inventoryKeys.assignmentDetail(id),
		queryFn: () => inventoryApi.getAssignmentById(id),
		enabled: enabled && !!id,
	});

export const useCenterStock = (filter?: CenterInventoryFilter) =>
	useQuery({
		queryKey: inventoryKeys.centerStockList(filter),
		queryFn: () => inventoryApi.getCenterStock(filter),
	});

export const useCenterStockByCenter = (centerId: string, filter?: CenterInventoryFilter, enabled = true) =>
	useQuery({
		queryKey: inventoryKeys.centerStockByCenter(centerId, filter),
		queryFn: () => inventoryApi.getCenterStockByCenter(centerId, filter),
		enabled: enabled && !!centerId,
	});

export const useLowStockItems = (filter?: CenterInventoryFilter) =>
	useQuery({
		queryKey: inventoryKeys.lowStockItems(filter),
		queryFn: () => inventoryApi.getLowStockItems(filter),
	});

export const useCenterStockDetail = (id: string, enabled = true) =>
	useQuery({
		queryKey: inventoryKeys.centerStockDetail(id),
		queryFn: () => inventoryApi.getCenterStockById(id),
		enabled: enabled && !!id,
	});

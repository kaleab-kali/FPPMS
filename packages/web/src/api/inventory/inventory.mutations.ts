import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
	AdjustCenterInventoryInput,
	CreateCenterInventoryInput,
	CreateInventoryAssignmentInput,
	ReturnInventoryInput,
	UpdateCenterInventoryInput,
	UpdateInventoryAssignmentInput,
} from "#web/types/inventory";
import { inventoryApi } from "./inventory.api";
import { inventoryKeys } from "./inventory.queries";

export const useCreateInventoryAssignment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateInventoryAssignmentInput) => inventoryApi.createAssignment(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: inventoryKeys.assignments() });
			queryClient.invalidateQueries({ queryKey: inventoryKeys.centerStock() });
		},
	});
};

export const useUpdateInventoryAssignment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateInventoryAssignmentInput }) =>
			inventoryApi.updateAssignment(id, data),
		onSuccess: (_, { id }) => {
			queryClient.invalidateQueries({ queryKey: inventoryKeys.assignments() });
			queryClient.invalidateQueries({ queryKey: inventoryKeys.assignmentDetail(id) });
		},
	});
};

export const useReturnInventoryAssignment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: ReturnInventoryInput }) => inventoryApi.returnAssignment(id, data),
		onSuccess: (_, { id }) => {
			queryClient.invalidateQueries({ queryKey: inventoryKeys.assignments() });
			queryClient.invalidateQueries({ queryKey: inventoryKeys.assignmentDetail(id) });
			queryClient.invalidateQueries({ queryKey: inventoryKeys.centerStock() });
		},
	});
};

export const useCreateCenterStock = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateCenterInventoryInput) => inventoryApi.createCenterStock(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: inventoryKeys.centerStock() });
		},
	});
};

export const useUpdateCenterStock = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateCenterInventoryInput }) =>
			inventoryApi.updateCenterStock(id, data),
		onSuccess: (_, { id }) => {
			queryClient.invalidateQueries({ queryKey: inventoryKeys.centerStock() });
			queryClient.invalidateQueries({ queryKey: inventoryKeys.centerStockDetail(id) });
		},
	});
};

export const useAdjustCenterStock = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: AdjustCenterInventoryInput }) =>
			inventoryApi.adjustCenterStock(id, data),
		onSuccess: (_, { id }) => {
			queryClient.invalidateQueries({ queryKey: inventoryKeys.centerStock() });
			queryClient.invalidateQueries({ queryKey: inventoryKeys.centerStockDetail(id) });
		},
	});
};

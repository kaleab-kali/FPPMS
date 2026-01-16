import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
	AdjustStockDto,
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
} from "#web/types/weapons";
import { ammunitionApi, weaponsApi } from "./weapons.api";
import { ammunitionKeys, weaponKeys } from "./weapons.queries";

// Weapon Category Mutations
export const useCreateWeaponCategory = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateWeaponCategoryDto) => weaponsApi.createCategory(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: weaponKeys.categories() });
		},
	});
};

export const useUpdateWeaponCategory = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateWeaponCategoryDto }) => weaponsApi.updateCategory(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: weaponKeys.categories() });
		},
	});
};

export const useDeleteWeaponCategory = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => weaponsApi.deleteCategory(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: weaponKeys.categories() });
		},
	});
};

// Weapon Type Mutations
export const useCreateWeaponType = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateWeaponTypeDto) => weaponsApi.createType(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: weaponKeys.types() });
		},
	});
};

export const useUpdateWeaponType = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateWeaponTypeDto }) => weaponsApi.updateType(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: weaponKeys.types() });
		},
	});
};

export const useDeleteWeaponType = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => weaponsApi.deleteType(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: weaponKeys.types() });
		},
	});
};

// Weapon Mutations
export const useCreateWeapon = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateWeaponDto) => weaponsApi.createWeapon(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: weaponKeys.weapons() });
		},
	});
};

export const useUpdateWeapon = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateWeaponDto }) => weaponsApi.updateWeapon(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: weaponKeys.weapons() });
		},
	});
};

// Weapon Assignment Mutations
export const useAssignWeapon = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateWeaponAssignmentDto) => weaponsApi.assignWeapon(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: weaponKeys.all });
		},
	});
};

export const useReturnWeapon = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ assignmentId, data }: { assignmentId: string; data: ReturnWeaponDto }) =>
			weaponsApi.returnWeapon(assignmentId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: weaponKeys.all });
		},
	});
};

// Ammunition Type Mutations
export const useCreateAmmunitionType = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateAmmunitionTypeDto) => ammunitionApi.createType(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ammunitionKeys.types() });
		},
	});
};

export const useUpdateAmmunitionType = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateAmmunitionTypeDto }) => ammunitionApi.updateType(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ammunitionKeys.types() });
		},
	});
};

export const useDeleteAmmunitionType = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => ammunitionApi.deleteType(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ammunitionKeys.types() });
		},
	});
};

// Ammunition Stock Mutations
export const useAdjustAmmunitionStock = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ stockId, data }: { stockId: string; data: AdjustStockDto }) =>
			ammunitionApi.adjustStock(stockId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ammunitionKeys.stock() });
		},
	});
};

// Ammunition Transaction Mutations
export const useCreateAmmunitionTransaction = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateAmmunitionTransactionDto) => ammunitionApi.createTransaction(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ammunitionKeys.all });
		},
	});
};

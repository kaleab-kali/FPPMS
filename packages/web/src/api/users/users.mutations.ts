import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "#web/api/users/users.api.ts";
import { userKeys } from "#web/api/users/users.queries.ts";
import type { CreateUserFromEmployeeRequest, CreateUserRequest, UpdateUserRequest } from "#web/types/user.ts";

export const useCreateUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateUserRequest) => usersApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: userKeys.all });
		},
	});
};

export const useCreateUserFromEmployee = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateUserFromEmployeeRequest) => usersApi.createFromEmployee(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: userKeys.all });
			queryClient.invalidateQueries({ queryKey: userKeys.availableEmployees() });
		},
	});
};

export const useUpdateUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) => usersApi.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: userKeys.all });
		},
	});
};

export const useDeleteUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => usersApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: userKeys.all });
		},
	});
};

export const useUnlockUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => usersApi.unlock(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: userKeys.all });
		},
	});
};

export const useResetPassword = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => usersApi.resetPassword(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: userKeys.all });
		},
	});
};

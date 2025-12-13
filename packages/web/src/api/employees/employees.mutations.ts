import { useMutation, useQueryClient } from "@tanstack/react-query";
import { employeesApi } from "#web/api/employees/employees.api.ts";
import { employeeKeys } from "#web/api/employees/employees.queries.ts";
import type {
	ChangeStatusRequest,
	CreateCivilianEmployeeRequest,
	CreateMilitaryEmployeeRequest,
	CreateTemporaryEmployeeRequest,
	UpdateEmployeeRequest,
} from "#web/types/employee.ts";

export const useCreateMilitaryEmployee = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateMilitaryEmployeeRequest) => employeesApi.createMilitary(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: employeeKeys.all });
		},
	});
};

export const useCreateCivilianEmployee = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateCivilianEmployeeRequest) => employeesApi.createCivilian(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: employeeKeys.all });
		},
	});
};

export const useCreateTemporaryEmployee = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateTemporaryEmployeeRequest) => employeesApi.createTemporary(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: employeeKeys.all });
		},
	});
};

export const useUpdateEmployee = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeRequest }) => employeesApi.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: employeeKeys.all });
		},
	});
};

export const useDeleteEmployee = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => employeesApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: employeeKeys.all });
		},
	});
};

export const useChangeEmployeeStatus = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: ChangeStatusRequest }) => employeesApi.changeStatus(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: employeeKeys.all });
		},
	});
};

export const useReturnToActive = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => employeesApi.returnToActive(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: employeeKeys.all });
		},
	});
};

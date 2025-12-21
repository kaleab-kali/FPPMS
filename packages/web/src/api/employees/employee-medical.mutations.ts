import { useMutation, useQueryClient } from "@tanstack/react-query";
import { employeeMedicalApi } from "#web/api/employees/employee-medical.api.ts";
import { employeeMedicalKeys } from "#web/api/employees/employee-medical.queries.ts";
import type { CreateMedicalRecordRequest, UpdateMedicalRecordRequest } from "#web/types/employee-medical.ts";

export const useCreateMedicalRecord = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateMedicalRecordRequest) => employeeMedicalApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: employeeMedicalKeys.all });
		},
	});
};

export const useUpdateMedicalRecord = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateMedicalRecordRequest }) => employeeMedicalApi.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: employeeMedicalKeys.all });
		},
	});
};

export const useDeleteMedicalRecord = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => employeeMedicalApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: employeeMedicalKeys.all });
		},
	});
};

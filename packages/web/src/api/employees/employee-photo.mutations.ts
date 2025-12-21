import { useMutation, useQueryClient } from "@tanstack/react-query";
import { employeePhotoApi } from "#web/api/employees/employee-photo.api.ts";
import { employeePhotoKeys } from "#web/api/employees/employee-photo.queries.ts";
import type { CreateEmployeePhotoRequest } from "#web/types/employee-photo.ts";

export const useUploadPhoto = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ data, file }: { data: CreateEmployeePhotoRequest; file: File }) =>
			employeePhotoApi.upload(data, file),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: employeePhotoKeys.all });
		},
	});
};

export const useDeletePhoto = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => employeePhotoApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: employeePhotoKeys.all });
		},
	});
};

import { useQuery } from "@tanstack/react-query";
import { employeePhotoApi } from "#web/api/employees/employee-photo.api.ts";

export const employeePhotoKeys = {
	all: ["employee-photos"] as const,
	active: (employeeId: string) => [...employeePhotoKeys.all, "active", employeeId] as const,
	history: (employeeId: string) => [...employeePhotoKeys.all, "history", employeeId] as const,
} as const;

export const useActivePhoto = (employeeId: string) =>
	useQuery({
		queryKey: employeePhotoKeys.active(employeeId),
		queryFn: () => employeePhotoApi.getActiveByEmployee(employeeId),
		enabled: !!employeeId,
	});

export const usePhotoHistory = (employeeId: string) =>
	useQuery({
		queryKey: employeePhotoKeys.history(employeeId),
		queryFn: () => employeePhotoApi.getPhotoHistory(employeeId),
		enabled: !!employeeId,
	});

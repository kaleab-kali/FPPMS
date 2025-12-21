import { useQuery } from "@tanstack/react-query";
import { employeeMedicalApi } from "#web/api/employees/employee-medical.api.ts";

export const employeeMedicalKeys = {
	all: ["employee-medical"] as const,
	byEmployee: (employeeId: string) => [...employeeMedicalKeys.all, "employee", employeeId] as const,
	stats: (employeeId: string) => [...employeeMedicalKeys.all, "stats", employeeId] as const,
	eligibleFamily: (employeeId: string) => [...employeeMedicalKeys.all, "eligible-family", employeeId] as const,
	detail: (id: string) => [...employeeMedicalKeys.all, "detail", id] as const,
} as const;

export const useMedicalRecords = (employeeId: string) =>
	useQuery({
		queryKey: employeeMedicalKeys.byEmployee(employeeId),
		queryFn: () => employeeMedicalApi.getByEmployee(employeeId),
		enabled: !!employeeId,
	});

export const useMedicalStats = (employeeId: string) =>
	useQuery({
		queryKey: employeeMedicalKeys.stats(employeeId),
		queryFn: () => employeeMedicalApi.getStats(employeeId),
		enabled: !!employeeId,
	});

export const useEligibleFamilyMembers = (employeeId: string) =>
	useQuery({
		queryKey: employeeMedicalKeys.eligibleFamily(employeeId),
		queryFn: () => employeeMedicalApi.getEligibleFamily(employeeId),
		enabled: !!employeeId,
	});

export const useMedicalRecord = (id: string) =>
	useQuery({
		queryKey: employeeMedicalKeys.detail(id),
		queryFn: () => employeeMedicalApi.getById(id),
		enabled: !!id,
	});

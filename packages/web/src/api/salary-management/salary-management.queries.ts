import { useQuery } from "@tanstack/react-query";
import { salaryManagementApi } from "#web/api/salary-management/salary-management.api.ts";
import type { SalaryEligibilityQuery, SalaryHistoryQuery } from "#web/types/salary-management.ts";

export const salaryManagementKeys = {
	all: ["salary-management"] as const,
	eligibility: () => [...salaryManagementKeys.all, "eligibility"] as const,
	eligibilityList: (query: SalaryEligibilityQuery) => [...salaryManagementKeys.eligibility(), "list", query] as const,
	eligibilityToday: () => [...salaryManagementKeys.eligibility(), "today"] as const,
	eligibilitySummary: () => [...salaryManagementKeys.eligibility(), "summary"] as const,
	employeeHistory: (employeeId: string, query: SalaryHistoryQuery) =>
		[...salaryManagementKeys.all, "history", employeeId, query] as const,
	employeeProjection: (employeeId: string) => [...salaryManagementKeys.all, "projection", employeeId] as const,
	stepDistribution: (centerId?: string) => [...salaryManagementKeys.all, "step-distribution", centerId] as const,
	rankSteps: (rankId: string) => [...salaryManagementKeys.all, "rank-steps", rankId] as const,
} as const;

export const useEligibilityList = (query: SalaryEligibilityQuery = {}) =>
	useQuery({
		queryKey: salaryManagementKeys.eligibilityList(query),
		queryFn: () => salaryManagementApi.getEligibilityList(query),
	});

export const useTodayEligibility = () =>
	useQuery({
		queryKey: salaryManagementKeys.eligibilityToday(),
		queryFn: () => salaryManagementApi.getTodayEligibility(),
	});

export const useEligibilitySummary = () =>
	useQuery({
		queryKey: salaryManagementKeys.eligibilitySummary(),
		queryFn: () => salaryManagementApi.getEligibilitySummary(),
	});

export const useEmployeeSalaryHistory = (employeeId: string, query: SalaryHistoryQuery = {}, enabled = true) =>
	useQuery({
		queryKey: salaryManagementKeys.employeeHistory(employeeId, query),
		queryFn: () => salaryManagementApi.getEmployeeSalaryHistory(employeeId, query),
		enabled: enabled && !!employeeId,
	});

export const useEmployeeSalaryProjection = (employeeId: string, enabled = true) =>
	useQuery({
		queryKey: salaryManagementKeys.employeeProjection(employeeId),
		queryFn: () => salaryManagementApi.getEmployeeSalaryProjection(employeeId),
		enabled: enabled && !!employeeId,
	});

export const useStepDistributionReport = (centerId?: string) =>
	useQuery({
		queryKey: salaryManagementKeys.stepDistribution(centerId),
		queryFn: () => salaryManagementApi.getStepDistributionReport(centerId),
	});

export const useRankSalarySteps = (rankId: string, enabled = true) =>
	useQuery({
		queryKey: salaryManagementKeys.rankSteps(rankId),
		queryFn: () => salaryManagementApi.getRankSalarySteps(rankId),
		enabled: enabled && !!rankId,
	});

import { useQuery } from "@tanstack/react-query";
import { salaryScaleApi } from "#web/api/salary-scale/salary-scale.api.ts";
import type { SalaryScaleStatus } from "#web/types/salary-scale.ts";

export const salaryScaleKeys = {
	all: ["salary-scales"] as const,
	lists: () => [...salaryScaleKeys.all, "list"] as const,
	list: (status?: SalaryScaleStatus) => [...salaryScaleKeys.lists(), { status }] as const,
	details: () => [...salaryScaleKeys.all, "detail"] as const,
	detail: (id: string) => [...salaryScaleKeys.details(), id] as const,
	active: () => [...salaryScaleKeys.all, "active"] as const,
	rankSalary: (scaleId: string, rankCode: string) =>
		[...salaryScaleKeys.all, "rank-salary", scaleId, rankCode] as const,
} as const;

export const useSalaryScales = (status?: SalaryScaleStatus) =>
	useQuery({
		queryKey: salaryScaleKeys.list(status),
		queryFn: () => salaryScaleApi.getAll(status),
	});

export const useSalaryScale = (id: string) =>
	useQuery({
		queryKey: salaryScaleKeys.detail(id),
		queryFn: () => salaryScaleApi.getById(id),
		enabled: !!id,
	});

export const useActiveSalaryScale = () =>
	useQuery({
		queryKey: salaryScaleKeys.active(),
		queryFn: () => salaryScaleApi.getActive(),
	});

export const useRankSalary = (scaleId: string, rankCode: string) =>
	useQuery({
		queryKey: salaryScaleKeys.rankSalary(scaleId, rankCode),
		queryFn: () => salaryScaleApi.getRankSalary(scaleId, rankCode),
		enabled: !!scaleId && !!rankCode,
	});

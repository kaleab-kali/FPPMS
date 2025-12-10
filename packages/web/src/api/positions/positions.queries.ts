import { useQuery } from "@tanstack/react-query";
import { positionsApi } from "#web/api/positions/positions.api.ts";

export const positionKeys = {
	all: ["positions"] as const,
	lists: () => [...positionKeys.all, "list"] as const,
	list: (departmentId?: string) => [...positionKeys.lists(), departmentId] as const,
	details: () => [...positionKeys.all, "detail"] as const,
	detail: (id: string) => [...positionKeys.details(), id] as const,
} as const;

export const usePositions = (departmentId?: string) =>
	useQuery({
		queryKey: positionKeys.list(departmentId),
		queryFn: () => positionsApi.getAll(departmentId),
	});

export const usePosition = (id: string) =>
	useQuery({
		queryKey: positionKeys.detail(id),
		queryFn: () => positionsApi.getById(id),
		enabled: !!id,
	});

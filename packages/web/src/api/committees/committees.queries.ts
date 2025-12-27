import { useQuery } from "@tanstack/react-query";
import { committeesApi } from "#web/api/committees/committees.api.ts";
import type { CommitteeFilterParams } from "#web/types/committee.ts";

export const committeeKeys = {
	all: ["committees"] as const,
	types: () => [...committeeKeys.all, "types"] as const,
	typesList: (includeInactive?: boolean) => [...committeeKeys.types(), "list", { includeInactive }] as const,
	typeDetail: (id: string) => [...committeeKeys.types(), "detail", id] as const,
	lists: () => [...committeeKeys.all, "list"] as const,
	list: (params?: CommitteeFilterParams) => [...committeeKeys.lists(), params] as const,
	details: () => [...committeeKeys.all, "detail"] as const,
	detail: (id: string, includeMembers?: boolean) => [...committeeKeys.details(), id, { includeMembers }] as const,
	members: (committeeId: string, includeInactive?: boolean) =>
		[...committeeKeys.all, "members", committeeId, { includeInactive }] as const,
	history: (committeeId: string) => [...committeeKeys.all, "history", committeeId] as const,
	employeeCommittees: (employeeId: string, includeInactive?: boolean) =>
		[...committeeKeys.all, "employee", employeeId, { includeInactive }] as const,
} as const;

export const useCommitteeTypes = (includeInactive = false) =>
	useQuery({
		queryKey: committeeKeys.typesList(includeInactive),
		queryFn: () => committeesApi.getTypes(includeInactive),
	});

export const useCommitteeType = (id: string) =>
	useQuery({
		queryKey: committeeKeys.typeDetail(id),
		queryFn: () => committeesApi.getTypeById(id),
		enabled: !!id,
	});

export const useCommittees = (params?: CommitteeFilterParams) =>
	useQuery({
		queryKey: committeeKeys.list(params),
		queryFn: () => committeesApi.getAll(params),
	});

export const useCommittee = (id: string, includeMembers = false) =>
	useQuery({
		queryKey: committeeKeys.detail(id, includeMembers),
		queryFn: () => committeesApi.getById(id, includeMembers),
		enabled: !!id,
	});

export const useCommitteeMembers = (committeeId: string, includeInactive = false) =>
	useQuery({
		queryKey: committeeKeys.members(committeeId, includeInactive),
		queryFn: () => committeesApi.getMembers(committeeId, includeInactive),
		enabled: !!committeeId,
	});

export const useCommitteeHistory = (committeeId: string) =>
	useQuery({
		queryKey: committeeKeys.history(committeeId),
		queryFn: () => committeesApi.getHistory(committeeId),
		enabled: !!committeeId,
	});

export const useEmployeeCommittees = (employeeId: string, includeInactive = false) =>
	useQuery({
		queryKey: committeeKeys.employeeCommittees(employeeId, includeInactive),
		queryFn: () => committeesApi.getEmployeeCommittees(employeeId, includeInactive),
		enabled: !!employeeId,
	});

export const useMyCommittees = (includeInactive = false) =>
	useQuery({
		queryKey: [...committeeKeys.all, "my-committees", { includeInactive }] as const,
		queryFn: () => committeesApi.getMyCommittees(includeInactive),
	});

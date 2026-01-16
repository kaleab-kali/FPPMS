import { useQuery } from "@tanstack/react-query";
import type { CorrespondenceFilter, DocumentDirection } from "#web/types/correspondence";
import { correspondenceApi } from "./correspondence.api";

export const correspondenceKeys = {
	all: ["correspondence"] as const,
	documentTypes: (direction?: DocumentDirection) => [...correspondenceKeys.all, "document-types", direction] as const,
	lists: () => [...correspondenceKeys.all, "list"] as const,
	list: (filter?: CorrespondenceFilter) => [...correspondenceKeys.lists(), filter] as const,
	incoming: (filter?: CorrespondenceFilter) => [...correspondenceKeys.all, "incoming", filter] as const,
	outgoing: (filter?: CorrespondenceFilter) => [...correspondenceKeys.all, "outgoing", filter] as const,
	overdue: (filter?: CorrespondenceFilter) => [...correspondenceKeys.all, "overdue", filter] as const,
	employee: (employeeId: string, filter?: CorrespondenceFilter) =>
		[...correspondenceKeys.all, "employee", employeeId, filter] as const,
	details: () => [...correspondenceKeys.all, "detail"] as const,
	detail: (id: string) => [...correspondenceKeys.details(), id] as const,
};

export const useDocumentTypes = (direction?: DocumentDirection) =>
	useQuery({
		queryKey: correspondenceKeys.documentTypes(direction),
		queryFn: () => correspondenceApi.getDocumentTypes(direction),
	});

export const useCorrespondenceList = (filter?: CorrespondenceFilter) =>
	useQuery({
		queryKey: correspondenceKeys.list(filter),
		queryFn: () => correspondenceApi.getAll(filter),
	});

export const useIncomingDocuments = (filter?: CorrespondenceFilter) =>
	useQuery({
		queryKey: correspondenceKeys.incoming(filter),
		queryFn: () => correspondenceApi.getIncoming(filter),
	});

export const useOutgoingDocuments = (filter?: CorrespondenceFilter) =>
	useQuery({
		queryKey: correspondenceKeys.outgoing(filter),
		queryFn: () => correspondenceApi.getOutgoing(filter),
	});

export const useOverdueDocuments = (filter?: CorrespondenceFilter) =>
	useQuery({
		queryKey: correspondenceKeys.overdue(filter),
		queryFn: () => correspondenceApi.getOverdue(filter),
	});

export const useEmployeeCorrespondence = (employeeId: string, filter?: CorrespondenceFilter) =>
	useQuery({
		queryKey: correspondenceKeys.employee(employeeId, filter),
		queryFn: () => correspondenceApi.getByEmployee(employeeId, filter),
		enabled: !!employeeId,
	});

export const useCorrespondenceDetail = (id: string) =>
	useQuery({
		queryKey: correspondenceKeys.detail(id),
		queryFn: () => correspondenceApi.getById(id),
		enabled: !!id,
	});

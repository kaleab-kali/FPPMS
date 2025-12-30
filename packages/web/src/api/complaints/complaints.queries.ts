import { useQuery } from "@tanstack/react-query";
import { complaintsApi } from "#web/api/complaints/complaints.api.ts";
import type { ComplaintFilterParams } from "#web/types/complaint.ts";

export const complaintKeys = {
	all: ["complaints"] as const,
	lists: () => [...complaintKeys.all, "list"] as const,
	list: (params?: ComplaintFilterParams) => [...complaintKeys.lists(), params] as const,
	details: () => [...complaintKeys.all, "detail"] as const,
	detail: (id: string) => [...complaintKeys.details(), id] as const,
	timeline: (id: string) => [...complaintKeys.all, "timeline", id] as const,
	employeeHistory: (employeeId: string) => [...complaintKeys.all, "employee", employeeId] as const,
	committee: (committeeId: string, type: "assigned" | "hq") =>
		[...complaintKeys.all, "committee", committeeId, type] as const,
} as const;

export const useComplaints = (params?: ComplaintFilterParams) =>
	useQuery({
		queryKey: complaintKeys.list(params),
		queryFn: () => complaintsApi.getAll(params),
	});

export const useComplaint = (id: string) =>
	useQuery({
		queryKey: complaintKeys.detail(id),
		queryFn: () => complaintsApi.getById(id),
		enabled: !!id,
	});

export const useComplaintTimeline = (id: string) =>
	useQuery({
		queryKey: complaintKeys.timeline(id),
		queryFn: () => complaintsApi.getTimeline(id),
		enabled: !!id,
	});

export const useEmployeeComplaintHistory = (employeeId: string) =>
	useQuery({
		queryKey: complaintKeys.employeeHistory(employeeId),
		queryFn: () => complaintsApi.getEmployeeHistory(employeeId),
		enabled: !!employeeId,
	});

export const useCommitteeComplaints = (committeeId: string, type: "assigned" | "hq" = "assigned") =>
	useQuery({
		queryKey: complaintKeys.committee(committeeId, type),
		queryFn: () => complaintsApi.getByCommittee(committeeId, type),
		enabled: !!committeeId,
	});

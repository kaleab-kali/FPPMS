import { useQuery } from "@tanstack/react-query";
import { auditLogApi } from "#web/api/audit-log/audit-log.api.ts";
import type { AuditLogFilter } from "#web/types/audit-log.ts";

const STALE_TIME_CONFIG = {
	list: 5 * 60 * 1000,
	detail: 10 * 60 * 1000,
	loginHistory: 5 * 60 * 1000,
} as const;

export const auditLogKeys = {
	all: ["audit-logs"] as const,
	lists: () => [...auditLogKeys.all, "list"] as const,
	list: (filter: AuditLogFilter) => [...auditLogKeys.lists(), filter] as const,
	details: () => [...auditLogKeys.all, "detail"] as const,
	detail: (id: string) => [...auditLogKeys.details(), id] as const,
	loginHistory: () => [...auditLogKeys.all, "login-history"] as const,
	loginHistoryList: (filter: AuditLogFilter) => [...auditLogKeys.loginHistory(), filter] as const,
	byUser: (userId: string) => [...auditLogKeys.all, "user", userId] as const,
	byUserList: (userId: string, filter: AuditLogFilter) => [...auditLogKeys.byUser(userId), filter] as const,
	userLoginHistory: (userId: string) => [...auditLogKeys.all, "user-login-history", userId] as const,
	userLoginHistoryList: (userId: string, filter: AuditLogFilter) =>
		[...auditLogKeys.userLoginHistory(userId), filter] as const,
	resourceHistory: (module: string, resourceId: string) =>
		[...auditLogKeys.all, "resource", module, resourceId] as const,
	resourceHistoryList: (module: string, resourceId: string, filter: AuditLogFilter) =>
		[...auditLogKeys.resourceHistory(module, resourceId), filter] as const,
} as const;

export const useAuditLogs = (filter: AuditLogFilter = {}) =>
	useQuery({
		queryKey: auditLogKeys.list(filter),
		queryFn: () => auditLogApi.getAll(filter),
		staleTime: STALE_TIME_CONFIG.list,
		placeholderData: (previousData) => previousData,
	});

export const useAuditLog = (id: string) =>
	useQuery({
		queryKey: auditLogKeys.detail(id),
		queryFn: () => auditLogApi.getById(id),
		enabled: !!id,
		staleTime: STALE_TIME_CONFIG.detail,
	});

export const useLoginHistory = (filter: AuditLogFilter = {}) =>
	useQuery({
		queryKey: auditLogKeys.loginHistoryList(filter),
		queryFn: () => auditLogApi.getLoginHistory(filter),
		staleTime: STALE_TIME_CONFIG.loginHistory,
		placeholderData: (previousData) => previousData,
	});

export const useAuditLogsByUser = (userId: string, filter: AuditLogFilter = {}) =>
	useQuery({
		queryKey: auditLogKeys.byUserList(userId, filter),
		queryFn: () => auditLogApi.getByUser(userId, filter),
		enabled: !!userId,
		staleTime: STALE_TIME_CONFIG.list,
		placeholderData: (previousData) => previousData,
	});

export const useUserLoginHistory = (userId: string, filter: AuditLogFilter = {}) =>
	useQuery({
		queryKey: auditLogKeys.userLoginHistoryList(userId, filter),
		queryFn: () => auditLogApi.getUserLoginHistory(userId, filter),
		enabled: !!userId,
		staleTime: STALE_TIME_CONFIG.loginHistory,
		placeholderData: (previousData) => previousData,
	});

export const useResourceHistory = (module: string, resourceId: string, filter: AuditLogFilter = {}) =>
	useQuery({
		queryKey: auditLogKeys.resourceHistoryList(module, resourceId, filter),
		queryFn: () => auditLogApi.getResourceHistory(module, resourceId, filter),
		enabled: !!module && !!resourceId,
		staleTime: STALE_TIME_CONFIG.detail,
		placeholderData: (previousData) => previousData,
	});

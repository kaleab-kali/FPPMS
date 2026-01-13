import { api } from "#web/lib/api-client.ts";
import type { AuditLog, AuditLogFilter, AuditLogListResponse, LoginHistoryListResponse } from "#web/types/audit-log.ts";

const BASE_URL = "/audit-logs";

const buildQueryString = (filter: AuditLogFilter): string => {
	const params = new URLSearchParams();
	if (filter.page) params.append("page", String(filter.page));
	if (filter.limit) params.append("limit", String(filter.limit));
	if (filter.dateFrom) params.append("dateFrom", filter.dateFrom);
	if (filter.dateTo) params.append("dateTo", filter.dateTo);
	if (filter.userId) params.append("userId", filter.userId);
	if (filter.action) params.append("action", filter.action);
	if (filter.module) params.append("module", filter.module);
	if (filter.resource) params.append("resource", filter.resource);
	if (filter.resourceId) params.append("resourceId", filter.resourceId);
	if (filter.ipAddress) params.append("ipAddress", filter.ipAddress);
	if (filter.search) params.append("search", filter.search);
	if (filter.sortBy) params.append("sortBy", filter.sortBy);
	if (filter.sortOrder) params.append("sortOrder", filter.sortOrder);
	const queryString = params.toString();
	return queryString ? `?${queryString}` : "";
};

export const auditLogApi = {
	getAll: (filter: AuditLogFilter = {}) => api.get<AuditLogListResponse>(`${BASE_URL}${buildQueryString(filter)}`),

	getById: (id: string) => api.get<AuditLog>(`${BASE_URL}/${id}`),

	getLoginHistory: (filter: AuditLogFilter = {}) =>
		api.get<LoginHistoryListResponse>(`${BASE_URL}/login-history${buildQueryString(filter)}`),

	getByUser: (userId: string, filter: AuditLogFilter = {}) =>
		api.get<AuditLogListResponse>(`${BASE_URL}/user/${userId}${buildQueryString(filter)}`),

	getUserLoginHistory: (userId: string, filter: AuditLogFilter = {}) =>
		api.get<LoginHistoryListResponse>(`${BASE_URL}/user/${userId}/login-history${buildQueryString(filter)}`),

	getResourceHistory: (module: string, resourceId: string, filter: AuditLogFilter = {}) =>
		api.get<AuditLogListResponse>(`${BASE_URL}/resource/${module}/${resourceId}${buildQueryString(filter)}`),
} as const;

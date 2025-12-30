export const PERMISSIONS = {
	// Dashboard
	DASHBOARD_VIEW: "dashboard.read.dashboard",
	DASHBOARD_HQ: "dashboard.read.hq",

	// Employees
	EMPLOYEE_READ: "employees.read.employee",
	EMPLOYEE_CREATE: "employees.create.employee",
	EMPLOYEE_UPDATE: "employees.update.employee",
	EMPLOYEE_DELETE: "employees.delete.employee",

	// Complaints
	COMPLAINT_READ: "complaints.read.complaint",
	COMPLAINT_CREATE: "complaints.create.complaint",
	COMPLAINT_UPDATE: "complaints.update.complaint",
	COMPLAINT_ACTION: "complaints.action.complaint",
	COMPLAINT_DELETE: "complaints.delete.complaint",

	// Committees
	COMMITTEE_READ: "committees.read.committee",
	COMMITTEE_CREATE: "committees.create.committee",
	COMMITTEE_UPDATE: "committees.update.committee",
	COMMITTEE_MANAGE: "committees.manage.committee",
	COMMITTEE_TYPE_READ: "committees.read.type",
	COMMITTEE_TYPE_CREATE: "committees.create.type",
	COMMITTEE_TYPE_UPDATE: "committees.update.type",
	COMMITTEE_TYPE_DELETE: "committees.delete.type",
	COMMITTEE_MEMBER_READ: "committees.read.member",
	COMMITTEE_MEMBER_MANAGE: "committees.manage.member",

	// Organization - Departments
	DEPARTMENT_READ: "departments.read.department",
	DEPARTMENT_CREATE: "departments.create.department",
	DEPARTMENT_UPDATE: "departments.update.department",
	DEPARTMENT_DELETE: "departments.delete.department",

	// Organization - Positions
	POSITION_READ: "positions.read.position",
	POSITION_CREATE: "positions.create.position",
	POSITION_UPDATE: "positions.update.position",
	POSITION_DELETE: "positions.delete.position",

	// Organization - Centers
	CENTER_READ: "centers.read.center",
	CENTER_CREATE: "centers.create.center",
	CENTER_UPDATE: "centers.update.center",
	CENTER_DELETE: "centers.delete.center",

	// Organization - Tenants
	TENANT_READ: "tenants.read.tenant",
	TENANT_CREATE: "tenants.create.tenant",
	TENANT_UPDATE: "tenants.update.tenant",
	TENANT_DELETE: "tenants.delete.tenant",

	// Lookups
	LOOKUP_READ: "lookups.read.lookup",
	LOOKUP_CREATE: "lookups.create.lookup",
	LOOKUP_UPDATE: "lookups.update.lookup",
	LOOKUP_DELETE: "lookups.delete.lookup",

	// Ranks
	RANK_READ: "ranks.read.rank",
	RANK_CREATE: "ranks.create.rank",
	RANK_UPDATE: "ranks.update.rank",
	RANK_DELETE: "ranks.delete.rank",

	// Users
	USER_READ: "users.read.user",
	USER_CREATE: "users.create.user",
	USER_UPDATE: "users.update.user",
	USER_DELETE: "users.delete.user",

	// Roles
	ROLE_READ: "roles.read.role",
	ROLE_CREATE: "roles.create.role",
	ROLE_UPDATE: "roles.update.role",
	ROLE_DELETE: "roles.delete.role",

	// Leave
	LEAVE_READ: "leave.read.leave",
	LEAVE_CREATE: "leave.create.leave",
	LEAVE_UPDATE: "leave.update.leave",
	LEAVE_APPROVE: "leave.approve.leave",

	// Leave Types
	LEAVE_TYPE_READ: "leave.read.type",
	LEAVE_TYPE_CREATE: "leave.create.type",
	LEAVE_TYPE_UPDATE: "leave.update.type",
	LEAVE_TYPE_DELETE: "leave.delete.type",

	// Holidays
	HOLIDAY_READ: "holidays.read.holiday",
	HOLIDAY_CREATE: "holidays.create.holiday",
	HOLIDAY_UPDATE: "holidays.update.holiday",
	HOLIDAY_DELETE: "holidays.delete.holiday",
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;
export type PermissionValue = (typeof PERMISSIONS)[PermissionKey];

export const ROLES = {
	IT_ADMIN: "IT_ADMIN",
	HQ_ADMIN: "HQ_ADMIN",
	HR_DIRECTOR: "HR_DIRECTOR",
	CENTER_ADMIN: "CENTER_ADMIN",
	CENTER_COMMANDER: "CENTER_COMMANDER",
	HR_OFFICER: "HR_OFFICER",
	DEPARTMENT_HEAD: "DEPARTMENT_HEAD",
	SUPERVISOR: "SUPERVISOR",
	FINANCE_OFFICER: "FINANCE_OFFICER",
	RECORDS_OFFICER: "RECORDS_OFFICER",
	EMPLOYEE: "EMPLOYEE",
	VIEWER: "VIEWER",
} as const;

export type RoleKey = keyof typeof ROLES;
export type RoleValue = (typeof ROLES)[RoleKey];

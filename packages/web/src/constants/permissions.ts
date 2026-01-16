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

	// Salary Scales
	SALARY_SCALE_READ: "salary-scales.read.salary-scale",
	SALARY_SCALE_CREATE: "salary-scales.create.salary-scale",
	SALARY_SCALE_UPDATE: "salary-scales.update.salary-scale",
	SALARY_SCALE_DELETE: "salary-scales.delete.salary-scale",

	// Salary Management
	SALARY_ELIGIBILITY_READ: "salary.read.eligibility",
	SALARY_INCREMENT_APPROVE: "salary.approve.increment",
	SALARY_MANUAL_JUMP: "salary.create.manualjump",
	SALARY_MASS_RAISE: "salary.create.massraise",
	SALARY_HISTORY_READ: "salary.read.history",
	SALARY_PROJECTION_READ: "salary.read.projection",
	SALARY_REPORTS_READ: "salary.read.reports",

	// Audit Logs
	AUDIT_LOG_READ: "audit.read.log",
	AUDIT_HISTORY_READ: "audit.read.history",

	// Attendance
	ATTENDANCE_READ: "attendance.read.record",
	ATTENDANCE_CREATE: "attendance.create.record",
	ATTENDANCE_UPDATE: "attendance.update.record",
	ATTENDANCE_DELETE: "attendance.delete.record",
	ATTENDANCE_BULK_CREATE: "attendance.create.bulk",
	ATTENDANCE_REPORTS_READ: "attendance.read.report",
	ATTENDANCE_EXPORT: "attendance.export.report",

	// Shifts
	SHIFT_READ: "attendance.read.shift",
	SHIFT_MANAGE: "attendance.manage.shift",
	SHIFT_ASSIGN: "attendance.assign.shift",

	// Inventory
	INVENTORY_READ: "inventory.read.assignment",
	INVENTORY_CREATE: "inventory.create.assignment",
	INVENTORY_UPDATE: "inventory.update.assignment",
	INVENTORY_RETURN: "inventory.manage.return",
	CENTER_STOCK_READ: "inventory.read.center-stock",
	CENTER_STOCK_CREATE: "inventory.create.center-stock",
	CENTER_STOCK_UPDATE: "inventory.update.center-stock",
	CENTER_STOCK_ADJUST: "inventory.adjust.center-stock",

	// Correspondence
	CORRESPONDENCE_READ: "correspondence.read.document",
	CORRESPONDENCE_CREATE: "correspondence.create.document",
	CORRESPONDENCE_UPDATE: "correspondence.update.document",
	CORRESPONDENCE_DELETE: "correspondence.delete.document",

	// Weapons - Categories
	WEAPON_CATEGORY_READ: "weapons.read.category",
	WEAPON_CATEGORY_CREATE: "weapons.create.category",
	WEAPON_CATEGORY_UPDATE: "weapons.update.category",
	WEAPON_CATEGORY_DELETE: "weapons.delete.category",
	// Weapons - Types
	WEAPON_TYPE_READ: "weapons.read.type",
	WEAPON_TYPE_CREATE: "weapons.create.type",
	WEAPON_TYPE_UPDATE: "weapons.update.type",
	WEAPON_TYPE_DELETE: "weapons.delete.type",
	// Weapons - Weapons
	WEAPON_READ: "weapons.read.weapon",
	WEAPON_CREATE: "weapons.create.weapon",
	WEAPON_UPDATE: "weapons.update.weapon",
	// Weapons - Assignments
	WEAPON_ASSIGNMENT_READ: "weapons.read.assignment",
	WEAPON_ASSIGNMENT_CREATE: "weapons.create.assignment",
	WEAPON_RETURN: "weapons.manage.return",
	// Ammunition
	AMMUNITION_TYPE_READ: "ammunition.read.type",
	AMMUNITION_TYPE_CREATE: "ammunition.create.type",
	AMMUNITION_TYPE_UPDATE: "ammunition.update.type",
	AMMUNITION_TYPE_DELETE: "ammunition.delete.type",
	AMMUNITION_STOCK_READ: "ammunition.read.stock",
	AMMUNITION_STOCK_MANAGE: "ammunition.manage.stock",
	AMMUNITION_TRANSACTION_READ: "ammunition.read.transaction",
	AMMUNITION_TRANSACTION_CREATE: "ammunition.create.transaction",

	// Rewards
	REWARD_MILESTONE_READ: "rewards.read.milestone",
	REWARD_MILESTONE_CREATE: "rewards.create.milestone",
	REWARD_MILESTONE_UPDATE: "rewards.update.milestone",
	REWARD_MILESTONE_DELETE: "rewards.delete.milestone",
	REWARD_ELIGIBILITY_READ: "rewards.read.eligibility",
	REWARD_ELIGIBILITY_CHECK: "rewards.check.eligibility",
	REWARD_CREATE: "rewards.create.reward",
	REWARD_READ: "rewards.read.reward",
	REWARD_SUBMIT: "rewards.submit.reward",
	REWARD_APPROVE: "rewards.approve.reward",
	REWARD_AWARD: "rewards.award.reward",
	REWARD_REPORT_READ: "rewards.read.report",
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

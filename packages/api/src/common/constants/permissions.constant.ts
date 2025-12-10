export const MODULES = {
	EMPLOYEES: "employees",
	LEAVE: "leave",
	HOLIDAYS: "holidays",
	APPRAISALS: "appraisals",
	SALARY: "salary",
	ATTENDANCE: "attendance",
	INVENTORY: "inventory",
	ORGANIZATION: "organization",
	RETIREMENT: "retirement",
	REWARDS: "rewards",
	COMPLAINTS: "complaints",
	DOCUMENTS: "documents",
	REPORTS: "reports",
	AUDIT: "audit",
	USERS: "users",
	SETTINGS: "settings",
} as const;

export const ACTIONS = {
	CREATE: "create",
	READ: "read",
	UPDATE: "update",
	DELETE: "delete",
	APPROVE: "approve",
	REJECT: "reject",
	EXPORT: "export",
	IMPORT: "import",
} as const;

export type ModuleType = (typeof MODULES)[keyof typeof MODULES];
export type ActionType = (typeof ACTIONS)[keyof typeof ACTIONS];

export const buildPermission = (module: ModuleType, action: ActionType): string => `${module}:${action}`;

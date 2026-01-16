import { PrismaClient } from "@prisma/client";

const PERMISSIONS = [
	{ module: "employees", action: "create", resource: "employee", description: "Create new employees" },
	{ module: "employees", action: "read", resource: "employee", description: "View employee records" },
	{ module: "employees", action: "update", resource: "employee", description: "Update employee records" },
	{ module: "employees", action: "delete", resource: "employee", description: "Delete employee records" },
	{ module: "employees", action: "manage", resource: "photo", description: "Manage employee photos" },
	{ module: "employees", action: "approve", resource: "photo", description: "Approve employee photos" },
	{ module: "employees", action: "read", resource: "superior", description: "View direct superior assignments" },
	{ module: "employees", action: "manage", resource: "superior", description: "Assign/remove direct superiors" },
	{ module: "employees", action: "read", resource: "transfer", description: "View employee transfers" },
	{ module: "employees", action: "manage", resource: "transfer", description: "Manage employee transfers" },
	{ module: "employees", action: "read", resource: "family", description: "View employee family members" },
	{ module: "employees", action: "manage", resource: "family", description: "Manage employee family members" },
	{ module: "employees", action: "read", resource: "medical", description: "View employee medical records" },
	{ module: "employees", action: "manage", resource: "medical", description: "Manage employee medical records" },
	{ module: "employees", action: "read", resource: "marital", description: "View marital status history" },
	{ module: "employees", action: "manage", resource: "marital", description: "Manage marital status changes" },

	{ module: "leave", action: "create", resource: "request", description: "Create leave requests" },
	{ module: "leave", action: "read", resource: "request", description: "View leave requests" },
	{ module: "leave", action: "approve", resource: "request", description: "Approve leave requests" },
	{ module: "leave", action: "reject", resource: "request", description: "Reject leave requests" },
	{ module: "leave", action: "manage", resource: "balance", description: "Manage leave balances" },
	{ module: "leave", action: "manage", resource: "type", description: "Manage leave types" },

	{ module: "appraisal", action: "create", resource: "appraisal", description: "Create appraisals" },
	{ module: "appraisal", action: "read", resource: "appraisal", description: "View appraisals" },
	{ module: "appraisal", action: "approve", resource: "appraisal", description: "Approve appraisals" },
	{ module: "appraisal", action: "manage", resource: "criteria", description: "Manage appraisal criteria" },
	{ module: "appraisal", action: "manage", resource: "period", description: "Manage appraisal periods" },

	{ module: "disciplinary", action: "create", resource: "record", description: "Create disciplinary records" },
	{ module: "disciplinary", action: "read", resource: "record", description: "View disciplinary records" },
	{ module: "disciplinary", action: "manage", resource: "investigation", description: "Manage investigations" },

	{ module: "complaints", action: "create", resource: "complaint", description: "Register new complaints" },
	{ module: "complaints", action: "read", resource: "complaint", description: "View complaints" },
	{ module: "complaints", action: "update", resource: "complaint", description: "Update complaint workflow" },
	{ module: "complaints", action: "delete", resource: "complaint", description: "Delete complaints" },
	{ module: "complaints", action: "manage", resource: "document", description: "Manage complaint documents" },
	{ module: "complaints", action: "manage", resource: "appeal", description: "Manage complaint appeals" },
	{ module: "complaints", action: "decide", resource: "article30", description: "Make Article 30 decisions" },
	{ module: "complaints", action: "decide", resource: "article31", description: "Make Article 31 decisions (HQ only)" },

	{ module: "committees", action: "create", resource: "committee", description: "Create committees" },
	{ module: "committees", action: "read", resource: "committee", description: "View committees" },
	{ module: "committees", action: "read", resource: "all", description: "View all committees across centers (audit)" },
	{ module: "committees", action: "read", resource: "type", description: "View committee types" },
	{ module: "committees", action: "create", resource: "type", description: "Create committee types" },
	{ module: "committees", action: "update", resource: "type", description: "Update committee types" },
	{ module: "committees", action: "delete", resource: "type", description: "Delete committee types" },
	{ module: "committees", action: "update", resource: "committee", description: "Update committees" },
	{ module: "committees", action: "delete", resource: "committee", description: "Delete committees" },
	{ module: "committees", action: "read", resource: "member", description: "View committee members" },
	{ module: "committees", action: "manage", resource: "member", description: "Manage committee members" },
	{
		module: "committees",
		action: "manage",
		resource: "committee",
		description: "Manage committee lifecycle (suspend, dissolve)",
	},

	{ module: "salary", action: "read", resource: "salary", description: "View salary information" },
	{ module: "salary", action: "manage", resource: "increment", description: "Manage salary increments" },
	{ module: "salary", action: "manage", resource: "scale", description: "Manage salary scales" },
	{ module: "salary", action: "read", resource: "eligibility", description: "View salary step eligibility" },
	{ module: "salary", action: "approve", resource: "increment", description: "Approve salary step increments" },
	{ module: "salary", action: "create", resource: "manualjump", description: "Create manual salary step jumps" },
	{ module: "salary", action: "create", resource: "massraise", description: "Create mass salary raises" },
	{ module: "salary", action: "read", resource: "history", description: "View salary history" },
	{ module: "salary", action: "read", resource: "projection", description: "View salary projections" },
	{ module: "salary", action: "read", resource: "reports", description: "View salary reports" },
	{ module: "salary", action: "manage", resource: "eligibility", description: "Manage eligibility checks" },
	{ module: "salary", action: "create", resource: "promotion", description: "Process promotion salary changes" },
	{ module: "salary", action: "read", resource: "ranksteps", description: "View rank salary steps" },
	{ module: "salary", action: "read", resource: "promotion", description: "Preview promotion salary" },

	{ module: "attendance", action: "create", resource: "record", description: "Record attendance" },
	{ module: "attendance", action: "read", resource: "record", description: "View attendance records" },
	{ module: "attendance", action: "update", resource: "record", description: "Update attendance records" },
	{ module: "attendance", action: "delete", resource: "record", description: "Delete attendance records" },
	{ module: "attendance", action: "create", resource: "bulk", description: "Bulk create attendance records" },
	{ module: "attendance", action: "read", resource: "shift", description: "View shift definitions" },
	{ module: "attendance", action: "manage", resource: "shift", description: "Manage shift definitions" },
	{ module: "attendance", action: "assign", resource: "shift", description: "Assign shifts to employees" },
	{ module: "attendance", action: "read", resource: "report", description: "View attendance reports" },
	{ module: "attendance", action: "export", resource: "report", description: "Export attendance data" },
	{ module: "attendance", action: "manage", resource: "device", description: "Manage biometric devices" },

	{ module: "inventory", action: "create", resource: "assignment", description: "Create inventory assignments" },
	{ module: "inventory", action: "read", resource: "assignment", description: "View inventory assignments" },
	{ module: "inventory", action: "update", resource: "assignment", description: "Update inventory assignments" },
	{ module: "inventory", action: "manage", resource: "return", description: "Process inventory returns" },
	{ module: "inventory", action: "read", resource: "center-stock", description: "View center inventory stock" },
	{ module: "inventory", action: "manage", resource: "center-stock", description: "Manage center inventory stock" },
	{ module: "inventory", action: "manage", resource: "category", description: "Manage inventory categories" },
	{ module: "inventory", action: "manage", resource: "item-type", description: "Manage inventory item types" },

	{ module: "holidays", action: "create", resource: "holiday", description: "Create holidays" },
	{ module: "holidays", action: "read", resource: "holiday", description: "View holidays" },
	{ module: "holidays", action: "update", resource: "holiday", description: "Update holidays" },
	{ module: "holidays", action: "delete", resource: "holiday", description: "Delete holidays" },

	{ module: "correspondence", action: "create", resource: "document", description: "Create correspondence documents" },
	{ module: "correspondence", action: "read", resource: "document", description: "View correspondence documents" },
	{ module: "correspondence", action: "update", resource: "document", description: "Update correspondence documents" },
	{ module: "correspondence", action: "delete", resource: "document", description: "Delete correspondence documents" },
	{
		module: "correspondence",
		action: "manage",
		resource: "attachment",
		description: "Manage correspondence attachments",
	},
	{ module: "correspondence", action: "read", resource: "overdue", description: "View overdue correspondence" },

	{ module: "retirement", action: "read", resource: "eligibility", description: "View retirement eligibility" },
	{ module: "retirement", action: "manage", resource: "process", description: "Manage retirement process" },
	{ module: "retirement", action: "manage", resource: "clearance", description: "Process retirement clearance" },

	{ module: "rewards", action: "create", resource: "milestone", description: "Create reward milestones" },
	{ module: "rewards", action: "read", resource: "milestone", description: "View reward milestones" },
	{ module: "rewards", action: "update", resource: "milestone", description: "Update reward milestones" },
	{ module: "rewards", action: "delete", resource: "milestone", description: "Delete reward milestones" },
	{ module: "rewards", action: "read", resource: "eligibility", description: "View reward eligibility" },
	{ module: "rewards", action: "check", resource: "eligibility", description: "Run eligibility checks" },
	{ module: "rewards", action: "create", resource: "reward", description: "Create service reward records" },
	{ module: "rewards", action: "read", resource: "reward", description: "View service rewards" },
	{ module: "rewards", action: "submit", resource: "reward", description: "Submit rewards for approval" },
	{ module: "rewards", action: "approve", resource: "reward", description: "Approve service rewards" },
	{ module: "rewards", action: "award", resource: "reward", description: "Mark rewards as awarded" },
	{ module: "rewards", action: "read", resource: "report", description: "View reward reports" },

	{ module: "documents", action: "create", resource: "document", description: "Create documents" },
	{ module: "documents", action: "read", resource: "document", description: "View documents" },
	{ module: "documents", action: "manage", resource: "type", description: "Manage document types" },

	{ module: "transfer", action: "create", resource: "request", description: "Create transfer requests" },
	{ module: "transfer", action: "read", resource: "request", description: "View transfer requests" },
	{ module: "transfer", action: "approve", resource: "request", description: "Approve transfer requests" },
	{ module: "transfer", action: "manage", resource: "departure", description: "Manage departures" },

	{ module: "reports", action: "read", resource: "employee", description: "View employee reports" },
	{ module: "reports", action: "read", resource: "leave", description: "View leave reports" },
	{ module: "reports", action: "read", resource: "attendance", description: "View attendance reports" },
	{ module: "reports", action: "read", resource: "analytics", description: "View analytics dashboard" },

	{ module: "admin", action: "manage", resource: "user", description: "Manage system users" },
	{ module: "admin", action: "manage", resource: "role", description: "Manage roles" },
	{ module: "admin", action: "manage", resource: "tenant", description: "Manage tenants" },
	{ module: "admin", action: "manage", resource: "center", description: "Manage centers" },
	{ module: "admin", action: "manage", resource: "department", description: "Manage departments" },
	{ module: "admin", action: "manage", resource: "position", description: "Manage positions" },
	{ module: "admin", action: "manage", resource: "lookup", description: "Manage lookups" },
	{ module: "admin", action: "read", resource: "audit", description: "View audit logs" },

	{ module: "audit", action: "read", resource: "log", description: "View audit logs" },
	{ module: "audit", action: "read", resource: "history", description: "View login history" },

	{ module: "attachments", action: "create", resource: "attachment", description: "Upload file attachments" },
	{ module: "attachments", action: "read", resource: "attachment", description: "View file attachments" },
	{ module: "attachments", action: "delete", resource: "attachment", description: "Delete file attachments" },

	{ module: "weapons", action: "read", resource: "category", description: "View weapon categories" },
	{ module: "weapons", action: "create", resource: "category", description: "Create weapon categories" },
	{ module: "weapons", action: "update", resource: "category", description: "Update weapon categories" },
	{ module: "weapons", action: "delete", resource: "category", description: "Delete weapon categories" },
	{ module: "weapons", action: "read", resource: "type", description: "View weapon types" },
	{ module: "weapons", action: "create", resource: "type", description: "Create weapon types" },
	{ module: "weapons", action: "update", resource: "type", description: "Update weapon types" },
	{ module: "weapons", action: "delete", resource: "type", description: "Delete weapon types" },
	{ module: "weapons", action: "read", resource: "weapon", description: "View weapons" },
	{ module: "weapons", action: "create", resource: "weapon", description: "Register new weapons" },
	{ module: "weapons", action: "update", resource: "weapon", description: "Update weapon records" },
	{ module: "weapons", action: "read", resource: "assignment", description: "View weapon assignments" },
	{ module: "weapons", action: "create", resource: "assignment", description: "Assign weapons to employees" },
	{ module: "weapons", action: "manage", resource: "return", description: "Process weapon returns" },

	{ module: "ammunition", action: "read", resource: "type", description: "View ammunition types" },
	{ module: "ammunition", action: "create", resource: "type", description: "Create ammunition types" },
	{ module: "ammunition", action: "update", resource: "type", description: "Update ammunition types" },
	{ module: "ammunition", action: "delete", resource: "type", description: "Delete ammunition types" },
	{ module: "ammunition", action: "read", resource: "stock", description: "View ammunition stock" },
	{ module: "ammunition", action: "manage", resource: "stock", description: "Manage ammunition stock levels" },
	{ module: "ammunition", action: "read", resource: "transaction", description: "View ammunition transactions" },
	{ module: "ammunition", action: "create", resource: "transaction", description: "Create ammunition transactions" },
];

const ROLE_PERMISSIONS: Record<string, string[]> = {
	IT_ADMIN: ["*"],

	HQ_ADMIN: [
		"employees:*",
		"leave:*",
		"appraisal:*",
		"disciplinary:*",
		"complaints:*",
		"committees:*",
		"salary:*",
		"attendance:*",
		"inventory:*",
		"correspondence:*",
		"retirement:*",
		"rewards:*",
		"documents:*",
		"transfer:*",
		"reports:*",
		"attachments:*",
		"weapons:*",
		"ammunition:*",
		"admin:manage:center",
		"admin:manage:department",
		"admin:manage:position",
		"admin:manage:lookup",
		"admin:read:audit",
		"audit:*",
	],

	HR_DIRECTOR: [
		"employees:*",
		"leave:*",
		"appraisal:*",
		"disciplinary:*",
		"complaints:*",
		"committees:*",
		"committees:read:all",
		"salary:*",
		"attendance:read:record",
		"inventory:*",
		"correspondence:*",
		"retirement:*",
		"rewards:*",
		"documents:*",
		"transfer:*",
		"reports:*",
		"attachments:*",
		"weapons:*",
		"ammunition:*",
	],

	CENTER_ADMIN: [
		"employees:create:employee",
		"employees:read:employee",
		"employees:update:employee",
		"employees:manage:photo",
		"employees:approve:photo",
		"employees:read:family",
		"employees:manage:family",
		"employees:read:medical",
		"employees:manage:medical",
		"employees:read:marital",
		"employees:manage:marital",
		"leave:*",
		"appraisal:create:appraisal",
		"appraisal:read:appraisal",
		"appraisal:approve:appraisal",
		"disciplinary:*",
		"complaints:create:complaint",
		"complaints:read:complaint",
		"complaints:update:complaint",
		"complaints:manage:document",
		"complaints:decide:article30",
		"committees:read:committee",
		"committees:manage:member",
		"salary:read:salary",
		"salary:read:eligibility",
		"salary:approve:increment",
		"salary:read:history",
		"salary:read:projection",
		"salary:read:ranksteps",
		"attendance:*",
		"inventory:*",
		"correspondence:*",
		"retirement:read:eligibility",
		"rewards:read:milestone",
		"rewards:read:eligibility",
		"rewards:check:eligibility",
		"rewards:read:reward",
		"rewards:read:report",
		"documents:*",
		"transfer:*",
		"reports:*",
		"attachments:*",
		"weapons:*",
		"ammunition:*",
	],

	CENTER_COMMANDER: [
		"employees:read:employee",
		"employees:approve:photo",
		"leave:read:request",
		"leave:approve:request",
		"leave:reject:request",
		"appraisal:read:appraisal",
		"appraisal:approve:appraisal",
		"disciplinary:read:record",
		"disciplinary:manage:investigation",
		"complaints:read:complaint",
		"complaints:update:complaint",
		"complaints:decide:article30",
		"committees:read:committee",
		"correspondence:read:document",
		"correspondence:read:overdue",
		"transfer:read:request",
		"transfer:approve:request",
		"rewards:read:milestone",
		"rewards:read:eligibility",
		"rewards:read:reward",
		"rewards:read:report",
		"reports:*",
		"weapons:read:category",
		"weapons:read:type",
		"weapons:read:weapon",
		"weapons:read:assignment",
		"ammunition:read:type",
		"ammunition:read:stock",
		"ammunition:read:transaction",
	],

	HR_OFFICER: [
		"employees:create:employee",
		"employees:read:employee",
		"employees:update:employee",
		"employees:manage:photo",
		"employees:read:family",
		"employees:manage:family",
		"employees:read:medical",
		"employees:manage:medical",
		"employees:read:marital",
		"employees:manage:marital",
		"leave:read:request",
		"leave:manage:balance",
		"appraisal:read:appraisal",
		"disciplinary:read:record",
		"complaints:create:complaint",
		"complaints:read:complaint",
		"complaints:update:complaint",
		"complaints:manage:document",
		"committees:read:committee",
		"salary:read:salary",
		"salary:read:eligibility",
		"salary:read:history",
		"salary:read:projection",
		"salary:read:ranksteps",
		"attendance:create:record",
		"attendance:read:record",
		"attendance:update:record",
		"attendance:create:bulk",
		"attendance:read:shift",
		"attendance:assign:shift",
		"attendance:read:report",
		"holidays:read:holiday",
		"retirement:read:eligibility",
		"rewards:read:milestone",
		"rewards:read:eligibility",
		"rewards:check:eligibility",
		"rewards:create:reward",
		"rewards:read:reward",
		"rewards:submit:reward",
		"rewards:award:reward",
		"rewards:read:report",
		"documents:create:document",
		"documents:read:document",
		"correspondence:create:document",
		"correspondence:read:document",
		"correspondence:update:document",
		"correspondence:manage:attachment",
		"transfer:read:request",
		"reports:read:employee",
		"attachments:create:attachment",
		"attachments:read:attachment",
		"weapons:read:category",
		"weapons:read:type",
		"weapons:read:weapon",
		"weapons:read:assignment",
		"weapons:create:assignment",
		"ammunition:read:type",
		"ammunition:read:stock",
		"ammunition:read:transaction",
		"ammunition:create:transaction",
	],

	DEPARTMENT_HEAD: [
		"employees:read:employee",
		"leave:read:request",
		"leave:approve:request",
		"leave:reject:request",
		"appraisal:create:appraisal",
		"appraisal:read:appraisal",
		"attendance:read:record",
		"attendance:read:shift",
		"attendance:read:report",
		"holidays:read:holiday",
		"inventory:read:item",
		"documents:read:document",
		"reports:read:employee",
		"reports:read:leave",
		"reports:read:attendance",
	],

	SUPERVISOR: [
		"employees:read:employee",
		"leave:read:request",
		"leave:approve:request",
		"appraisal:create:appraisal",
		"appraisal:read:appraisal",
		"attendance:create:record",
		"attendance:read:record",
		"attendance:read:shift",
		"holidays:read:holiday",
	],

	FINANCE_OFFICER: [
		"employees:read:employee",
		"salary:*",
		"retirement:read:eligibility",
		"rewards:read:eligibility",
		"reports:read:employee",
		"holidays:read:holiday",
	],

	RECORDS_OFFICER: [
		"employees:read:employee",
		"documents:create:document",
		"documents:read:document",
		"documents:manage:type",
		"correspondence:*",
		"attachments:create:attachment",
		"attachments:read:attachment",
		"attachments:delete:attachment",
		"holidays:read:holiday",
	],
};

export const seedPermissions = async (prisma: PrismaClient): Promise<void> => {
	for (const permission of PERMISSIONS) {
		const existing = await prisma.permission.findFirst({
			where: {
				module: permission.module,
				action: permission.action,
				resource: permission.resource,
			},
		});

		if (existing) {
			continue;
		}

		await prisma.permission.create({
			data: permission,
		});
	}

	console.log(`Seeded ${PERMISSIONS.length} permissions`);
};

const matchesPermission = (
	permission: { module: string; action: string; resource: string },
	pattern: string,
): boolean => {
	if (pattern === "*") return true;

	const parts = pattern.split(":");
	const [patternModule, patternAction, patternResource] = parts;

	if (patternModule !== permission.module) return false;
	if (patternAction === "*") return true;
	if (patternAction !== permission.action) return false;
	if (patternResource === "*" || patternResource === undefined) return true;
	return patternResource === permission.resource;
};

export const assignPermissionsToRoles = async (prisma: PrismaClient): Promise<void> => {
	const allPermissions = await prisma.permission.findMany();
	const roles = await prisma.role.findMany({ where: { tenantId: null } });

	for (const role of roles) {
		const patterns = ROLE_PERMISSIONS[role.code];
		if (!patterns) {
			console.log(`No permission patterns defined for role ${role.code}, skipping...`);
			continue;
		}

		const existingAssignments = await prisma.rolePermission.findMany({
			where: { roleId: role.id },
			select: { permissionId: true },
		});

		const existingPermissionIds = new Set(existingAssignments.map((a) => a.permissionId));

		const matchedPermissions = allPermissions.filter((perm) =>
			patterns.some((pattern) => matchesPermission(perm, pattern)),
		);

		let addedCount = 0;
		for (const permission of matchedPermissions) {
			if (existingPermissionIds.has(permission.id)) {
				continue;
			}
			await prisma.rolePermission.create({
				data: {
					roleId: role.id,
					permissionId: permission.id,
				},
			});
			addedCount++;
		}

		if (addedCount > 0) {
			console.log(`Added ${addedCount} new permissions to ${role.code} role`);
		} else {
			console.log(`Role ${role.code} already has all ${matchedPermissions.length} matching permissions`);
		}
	}
};

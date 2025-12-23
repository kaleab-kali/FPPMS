import { PrismaClient } from "@prisma/client";

const PERMISSIONS = [
	{ module: "employees", action: "create", resource: "employee", description: "Create new employees" },
	{ module: "employees", action: "read", resource: "employee", description: "View employee records" },
	{ module: "employees", action: "update", resource: "employee", description: "Update employee records" },
	{ module: "employees", action: "delete", resource: "employee", description: "Delete employee records" },
	{ module: "employees", action: "manage", resource: "photo", description: "Manage employee photos" },
	{ module: "employees", action: "approve", resource: "photo", description: "Approve employee photos" },
	{ module: "employees", action: "read", resource: "own", description: "View own employee record" },
	{ module: "employees", action: "update", resource: "own", description: "Update own employee record" },

	{ module: "leave", action: "create", resource: "request", description: "Create leave requests" },
	{ module: "leave", action: "read", resource: "request", description: "View leave requests" },
	{ module: "leave", action: "approve", resource: "request", description: "Approve leave requests" },
	{ module: "leave", action: "reject", resource: "request", description: "Reject leave requests" },
	{ module: "leave", action: "manage", resource: "balance", description: "Manage leave balances" },
	{ module: "leave", action: "manage", resource: "type", description: "Manage leave types" },
	{ module: "leave", action: "read", resource: "own", description: "View own leave requests" },
	{ module: "leave", action: "create", resource: "own", description: "Create own leave request" },

	{ module: "appraisal", action: "create", resource: "appraisal", description: "Create appraisals" },
	{ module: "appraisal", action: "read", resource: "appraisal", description: "View appraisals" },
	{ module: "appraisal", action: "approve", resource: "appraisal", description: "Approve appraisals" },
	{ module: "appraisal", action: "manage", resource: "criteria", description: "Manage appraisal criteria" },
	{ module: "appraisal", action: "manage", resource: "period", description: "Manage appraisal periods" },
	{ module: "appraisal", action: "read", resource: "own", description: "View own appraisals" },

	{ module: "disciplinary", action: "create", resource: "record", description: "Create disciplinary records" },
	{ module: "disciplinary", action: "read", resource: "record", description: "View disciplinary records" },
	{ module: "disciplinary", action: "manage", resource: "investigation", description: "Manage investigations" },

	{ module: "salary", action: "read", resource: "salary", description: "View salary information" },
	{ module: "salary", action: "manage", resource: "increment", description: "Manage salary increments" },
	{ module: "salary", action: "manage", resource: "scale", description: "Manage salary scales" },
	{ module: "salary", action: "read", resource: "own", description: "View own salary" },

	{ module: "attendance", action: "create", resource: "record", description: "Record attendance" },
	{ module: "attendance", action: "read", resource: "record", description: "View attendance records" },
	{ module: "attendance", action: "manage", resource: "shift", description: "Manage shifts" },
	{ module: "attendance", action: "read", resource: "own", description: "View own attendance" },

	{ module: "inventory", action: "create", resource: "assignment", description: "Assign inventory items" },
	{ module: "inventory", action: "read", resource: "item", description: "View inventory" },
	{ module: "inventory", action: "manage", resource: "item", description: "Manage inventory items" },
	{ module: "inventory", action: "manage", resource: "clearance", description: "Process inventory clearance" },
	{ module: "inventory", action: "read", resource: "own", description: "View own inventory assignments" },

	{ module: "retirement", action: "read", resource: "eligibility", description: "View retirement eligibility" },
	{ module: "retirement", action: "manage", resource: "process", description: "Manage retirement process" },
	{ module: "retirement", action: "manage", resource: "clearance", description: "Process retirement clearance" },

	{ module: "rewards", action: "read", resource: "eligibility", description: "View reward eligibility" },
	{ module: "rewards", action: "manage", resource: "reward", description: "Manage service rewards" },
	{ module: "rewards", action: "read", resource: "own", description: "View own rewards" },

	{ module: "documents", action: "create", resource: "document", description: "Create documents" },
	{ module: "documents", action: "read", resource: "document", description: "View documents" },
	{ module: "documents", action: "manage", resource: "type", description: "Manage document types" },
	{ module: "documents", action: "read", resource: "own", description: "View own documents" },

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
];

const ROLE_PERMISSIONS: Record<string, string[]> = {
	IT_ADMIN: ["*"],
	HQ_ADMIN: [
		"employees:*",
		"leave:*",
		"appraisal:*",
		"disciplinary:*",
		"salary:*",
		"attendance:*",
		"inventory:*",
		"retirement:*",
		"rewards:*",
		"documents:*",
		"transfer:*",
		"reports:*",
		"admin:manage:center",
		"admin:manage:department",
		"admin:manage:position",
		"admin:manage:lookup",
		"admin:read:audit",
	],
	CENTER_ADMIN: [
		"employees:create:employee",
		"employees:read:employee",
		"employees:update:employee",
		"employees:manage:photo",
		"employees:approve:photo",
		"leave:*",
		"appraisal:create:appraisal",
		"appraisal:read:appraisal",
		"appraisal:approve:appraisal",
		"disciplinary:*",
		"salary:read:salary",
		"attendance:*",
		"inventory:*",
		"retirement:read:eligibility",
		"rewards:read:eligibility",
		"documents:*",
		"transfer:*",
		"reports:*",
	],
	HR_DIRECTOR: [
		"employees:*",
		"leave:*",
		"appraisal:*",
		"disciplinary:*",
		"salary:read:salary",
		"salary:manage:increment",
		"attendance:read:record",
		"retirement:*",
		"rewards:*",
		"documents:*",
		"transfer:*",
		"reports:*",
	],
	HR_OFFICER: [
		"employees:create:employee",
		"employees:read:employee",
		"employees:update:employee",
		"employees:manage:photo",
		"leave:read:request",
		"leave:manage:balance",
		"appraisal:read:appraisal",
		"disciplinary:read:record",
		"salary:read:salary",
		"attendance:read:record",
		"retirement:read:eligibility",
		"rewards:read:eligibility",
		"documents:create:document",
		"documents:read:document",
		"transfer:read:request",
		"reports:read:employee",
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
		"transfer:read:request",
		"transfer:approve:request",
		"reports:*",
	],
	DEPARTMENT_HEAD: [
		"employees:read:employee",
		"leave:read:request",
		"leave:approve:request",
		"leave:reject:request",
		"appraisal:create:appraisal",
		"appraisal:read:appraisal",
		"attendance:read:record",
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
	],
	FINANCE_OFFICER: [
		"employees:read:employee",
		"salary:read:salary",
		"salary:manage:increment",
		"salary:manage:scale",
		"retirement:read:eligibility",
		"rewards:read:eligibility",
		"reports:read:employee",
	],
	RECORDS_OFFICER: [
		"employees:read:employee",
		"documents:create:document",
		"documents:read:document",
		"documents:manage:type",
	],
	EMPLOYEE: [
		"employees:read:own",
		"employees:update:own",
		"leave:read:own",
		"leave:create:own",
		"appraisal:read:own",
		"salary:read:own",
		"attendance:read:own",
		"inventory:read:own",
		"rewards:read:own",
		"documents:read:own",
	],
	VIEWER: ["employees:read:own", "leave:read:own", "attendance:read:own", "documents:read:own"],
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
		});

		if (existingAssignments.length > 0) {
			console.log(`Role ${role.code} already has permissions assigned, skipping...`);
			continue;
		}

		const matchedPermissions = allPermissions.filter((perm) =>
			patterns.some((pattern) => matchesPermission(perm, pattern)),
		);

		for (const permission of matchedPermissions) {
			await prisma.rolePermission.create({
				data: {
					roleId: role.id,
					permissionId: permission.id,
				},
			});
		}

		console.log(`Assigned ${matchedPermissions.length} permissions to ${role.code} role`);
	}
};

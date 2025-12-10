import { PrismaClient } from "@prisma/client";

const PERMISSIONS = [
	{ module: "employees", action: "create", resource: "employee", description: "Create new employees" },
	{ module: "employees", action: "read", resource: "employee", description: "View employee records" },
	{ module: "employees", action: "update", resource: "employee", description: "Update employee records" },
	{ module: "employees", action: "delete", resource: "employee", description: "Delete employee records" },
	{ module: "employees", action: "manage", resource: "photo", description: "Manage employee photos" },
	{ module: "employees", action: "approve", resource: "photo", description: "Approve employee photos" },

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

	{ module: "salary", action: "read", resource: "salary", description: "View salary information" },
	{ module: "salary", action: "manage", resource: "increment", description: "Manage salary increments" },
	{ module: "salary", action: "manage", resource: "scale", description: "Manage salary scales" },

	{ module: "attendance", action: "create", resource: "record", description: "Record attendance" },
	{ module: "attendance", action: "read", resource: "record", description: "View attendance records" },
	{ module: "attendance", action: "manage", resource: "shift", description: "Manage shifts" },

	{ module: "inventory", action: "create", resource: "assignment", description: "Assign inventory items" },
	{ module: "inventory", action: "read", resource: "item", description: "View inventory" },
	{ module: "inventory", action: "manage", resource: "item", description: "Manage inventory items" },
	{ module: "inventory", action: "manage", resource: "clearance", description: "Process inventory clearance" },

	{ module: "retirement", action: "read", resource: "eligibility", description: "View retirement eligibility" },
	{ module: "retirement", action: "manage", resource: "process", description: "Manage retirement process" },
	{ module: "retirement", action: "manage", resource: "clearance", description: "Process retirement clearance" },

	{ module: "rewards", action: "read", resource: "eligibility", description: "View reward eligibility" },
	{ module: "rewards", action: "manage", resource: "reward", description: "Manage service rewards" },

	{ module: "documents", action: "create", resource: "document", description: "Create documents" },
	{ module: "documents", action: "read", resource: "document", description: "View documents" },
	{ module: "documents", action: "manage", resource: "type", description: "Manage document types" },

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

export const assignPermissionsToRoles = async (prisma: PrismaClient): Promise<void> => {
	const itAdminRole = await prisma.role.findFirst({ where: { code: "IT_ADMIN" } });
	if (!itAdminRole) {
		console.log("IT_ADMIN role not found, skipping permission assignment");
		return;
	}

	const allPermissions = await prisma.permission.findMany();

	const existingAssignments = await prisma.rolePermission.findMany({
		where: { roleId: itAdminRole.id },
	});

	if (existingAssignments.length > 0) {
		console.log("IT_ADMIN already has permissions assigned, skipping...");
		return;
	}

	for (const permission of allPermissions) {
		await prisma.rolePermission.create({
			data: {
				roleId: itAdminRole.id,
				permissionId: permission.id,
			},
		});
	}

	console.log(`Assigned ${allPermissions.length} permissions to IT_ADMIN role`);
};

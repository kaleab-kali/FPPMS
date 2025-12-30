import { PrismaClient } from "@prisma/client";

const SYSTEM_ROLES = [
	{
		code: "IT_ADMIN",
		name: "IT Administrator",
		nameAm:
			"\u12E8\u12A2\u1295\u134E\u122D\u121C\u123D\u1295 \u1274\u12AD\u1296\u120E\u1302 \u12A0\u1235\u1270\u12F3\u12F3\u122A",
		description: "Full system access, user management, system configuration",
		level: 100,
		accessScope: "ALL_CENTERS",
		isSystemRole: true,
	},
	{
		code: "HQ_ADMIN",
		name: "HQ Administrator",
		nameAm: "\u12E8\u12DD\u1241 \u1218\u1235\u122A\u12EB \u1264\u1275 \u12A0\u1235\u1270\u12F3\u12F3\u122A",
		description: "HQ level administration, all centers access",
		level: 95,
		accessScope: "ALL_CENTERS",
		isSystemRole: true,
	},
	{
		code: "CENTER_ADMIN",
		name: "Center Administrator",
		nameAm: "\u12E8\u121B\u12D5\u12A8\u120D \u12A0\u1235\u1270\u12F3\u12F3\u122A",
		description: "Center level administration",
		level: 85,
		accessScope: "OWN_CENTER",
		isSystemRole: true,
	},
	{
		code: "HR_DIRECTOR",
		name: "HR Director",
		nameAm: "\u12E8\u1230\u12CD \u1210\u12ED\u120D \u12A0\u1218\u122B\u122D",
		description: "HR department head, full HR access",
		level: 90,
		accessScope: "ALL_CENTERS",
		isSystemRole: true,
	},
	{
		code: "HR_OFFICER",
		name: "HR Officer",
		nameAm: "\u12E8\u1230\u12CD \u1210\u12ED\u120D \u1218\u12AE\u1295\u1295",
		description: "HR operations, employee management",
		level: 70,
		accessScope: "OWN_CENTER",
		isSystemRole: true,
	},
	{
		code: "CENTER_COMMANDER",
		name: "Center Commander",
		nameAm: "\u12E8\u121B\u12D5\u12A8\u120D \u12A0\u12DC\u12CE",
		description: "Center head, approvals and oversight",
		level: 80,
		accessScope: "OWN_CENTER",
		isSystemRole: true,
	},
	{
		code: "DEPARTMENT_HEAD",
		name: "Department Head",
		nameAm: "\u12E8\u12AD\u134D\u120D \u12C8\u12ED\u1235",
		description: "Department management and approvals",
		level: 60,
		accessScope: "OWN_CENTER",
		isSystemRole: true,
	},
	{
		code: "SUPERVISOR",
		name: "Supervisor",
		nameAm: "\u1230\u12A1\u1350\u122D\u126B\u12ED\u12D8\u122D",
		description: "Team supervision, leave approvals",
		level: 50,
		accessScope: "OWN_CENTER",
		isSystemRole: true,
	},
	{
		code: "FINANCE_OFFICER",
		name: "Finance Officer",
		nameAm: "\u12E8\u134B\u12ED\u1293\u1295\u1235 \u1218\u12AE\u1295\u1295",
		description: "Salary and financial operations",
		level: 40,
		accessScope: "OWN_CENTER",
		isSystemRole: true,
	},
	{
		code: "RECORDS_OFFICER",
		name: "Records Officer",
		nameAm: "\u12E8\u1218\u12DD\u1308\u1265 \u1218\u12AE\u1295\u1295",
		description: "Document and records management",
		level: 30,
		accessScope: "OWN_CENTER",
		isSystemRole: true,
	},
	{
		code: "VIEWER",
		name: "Viewer",
		nameAm: "\u1270\u1218\u120D\u12AB\u127D",
		description: "Read-only access to allowed modules",
		level: 10,
		accessScope: "OWN_CENTER",
		isSystemRole: true,
	},
];

export const seedRoles = async (prisma: PrismaClient): Promise<void> => {
	for (const role of SYSTEM_ROLES) {
		const existingRole = await prisma.role.findFirst({
			where: { code: role.code, tenantId: null },
		});

		if (existingRole) {
			await prisma.role.update({
				where: { id: existingRole.id },
				data: {
					name: role.name,
					nameAm: role.nameAm,
					description: role.description,
					level: role.level,
					accessScope: role.accessScope,
					isSystemRole: role.isSystemRole,
				},
			});
			console.log(`Updated role: ${role.name} (${role.code})`);
			continue;
		}

		await prisma.role.create({
			data: {
				code: role.code,
				name: role.name,
				nameAm: role.nameAm,
				description: role.description,
				level: role.level,
				accessScope: role.accessScope,
				isSystemRole: role.isSystemRole,
				isActive: true,
				tenantId: null,
			},
		});

		console.log(`Created role: ${role.name} (${role.code})`);
	}
};

import { PrismaClient } from "@prisma/client";

const SYSTEM_ROLES = [
	{
		code: "IT_ADMIN",
		name: "IT Administrator",
		nameAm: "የኢንፎርሜሽን ቴክኖሎጂ አስተዳዳሪ",
		description: "Full system access, user management, system configuration",
		level: 100,
		accessScope: "ALL_CENTERS",
		isSystemRole: true,
	},
	{
		code: "HQ_ADMIN",
		name: "HQ Administrator",
		nameAm: "የዋና መስሪያ ቤት አስተዳዳሪ",
		description: "HQ level administration, all centers access",
		level: 95,
		accessScope: "ALL_CENTERS",
		isSystemRole: true,
	},
	{
		code: "CENTER_ADMIN",
		name: "Center Administrator",
		nameAm: "የማዕከል አስተዳዳሪ",
		description: "Center level administration",
		level: 85,
		accessScope: "OWN_CENTER",
		isSystemRole: true,
	},
	{
		code: "HR_DIRECTOR",
		name: "HR Director",
		nameAm: "የሰው ኃይል አመራር",
		description: "HR department head, full HR access",
		level: 90,
		accessScope: "ALL_CENTERS",
		isSystemRole: true,
	},
	{
		code: "HR_OFFICER",
		name: "HR Officer",
		nameAm: "የሰው ኃይል መኮንን",
		description: "HR operations, employee management",
		level: 70,
		accessScope: "OWN_CENTER",
		isSystemRole: true,
	},
	{
		code: "CENTER_COMMANDER",
		name: "Center Commander",
		nameAm: "የማዕከል አዛዥ",
		description: "Center head, approvals and oversight",
		level: 80,
		accessScope: "OWN_CENTER",
		isSystemRole: true,
	},
	{
		code: "DEPARTMENT_HEAD",
		name: "Department Head",
		nameAm: "የክፍል ኃላፊ",
		description: "Department management and approvals",
		level: 60,
		accessScope: "OWN_CENTER",
		isSystemRole: true,
	},
	{
		code: "SUPERVISOR",
		name: "Supervisor",
		nameAm: "ተቆጣጣሪ",
		description: "Team supervision, leave approvals",
		level: 50,
		accessScope: "OWN_CENTER",
		isSystemRole: true,
	},
	{
		code: "FINANCE_OFFICER",
		name: "Finance Officer",
		nameAm: "የፋይናንስ መኮንን",
		description: "Salary and financial operations",
		level: 40,
		accessScope: "OWN_CENTER",
		isSystemRole: true,
	},
	{
		code: "RECORDS_OFFICER",
		name: "Records Officer",
		nameAm: "የመዝገብ መኮንን",
		description: "Document and records management",
		level: 30,
		accessScope: "OWN_CENTER",
		isSystemRole: true,
	},
	{
		code: "EMPLOYEE",
		name: "Employee",
		nameAm: "ሰራተኛ",
		description: "Basic employee access to own records",
		level: 20,
		accessScope: "OWN_RECORDS",
		isSystemRole: true,
	},
	{
		code: "VIEWER",
		name: "Viewer",
		nameAm: "ተመልካች",
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

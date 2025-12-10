import { PrismaClient, UserStatus } from "@prisma/client";
import * as bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export const seedITAdmin = async (prisma: PrismaClient, tenantId: string): Promise<void> => {
	const existingUser = await prisma.user.findFirst({
		where: { tenantId, username: "admin" },
	});

	if (existingUser) {
		console.log("IT Admin user already exists, skipping...");
		return;
	}

	const itAdminRole = await prisma.role.findFirst({
		where: { code: "IT_ADMIN" },
	});

	if (!itAdminRole) {
		console.log("IT_ADMIN role not found, cannot create admin user");
		return;
	}

	const defaultPassword = "Admin@123";
	const passwordHash = await bcrypt.hash(defaultPassword, SALT_ROUNDS);

	const user = await prisma.user.create({
		data: {
			tenantId,
			username: "admin",
			email: "admin@fpc.gov.et",
			passwordHash,
			passwordSalt: "bcrypt",
			status: UserStatus.ACTIVE,
			mustChangePassword: true,
		},
	});

	await prisma.userRole.create({
		data: {
			userId: user.id,
			roleId: itAdminRole.id,
		},
	});

	console.log(`Created IT Admin user: ${user.username}`);
	console.log(`Default password: ${defaultPassword}`);
	console.log("NOTE: User must change password on first login");
};

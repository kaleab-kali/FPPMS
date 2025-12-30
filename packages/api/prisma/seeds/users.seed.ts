import {
	BloodType,
	EmployeeStatus,
	EmployeeType,
	Gender,
	MaritalStatus,
	Prisma,
	PrismaClient,
	UserStatus,
	WorkScheduleType,
} from "@prisma/client";
import * as bcrypt from "bcrypt";

const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD_PREFIX = "Police@";

const generateUsernameFromEmployeeId = (employeeId: string): string => {
	return employeeId.replace(/\//g, "-");
};

const generateDefaultPassword = (): string => {
	const currentYear = new Date().getFullYear();
	return `${DEFAULT_PASSWORD_PREFIX}${currentYear}`;
};

const generateEmployeeId = (type: EmployeeType, number: number, year: number): string => {
	const prefixes = {
		MILITARY: "FPC",
		CIVILIAN: "FPCIV",
		TEMPORARY: "TMP",
	} as const;
	const prefix = prefixes[type];
	const paddedNumber = String(number).padStart(4, "0");
	const yearSuffix = String(year).slice(-2);
	return `${prefix}-${paddedNumber}/${yearSuffix}`;
};

export const seedITAdmin = async (prisma: PrismaClient, tenantId: string): Promise<void> => {
	const existingAdmin = await prisma.user.findFirst({
		where: { tenantId, username: { startsWith: "FPCIV-" }, deletedAt: null },
		include: { userRoles: { include: { role: true } } },
	});

	if (existingAdmin?.userRoles.some((ur) => ur.role.code === "IT_ADMIN")) {
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

	const hqCenter = await prisma.center.findFirst({
		where: { tenantId, code: "HQ" },
	});

	if (!hqCenter) {
		console.log("HQ center not found, cannot create IT Admin employee");
		return;
	}

	const ictDepartment = await prisma.department.findFirst({
		where: { tenantId, code: "ICT" },
	});

	if (!ictDepartment) {
		console.log("ICT department not found, cannot create IT Admin employee");
		return;
	}

	const dheadPosition = await prisma.position.findFirst({
		where: { tenantId, code: "DHEAD" },
	});

	if (!dheadPosition) {
		console.log("DHEAD position not found, cannot create IT Admin employee");
		return;
	}

	const addisAbabaRegion = await prisma.region.findFirst({
		where: { tenantId, code: "AA" },
	});

	if (!addisAbabaRegion) {
		console.log("Addis Ababa region not found, cannot create IT Admin employee");
		return;
	}

	const boleSubCity = await prisma.subCity.findFirst({
		where: { tenantId, code: "BO" },
	});

	if (!boleSubCity) {
		console.log("Bole subcity not found, cannot create IT Admin employee");
		return;
	}

	const boleWoreda = await prisma.woreda.findFirst({
		where: { tenantId, code: "BO01" },
	});

	if (!boleWoreda) {
		console.log("Bole woreda not found, cannot create IT Admin employee");
		return;
	}

	const currentYear = new Date().getFullYear();
	const tenant = await prisma.tenant.findUnique({
		where: { id: tenantId },
		select: { settings: true },
	});

	const existingSettings = (tenant?.settings as Prisma.JsonObject) ?? {};
	const counterKey = `employeeIdCounter_CIVILIAN_${currentYear}`;
	const currentCounter = (existingSettings[counterKey] as number) ?? 0;
	const newCounter = currentCounter + 1;

	const employeeId = generateEmployeeId(EmployeeType.CIVILIAN, newCounter, currentYear);
	const username = generateUsernameFromEmployeeId(employeeId);
	const defaultPassword = generateDefaultPassword();

	const employee = await prisma.employee.create({
		data: {
			tenantId,
			centerId: hqCenter.id,
			employeeId,
			employeeType: EmployeeType.CIVILIAN,
			firstName: "System",
			firstNameAm: "ሲስተም",
			middleName: "IT",
			middleNameAm: "አይቲ",
			lastName: "Administrator",
			lastNameAm: "አስተዳዳሪ",
			fullName: "System IT Administrator",
			fullNameAm: "ሲስተም አይቲ አስተዳዳሪ",
			gender: Gender.MALE,
			dateOfBirth: new Date("1990-01-01"),
			birthPlace: "Addis Ababa",
			birthPlaceAm: "አዲስ አበባ",
			height: 175,
			weight: 70,
			bloodType: BloodType.O_POSITIVE,
			eyeColor: "Brown",
			hairColor: "Black",
			nationality: "Ethiopian",
			ethnicity: "Amhara",
			faydaId: "ETH-ADMIN-001",
			primaryPhone: "+251911000001",
			email: "admin@fpc.gov.et",
			departmentId: ictDepartment.id,
			positionId: dheadPosition.id,
			employmentDate: new Date("2020-01-01"),
			workScheduleType: WorkScheduleType.REGULAR,
			maritalStatus: MaritalStatus.SINGLE,
			currentSalaryStep: 0,
			currentSalary: 25000,
			salaryEffectiveDate: new Date("2020-01-01"),
			status: EmployeeStatus.ACTIVE,
		},
	});

	await prisma.employeeAddress.create({
		data: {
			tenantId,
			employeeId: employee.id,
			addressType: "CURRENT",
			regionId: addisAbabaRegion.id,
			subCityId: boleSubCity.id,
			woredaId: boleWoreda.id,
			houseNumber: "001",
			uniqueAreaName: "Bole Atlas",
			isPrimary: true,
		},
	});

	await prisma.employeeMotherInfo.create({
		data: {
			tenantId,
			employeeId: employee.id,
			fullName: "Admin Mother Name",
			fullNameAm: "አስተዳዳሪ እናት ስም",
			isAlive: true,
		},
	});

	await prisma.employeeEmergencyContact.create({
		data: {
			tenantId,
			employeeId: employee.id,
			fullName: "Emergency Contact",
			fullNameAm: "ድንገተኛ ግንኙነት",
			relationship: "SIBLING",
			phone: "+251911000002",
			priority: 1,
		},
	});

	const updatedSettings: Prisma.JsonObject = {
		...existingSettings,
		[counterKey]: newCounter,
	};
	await prisma.tenant.update({
		where: { id: tenantId },
		data: {
			settings: updatedSettings,
		},
	});

	const passwordHash = await bcrypt.hash(defaultPassword, SALT_ROUNDS);

	const user = await prisma.user.create({
		data: {
			tenantId,
			centerId: hqCenter.id,
			employeeId: employee.id,
			username,
			email: employee.email,
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

	console.log(`Created IT Admin employee: ${employee.fullName} (${employeeId})`);
	console.log(`Created IT Admin user: ${username}`);
	console.log(`Default password: ${defaultPassword}`);
	console.log("NOTE: User must change password on first login");
};

export const seedUsersFromEmployees = async (prisma: PrismaClient, tenantId: string): Promise<void> => {
	const employees = await prisma.employee.findMany({
		where: {
			tenantId,
			deletedAt: null,
			status: EmployeeStatus.ACTIVE,
		},
		include: {
			center: true,
		},
	});

	const existingUsers = await prisma.user.findMany({
		where: { tenantId, deletedAt: null },
		select: { employeeId: true },
	});

	const existingEmployeeIds = new Set(existingUsers.map((u) => u.employeeId).filter(Boolean));

	const employeeRole = await prisma.role.findFirst({
		where: { code: "EMPLOYEE" },
	});

	if (!employeeRole) {
		console.log("EMPLOYEE role not found, cannot create employee users");
		return;
	}

	const defaultPassword = generateDefaultPassword();
	const passwordHash = await bcrypt.hash(defaultPassword, SALT_ROUNDS);

	let createdCount = 0;

	for (const employee of employees) {
		if (existingEmployeeIds.has(employee.id)) {
			continue;
		}

		const username = generateUsernameFromEmployeeId(employee.employeeId);

		const user = await prisma.user.create({
			data: {
				tenantId,
				centerId: employee.centerId,
				employeeId: employee.id,
				username,
				email: employee.email,
				passwordHash,
				passwordSalt: "bcrypt",
				status: UserStatus.ACTIVE,
				mustChangePassword: true,
			},
		});

		await prisma.userRole.create({
			data: {
				userId: user.id,
				roleId: employeeRole.id,
			},
		});

		createdCount++;
		console.log(`Created user for employee: ${employee.fullName} (${username})`);
	}

	if (createdCount > 0) {
		console.log(`\nCreated ${createdCount} users from employees`);
		console.log(`Default password for all: ${defaultPassword}`);
	} else {
		console.log("No new users needed to be created");
	}
};

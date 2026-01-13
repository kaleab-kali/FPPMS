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
		where: { tenantId, username: { startsWith: "FPC-" }, deletedAt: null },
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

	const commanderRank = await prisma.militaryRank.findFirst({
		where: { code: "CMDR" },
	});

	if (!commanderRank) {
		console.log("CMDR (Commander) rank not found, cannot create IT Admin employee");
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
	const counterKey = `employeeIdCounter_MILITARY_${currentYear}`;
	const currentCounter = (existingSettings[counterKey] as number) ?? 0;
	const newCounter = currentCounter + 1;

	const employeeId = generateEmployeeId(EmployeeType.MILITARY, newCounter, currentYear);
	const username = generateUsernameFromEmployeeId(employeeId);
	const defaultPassword = generateDefaultPassword();

	const employee = await prisma.employee.create({
		data: {
			tenantId,
			centerId: null,
			employeeId,
			employeeType: EmployeeType.MILITARY,
			firstName: "Tesfaye",
			firstNameAm: "ተስፋዬ",
			middleName: "Bekele",
			middleNameAm: "በቀለ",
			lastName: "Hailu",
			lastNameAm: "ሃይሉ",
			fullName: "Tesfaye Bekele Hailu",
			fullNameAm: "ተስፋዬ በቀለ ሃይሉ",
			gender: Gender.MALE,
			dateOfBirth: new Date("1985-03-15"),
			birthPlace: "Addis Ababa",
			birthPlaceAm: "አዲስ አበባ",
			height: 175,
			weight: 70,
			bloodType: BloodType.O_POSITIVE,
			eyeColor: "Brown",
			hairColor: "Black",
			nationality: "Ethiopian",
			ethnicity: "Amhara",
			faydaId: "ETH-IT-ADMIN-001",
			primaryPhone: "+251911000001",
			email: "it.admin@fpc.gov.et",
			departmentId: ictDepartment.id,
			positionId: dheadPosition.id,
			rankId: commanderRank.id,
			employmentDate: new Date("2015-01-01"),
			workScheduleType: WorkScheduleType.REGULAR,
			maritalStatus: MaritalStatus.MARRIED,
			currentSalaryStep: 5,
			currentSalary: 14000,
			salaryEffectiveDate: new Date("2023-01-01"),
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
			fullName: "Almaz Tadesse",
			fullNameAm: "አልማዝ ታደሰ",
			isAlive: true,
		},
	});

	await prisma.employeeEmergencyContact.create({
		data: {
			tenantId,
			employeeId: employee.id,
			fullName: "Kebede Bekele",
			fullNameAm: "ከበደ በቀለ",
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
			centerId: null,
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

	console.log(`\n=== IT ADMIN CREATED ===`);
	console.log(`Employee: ${employee.fullName} (${employeeId})`);
	console.log(`Rank: Commander (CMDR) - MILITARY employee`);
	console.log(`Username: ${username}`);
	console.log(`Default password: ${defaultPassword}`);
	console.log(`Email: ${employee.email}`);
	console.log(`NOTE: IT Admin has ALL_CENTERS scope (centerId is null)`);
	console.log(`NOTE: User must change password on first login`);
	console.log(`========================\n`);
};

export const seedEmergencySystemAccount = async (prisma: PrismaClient, tenantId: string): Promise<void> => {
	const SYSTEM_ACCOUNT_ID = "FPC-SYSTEM-0001/25";

	const existingSystemUser = await prisma.user.findFirst({
		where: { tenantId, username: "FPC-SYSTEM-0001-25", deletedAt: null },
	});

	if (existingSystemUser) {
		console.log("Emergency System Account already exists, skipping...");
		return;
	}

	const itAdminRole = await prisma.role.findFirst({
		where: { code: "IT_ADMIN" },
	});

	if (!itAdminRole) {
		console.log("IT_ADMIN role not found, cannot create system account");
		return;
	}

	const ictDepartment = await prisma.department.findFirst({
		where: { tenantId, code: "ICT" },
	});

	if (!ictDepartment) {
		console.log("ICT department not found, cannot create system account");
		return;
	}

	const dirPosition = await prisma.position.findFirst({
		where: { tenantId, code: "DIR" },
	});

	if (!dirPosition) {
		console.log("DIR position not found, cannot create system account");
		return;
	}

	const depCommGenRank = await prisma.militaryRank.findFirst({
		where: { code: "DEP_COMM_GEN" },
	});

	if (!depCommGenRank) {
		console.log("DEP_COMM_GEN (Deputy Commissioner General) rank not found, cannot create system account");
		return;
	}

	const addisAbabaRegion = await prisma.region.findFirst({
		where: { tenantId, code: "AA" },
	});

	if (!addisAbabaRegion) {
		console.log("Addis Ababa region not found, cannot create system account");
		return;
	}

	const boleSubCity = await prisma.subCity.findFirst({
		where: { tenantId, code: "BO" },
	});

	if (!boleSubCity) {
		console.log("Bole subcity not found, cannot create system account");
		return;
	}

	const boleWoreda = await prisma.woreda.findFirst({
		where: { tenantId, code: "BO01" },
	});

	if (!boleWoreda) {
		console.log("Bole woreda not found, cannot create system account");
		return;
	}

	const systemEmployee = await prisma.employee.create({
		data: {
			tenantId,
			centerId: null,
			employeeId: SYSTEM_ACCOUNT_ID,
			employeeType: EmployeeType.MILITARY,
			firstName: "FPC",
			firstNameAm: "ኤፍፒሲ",
			middleName: "Emergency",
			middleNameAm: "ድንገተኛ",
			lastName: "System",
			lastNameAm: "ሲስተም",
			fullName: "FPC Emergency System Account",
			fullNameAm: "ኤፍፒሲ ድንገተኛ ሲስተም መለያ",
			gender: Gender.MALE,
			dateOfBirth: new Date("2000-01-01"),
			birthPlace: "System Generated",
			birthPlaceAm: "ሲስተም",
			height: 0,
			weight: 0,
			bloodType: BloodType.O_POSITIVE,
			eyeColor: "N/A",
			hairColor: "N/A",
			nationality: "Ethiopian",
			faydaId: "SYSTEM-EMERGENCY-001",
			primaryPhone: "+251000000000",
			email: "emergency.system@fpc.gov.et",
			departmentId: ictDepartment.id,
			positionId: dirPosition.id,
			rankId: depCommGenRank.id,
			employmentDate: new Date("2020-01-01"),
			workScheduleType: WorkScheduleType.REGULAR,
			maritalStatus: MaritalStatus.SINGLE,
			currentSalaryStep: 0,
			currentSalary: 0,
			status: EmployeeStatus.ACTIVE,
		},
	});

	await prisma.employeeAddress.create({
		data: {
			tenantId,
			employeeId: systemEmployee.id,
			addressType: "CURRENT",
			regionId: addisAbabaRegion.id,
			subCityId: boleSubCity.id,
			woredaId: boleWoreda.id,
			houseNumber: "HQ",
			uniqueAreaName: "Federal Prison Commission HQ",
			isPrimary: true,
		},
	});

	await prisma.employeeMotherInfo.create({
		data: {
			tenantId,
			employeeId: systemEmployee.id,
			fullName: "System Generated",
			fullNameAm: "ሲስተም",
			isAlive: false,
		},
	});

	await prisma.employeeEmergencyContact.create({
		data: {
			tenantId,
			employeeId: systemEmployee.id,
			fullName: "IT Department",
			fullNameAm: "የአይቲ ክፍል",
			relationship: "EMPLOYER",
			phone: "+251111000000",
			priority: 1,
		},
	});

	const emergencyPassword = `Emergency@${new Date().getFullYear()}!Secure`;
	const passwordHash = await bcrypt.hash(emergencyPassword, SALT_ROUNDS);

	const systemUser = await prisma.user.create({
		data: {
			tenantId,
			centerId: null,
			employeeId: systemEmployee.id,
			username: generateUsernameFromEmployeeId(SYSTEM_ACCOUNT_ID),
			email: systemEmployee.email,
			passwordHash,
			passwordSalt: "bcrypt",
			status: UserStatus.INACTIVE,
			mustChangePassword: true,
		},
	});

	await prisma.userRole.create({
		data: {
			userId: systemUser.id,
			roleId: itAdminRole.id,
		},
	});

	console.log(`\n=== EMERGENCY SYSTEM ACCOUNT CREATED ===`);
	console.log(`Employee ID: ${SYSTEM_ACCOUNT_ID}`);
	console.log(`Username: FPC-SYSTEM-0001-25`);
	console.log(`Status: INACTIVE (break-glass only)`);
	console.log(`CRITICAL: Store password securely offline!`);
	console.log(`Emergency Password: ${emergencyPassword}`);
	console.log(`NOTE: This account should ONLY be activated in emergencies`);
	console.log(`NOTE: All logins to this account trigger security alerts`);
	console.log(`=========================================\n`);
};

interface SystemUserConfig {
	positionCode: string;
	departmentCode: string;
	centerCode: string;
	roleCode: string;
	isHqUser: boolean;
}

const SYSTEM_USER_CONFIGS: SystemUserConfig[] = [
	{ positionCode: "DIR", departmentCode: "ADM", centerCode: "HQ", roleCode: "HQ_ADMIN", isHqUser: true },
	{ positionCode: "DHEAD", departmentCode: "HR", centerCode: "HQ", roleCode: "HR_DIRECTOR", isHqUser: true },
	{ positionCode: "DIR", departmentCode: "SEC", centerCode: "KLT", roleCode: "CENTER_COMMANDER", isHqUser: false },
	{ positionCode: "HRSP", departmentCode: "HR", centerCode: "KLT", roleCode: "HR_OFFICER", isHqUser: false },
	{ positionCode: "DIR", departmentCode: "SEC", centerCode: "ZWY", roleCode: "CENTER_COMMANDER", isHqUser: false },
	{ positionCode: "HRSP", departmentCode: "HR", centerCode: "ZWY", roleCode: "HR_OFFICER", isHqUser: false },
	{ positionCode: "DIR", departmentCode: "SEC", centerCode: "DRD", roleCode: "CENTER_COMMANDER", isHqUser: false },
	{ positionCode: "DIR", departmentCode: "SEC", centerCode: "SRB", roleCode: "CENTER_COMMANDER", isHqUser: false },
	{ positionCode: "HRSP", departmentCode: "HR", centerCode: "SRB", roleCode: "HR_OFFICER", isHqUser: false },
	{ positionCode: "ACCT", departmentCode: "FIN", centerCode: "KLT", roleCode: "FINANCE_OFFICER", isHqUser: false },
	{ positionCode: "ACCT", departmentCode: "FIN", centerCode: "ZWY", roleCode: "FINANCE_OFFICER", isHqUser: false },
	{ positionCode: "DHEAD", departmentCode: "TRN", centerCode: "DRD", roleCode: "DEPARTMENT_HEAD", isHqUser: false },
];

export const seedUsersFromEmployees = async (prisma: PrismaClient, tenantId: string): Promise<void> => {
	const existingUsers = await prisma.user.findMany({
		where: { tenantId, deletedAt: null },
		select: { employeeId: true },
	});

	const existingEmployeeIds = new Set(existingUsers.map((u) => u.employeeId).filter(Boolean));

	const defaultPassword = generateDefaultPassword();
	const passwordHash = await bcrypt.hash(defaultPassword, SALT_ROUNDS);

	let createdCount = 0;

	for (const config of SYSTEM_USER_CONFIGS) {
		const position = await prisma.position.findFirst({
			where: { tenantId, code: config.positionCode },
		});

		if (!position) {
			console.log(`Position ${config.positionCode} not found, skipping...`);
			continue;
		}

		const department = await prisma.department.findFirst({
			where: { tenantId, code: config.departmentCode },
		});

		if (!department) {
			console.log(`Department ${config.departmentCode} not found, skipping...`);
			continue;
		}

		let centerId: string | null = null;
		if (!config.isHqUser) {
			const center = await prisma.center.findFirst({
				where: { tenantId, code: config.centerCode },
			});

			if (!center) {
				console.log(`Center ${config.centerCode} not found, skipping...`);
				continue;
			}
			centerId = center.id;
		}

		const role = await prisma.role.findFirst({
			where: { code: config.roleCode },
		});

		if (!role) {
			console.log(`Role ${config.roleCode} not found, skipping...`);
			continue;
		}

		const employee = await prisma.employee.findFirst({
			where: {
				tenantId,
				centerId,
				departmentId: department.id,
				positionId: position.id,
				status: EmployeeStatus.ACTIVE,
				deletedAt: null,
			},
		});

		if (!employee) {
			console.log(
				`No employee found for ${config.roleCode} at ${config.centerCode}/${config.departmentCode}, skipping...`,
			);
			continue;
		}

		if (existingEmployeeIds.has(employee.id)) {
			console.log(`User already exists for employee ${employee.fullName}, skipping...`);
			continue;
		}

		const username = generateUsernameFromEmployeeId(employee.employeeId);

		const user = await prisma.user.create({
			data: {
				tenantId,
				centerId,
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
				roleId: role.id,
			},
		});

		existingEmployeeIds.add(employee.id);
		createdCount++;

		const scopeInfo = config.isHqUser ? "(HQ user - centerId: null)" : `(Center: ${config.centerCode})`;
		console.log(`Created user for ${employee.fullName} as ${config.roleCode} ${scopeInfo}`);
	}

	if (createdCount > 0) {
		console.log(`\nCreated ${createdCount} system users (HR and officials only)`);
		console.log(`Default password for all: ${defaultPassword}`);
		console.log("\nNOTE: Only HR personnel and officials have system access.");
		console.log("NOTE: Regular employees do NOT have system access.");
	} else {
		console.log("No new users needed to be created");
	}
};

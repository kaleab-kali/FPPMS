import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Employee, EmployeeStatus, EmployeeType, MaritalStatus, Prisma, WorkScheduleType } from "@prisma/client";
import { PrismaService } from "#api/database/prisma.service";
import {
	CreateCivilianEmployeeDto,
	CreateMilitaryEmployeeDto,
	CreateTemporaryEmployeeDto,
	EmployeeFilterDto,
	EmployeeListResponseDto,
	EmployeeResponseDto,
	UpdateEmployeeDto,
} from "#api/modules/employees/dto/index";
import { EmployeeIdGeneratorService } from "#api/modules/employees/services/employee-id-generator.service";
import { RetirementCalculationService } from "#api/modules/employees/services/retirement-calculation.service";

const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_SALARY_STEP = 0;

interface EmployeeAddressRelation {
	id: string;
	addressType: string;
	regionId: string;
	subCityId: string;
	woredaId: string;
	houseNumber: string | null;
	uniqueAreaName: string | null;
}

interface EmployeeMotherInfoRelation {
	fullName: string;
	fullNameAm: string;
	phone: string | null;
	isAlive: boolean;
	address: string | null;
}

interface EmployeeEmergencyContactRelation {
	fullName: string;
	fullNameAm: string;
	relationship: string;
	phone: string;
	alternativePhone: string | null;
	email: string | null;
	regionId: string | null;
	subCityId: string | null;
	woredaId: string | null;
	houseNumber: string | null;
	uniqueAreaName: string | null;
	priority: number;
}

type EmployeeWithRelations = Employee & {
	center?: { id: string; name: string } | null;
	department?: { id: string; name: string } | null;
	position?: { id: string; name: string } | null;
	rank?: { id: string; name: string } | null;
	addresses?: EmployeeAddressRelation[];
	motherInfo?: EmployeeMotherInfoRelation | null;
	emergencyContacts?: EmployeeEmergencyContactRelation[];
};

type EmployeeListItem = Employee & {
	department?: { name: string } | null;
	position?: { name: string } | null;
	rank?: { name: string } | null;
};

@Injectable()
export class EmployeesService {
	constructor(
		private prisma: PrismaService,
		private employeeIdGenerator: EmployeeIdGeneratorService,
		private retirementCalculation: RetirementCalculationService,
	) {}

	async registerMilitaryEmployee(
		tenantId: string,
		dto: CreateMilitaryEmployeeDto,
		createdBy: string,
	): Promise<EmployeeResponseDto> {
		const rank = await this.prisma.militaryRank.findFirst({
			where: {
				id: dto.rankId,
				OR: [{ tenantId }, { tenantId: null }],
			},
			include: { salarySteps: true },
		});

		if (!rank) {
			throw new BadRequestException("Military rank not found");
		}

		await this.validateRelations(tenantId, dto);

		const employeeId = await this.employeeIdGenerator.generateEmployeeId(tenantId, EmployeeType.MILITARY);
		const fullName = `${dto.firstName} ${dto.middleName} ${dto.lastName}`;
		const fullNameAm = `${dto.firstNameAm} ${dto.middleNameAm} ${dto.lastNameAm}`;
		const retirementInfo = await this.retirementCalculation.calculateRetirementDate(dto.dateOfBirth, dto.rankId);

		const salaryStep = dto.currentSalaryStep ?? DEFAULT_SALARY_STEP;
		const salaryStepRecord = rank.salarySteps.find((s) => s.stepNumber === salaryStep);
		const currentSalary = salaryStepRecord?.salaryAmount ?? rank.baseSalary;

		const employee = await this.prisma.employee.create({
			data: {
				tenantId,
				employeeId,
				employeeType: EmployeeType.MILITARY,
				firstName: dto.firstName,
				firstNameAm: dto.firstNameAm,
				middleName: dto.middleName,
				middleNameAm: dto.middleNameAm,
				lastName: dto.lastName,
				lastNameAm: dto.lastNameAm,
				fullName,
				fullNameAm,
				gender: dto.gender,
				dateOfBirth: dto.dateOfBirth,
				birthPlace: dto.birthPlace,
				birthPlaceAm: dto.birthPlaceAm,
				height: dto.height,
				weight: dto.weight,
				bloodType: dto.bloodType,
				eyeColor: dto.eyeColor,
				hairColor: dto.hairColor,
				distinguishingMarks: dto.distinguishingMarks,
				ethnicity: dto.ethnicity,
				faydaId: dto.faydaId,
				passportNumber: dto.passportNumber,
				drivingLicense: dto.drivingLicense,
				primaryPhone: dto.primaryPhone,
				secondaryPhone: dto.secondaryPhone,
				email: dto.email,
				centerId: dto.centerId,
				departmentId: dto.departmentId,
				positionId: dto.positionId,
				rankId: dto.rankId,
				employmentDate: dto.employmentDate,
				originalEmploymentDate: dto.originalEmploymentDate,
				isTransfer: dto.isTransfer ?? false,
				sourceOrganization: dto.sourceOrganization,
				workScheduleType: dto.workScheduleType ?? WorkScheduleType.REGULAR,
				maritalStatus: dto.maritalStatus ?? MaritalStatus.SINGLE,
				marriageDate: dto.marriageDate,
				currentSalaryStep: salaryStep,
				currentSalary,
				salaryEffectiveDate: dto.employmentDate,
				retirementDate: retirementInfo.retirementDate,
				status: EmployeeStatus.ACTIVE,
				createdBy,
				addresses: dto.address
					? {
							create: {
								tenantId,
								addressType: dto.address.addressType,
								regionId: dto.address.regionId,
								subCityId: dto.address.subCityId,
								woredaId: dto.address.woredaId,
								houseNumber: dto.address.houseNumber,
								uniqueAreaName: dto.address.uniqueAreaName,
								isPrimary: true,
							},
						}
					: undefined,
				motherInfo: dto.motherInfo
					? {
							create: {
								tenantId,
								fullName: dto.motherInfo.fullName,
								fullNameAm: dto.motherInfo.fullNameAm,
								phone: dto.motherInfo.phone,
								isAlive: dto.motherInfo.isAlive ?? true,
								address: dto.motherInfo.address,
							},
						}
					: undefined,
				emergencyContacts: dto.emergencyContact
					? {
							create: {
								tenantId,
								fullName: dto.emergencyContact.fullName,
								fullNameAm: dto.emergencyContact.fullNameAm,
								relationship: dto.emergencyContact.relationship,
								phone: dto.emergencyContact.phone,
								alternativePhone: dto.emergencyContact.alternativePhone,
								email: dto.emergencyContact.email,
								regionId: dto.emergencyContact.regionId,
								subCityId: dto.emergencyContact.subCityId,
								woredaId: dto.emergencyContact.woredaId,
								houseNumber: dto.emergencyContact.houseNumber,
								uniqueAreaName: dto.emergencyContact.uniqueAreaName,
								priority: 1,
							},
						}
					: undefined,
			},
			include: this.getEmployeeIncludes(),
		});

		return this.mapToResponse(employee);
	}

	async registerCivilianEmployee(
		tenantId: string,
		dto: CreateCivilianEmployeeDto,
		createdBy: string,
	): Promise<EmployeeResponseDto> {
		await this.validateRelations(tenantId, dto);

		const employeeId = await this.employeeIdGenerator.generateEmployeeId(tenantId, EmployeeType.CIVILIAN);
		const fullName = `${dto.firstName} ${dto.middleName} ${dto.lastName}`;
		const fullNameAm = `${dto.firstNameAm} ${dto.middleNameAm} ${dto.lastNameAm}`;
		const retirementInfo = await this.retirementCalculation.calculateRetirementDate(dto.dateOfBirth);

		const employee = await this.prisma.employee.create({
			data: {
				tenantId,
				employeeId,
				employeeType: EmployeeType.CIVILIAN,
				firstName: dto.firstName,
				firstNameAm: dto.firstNameAm,
				middleName: dto.middleName,
				middleNameAm: dto.middleNameAm,
				lastName: dto.lastName,
				lastNameAm: dto.lastNameAm,
				fullName,
				fullNameAm,
				gender: dto.gender,
				dateOfBirth: dto.dateOfBirth,
				birthPlace: dto.birthPlace,
				birthPlaceAm: dto.birthPlaceAm,
				height: dto.height,
				weight: dto.weight,
				bloodType: dto.bloodType,
				eyeColor: dto.eyeColor,
				hairColor: dto.hairColor,
				distinguishingMarks: dto.distinguishingMarks,
				ethnicity: dto.ethnicity,
				faydaId: dto.faydaId,
				passportNumber: dto.passportNumber,
				drivingLicense: dto.drivingLicense,
				primaryPhone: dto.primaryPhone,
				secondaryPhone: dto.secondaryPhone,
				email: dto.email,
				centerId: dto.centerId,
				departmentId: dto.departmentId,
				positionId: dto.positionId,
				employmentDate: dto.employmentDate,
				originalEmploymentDate: dto.originalEmploymentDate,
				isTransfer: dto.isTransfer ?? false,
				sourceOrganization: dto.sourceOrganization,
				workScheduleType: dto.workScheduleType ?? WorkScheduleType.REGULAR,
				maritalStatus: dto.maritalStatus ?? MaritalStatus.SINGLE,
				marriageDate: dto.marriageDate,
				currentSalary: dto.currentSalary,
				salaryEffectiveDate: dto.employmentDate,
				retirementDate: retirementInfo.retirementDate,
				status: EmployeeStatus.ACTIVE,
				createdBy,
				addresses: dto.address
					? {
							create: {
								tenantId,
								addressType: dto.address.addressType,
								regionId: dto.address.regionId,
								subCityId: dto.address.subCityId,
								woredaId: dto.address.woredaId,
								houseNumber: dto.address.houseNumber,
								uniqueAreaName: dto.address.uniqueAreaName,
								isPrimary: true,
							},
						}
					: undefined,
				motherInfo: dto.motherInfo
					? {
							create: {
								tenantId,
								fullName: dto.motherInfo.fullName,
								fullNameAm: dto.motherInfo.fullNameAm,
								phone: dto.motherInfo.phone,
								isAlive: dto.motherInfo.isAlive ?? true,
								address: dto.motherInfo.address,
							},
						}
					: undefined,
				emergencyContacts: dto.emergencyContact
					? {
							create: {
								tenantId,
								fullName: dto.emergencyContact.fullName,
								fullNameAm: dto.emergencyContact.fullNameAm,
								relationship: dto.emergencyContact.relationship,
								phone: dto.emergencyContact.phone,
								alternativePhone: dto.emergencyContact.alternativePhone,
								email: dto.emergencyContact.email,
								regionId: dto.emergencyContact.regionId,
								subCityId: dto.emergencyContact.subCityId,
								woredaId: dto.emergencyContact.woredaId,
								houseNumber: dto.emergencyContact.houseNumber,
								uniqueAreaName: dto.emergencyContact.uniqueAreaName,
								priority: 1,
							},
						}
					: undefined,
			},
			include: this.getEmployeeIncludes(),
		});

		return this.mapToResponse(employee);
	}

	async registerTemporaryEmployee(
		tenantId: string,
		dto: CreateTemporaryEmployeeDto,
		createdBy: string,
	): Promise<EmployeeResponseDto> {
		await this.validateRelations(tenantId, dto);

		const employeeId = await this.employeeIdGenerator.generateEmployeeId(tenantId, EmployeeType.TEMPORARY);
		const fullName = `${dto.firstName} ${dto.middleName} ${dto.lastName}`;
		const fullNameAm = `${dto.firstNameAm} ${dto.middleNameAm} ${dto.lastNameAm}`;

		const employee = await this.prisma.employee.create({
			data: {
				tenantId,
				employeeId,
				employeeType: EmployeeType.TEMPORARY,
				firstName: dto.firstName,
				firstNameAm: dto.firstNameAm,
				middleName: dto.middleName,
				middleNameAm: dto.middleNameAm,
				lastName: dto.lastName,
				lastNameAm: dto.lastNameAm,
				fullName,
				fullNameAm,
				gender: dto.gender,
				dateOfBirth: dto.dateOfBirth,
				birthPlace: dto.birthPlace,
				birthPlaceAm: dto.birthPlaceAm,
				height: dto.height,
				weight: dto.weight,
				bloodType: dto.bloodType,
				eyeColor: dto.eyeColor,
				hairColor: dto.hairColor,
				distinguishingMarks: dto.distinguishingMarks,
				ethnicity: dto.ethnicity,
				faydaId: dto.faydaId,
				passportNumber: dto.passportNumber,
				drivingLicense: dto.drivingLicense,
				primaryPhone: dto.primaryPhone,
				secondaryPhone: dto.secondaryPhone,
				email: dto.email,
				centerId: dto.centerId,
				departmentId: dto.departmentId,
				positionId: dto.positionId,
				employmentDate: dto.employmentDate,
				originalEmploymentDate: dto.originalEmploymentDate,
				isTransfer: dto.isTransfer ?? false,
				sourceOrganization: dto.sourceOrganization,
				workScheduleType: dto.workScheduleType ?? WorkScheduleType.REGULAR,
				maritalStatus: dto.maritalStatus ?? MaritalStatus.SINGLE,
				marriageDate: dto.marriageDate,
				contractStartDate: dto.contractStartDate,
				contractEndDate: dto.contractEndDate,
				contractAmount: dto.contractAmount,
				status: EmployeeStatus.ACTIVE,
				createdBy,
				addresses: dto.address
					? {
							create: {
								tenantId,
								addressType: dto.address.addressType,
								regionId: dto.address.regionId,
								subCityId: dto.address.subCityId,
								woredaId: dto.address.woredaId,
								houseNumber: dto.address.houseNumber,
								uniqueAreaName: dto.address.uniqueAreaName,
								isPrimary: true,
							},
						}
					: undefined,
				motherInfo: dto.motherInfo
					? {
							create: {
								tenantId,
								fullName: dto.motherInfo.fullName,
								fullNameAm: dto.motherInfo.fullNameAm,
								phone: dto.motherInfo.phone,
								isAlive: dto.motherInfo.isAlive ?? true,
								address: dto.motherInfo.address,
							},
						}
					: undefined,
				emergencyContacts: dto.emergencyContact
					? {
							create: {
								tenantId,
								fullName: dto.emergencyContact.fullName,
								fullNameAm: dto.emergencyContact.fullNameAm,
								relationship: dto.emergencyContact.relationship,
								phone: dto.emergencyContact.phone,
								alternativePhone: dto.emergencyContact.alternativePhone,
								email: dto.emergencyContact.email,
								regionId: dto.emergencyContact.regionId,
								subCityId: dto.emergencyContact.subCityId,
								woredaId: dto.emergencyContact.woredaId,
								houseNumber: dto.emergencyContact.houseNumber,
								uniqueAreaName: dto.emergencyContact.uniqueAreaName,
								priority: 1,
							},
						}
					: undefined,
			},
			include: this.getEmployeeIncludes(),
		});

		return this.mapToResponse(employee);
	}

	async findAll(
		tenantId: string,
		filter: EmployeeFilterDto,
	): Promise<{ data: EmployeeListResponseDto[]; total: number; page: number; pageSize: number }> {
		const page = filter.page ?? 1;
		const pageSize = filter.pageSize ?? DEFAULT_PAGE_SIZE;
		const skip = (page - 1) * pageSize;

		const where = this.buildWhereClause(tenantId, filter);
		const orderBy = this.buildOrderBy(filter);

		const [employees, total] = await Promise.all([
			this.prisma.employee.findMany({
				where,
				skip,
				take: pageSize,
				orderBy,
				include: {
					department: { select: { name: true } },
					position: { select: { name: true } },
					rank: { select: { name: true } },
				},
			}),
			this.prisma.employee.count({ where }),
		]);

		const data = employees.map((e) => this.mapToListResponse(e));

		return { data, total, page, pageSize };
	}

	async findOne(tenantId: string, id: string): Promise<EmployeeResponseDto> {
		const employee = await this.prisma.employee.findFirst({
			where: { id, tenantId, deletedAt: null },
			include: this.getEmployeeIncludes(),
		});

		if (!employee) {
			throw new NotFoundException(`Employee with ID "${id}" not found`);
		}

		return this.mapToResponse(employee);
	}

	async findByEmployeeId(tenantId: string, employeeId: string): Promise<EmployeeResponseDto> {
		const employee = await this.prisma.employee.findFirst({
			where: { employeeId, tenantId, deletedAt: null },
			include: this.getEmployeeIncludes(),
		});

		if (!employee) {
			throw new NotFoundException(`Employee with ID "${employeeId}" not found`);
		}

		return this.mapToResponse(employee);
	}

	async update(tenantId: string, id: string, dto: UpdateEmployeeDto, updatedBy: string): Promise<EmployeeResponseDto> {
		const existing = await this.prisma.employee.findFirst({
			where: { id, tenantId, deletedAt: null },
		});

		if (!existing) {
			throw new NotFoundException(`Employee with ID "${id}" not found`);
		}

		const updateData = this.buildUpdatePayload(dto, existing, updatedBy);

		if (dto.rankId !== undefined && existing.employeeType === EmployeeType.MILITARY) {
			updateData.rankId = dto.rankId;
			const retirementInfo = await this.retirementCalculation.calculateRetirementDate(
				dto.dateOfBirth ?? existing.dateOfBirth,
				dto.rankId,
			);
			updateData.retirementDate = retirementInfo.retirementDate;
		}

		const employee = await this.prisma.employee.update({
			where: { id },
			data: updateData,
			include: this.getEmployeeIncludes(),
		});

		return this.mapToResponse(employee);
	}

	private buildUpdatePayload(
		dto: UpdateEmployeeDto,
		existing: Employee,
		updatedBy: string,
	): Prisma.EmployeeUncheckedUpdateInput {
		const directFields = [
			"firstName",
			"firstNameAm",
			"middleName",
			"middleNameAm",
			"lastName",
			"lastNameAm",
			"gender",
			"dateOfBirth",
			"birthPlace",
			"birthPlaceAm",
			"height",
			"weight",
			"bloodType",
			"eyeColor",
			"hairColor",
			"distinguishingMarks",
			"nationality",
			"ethnicity",
			"faydaId",
			"faydaVerified",
			"passportNumber",
			"drivingLicense",
			"primaryPhone",
			"secondaryPhone",
			"email",
			"centerId",
			"departmentId",
			"positionId",
			"workScheduleType",
			"maritalStatus",
			"marriageDate",
			"currentSalaryStep",
			"currentSalary",
			"contractStartDate",
			"contractEndDate",
			"contractAmount",
		] as const;

		const updateData: Prisma.EmployeeUncheckedUpdateInput = { updatedBy };

		for (const field of directFields) {
			if (dto[field] !== undefined) {
				(updateData as Record<string, unknown>)[field] = dto[field];
			}
		}

		if (dto.firstName || dto.middleName || dto.lastName) {
			updateData.fullName = `${dto.firstName ?? existing.firstName} ${dto.middleName ?? existing.middleName} ${dto.lastName ?? existing.lastName}`;
		}
		if (dto.firstNameAm || dto.middleNameAm || dto.lastNameAm) {
			updateData.fullNameAm = `${dto.firstNameAm ?? existing.firstNameAm} ${dto.middleNameAm ?? existing.middleNameAm} ${dto.lastNameAm ?? existing.lastNameAm}`;
		}

		if (dto.status !== undefined) {
			updateData.status = dto.status;
			updateData.statusChangedAt = new Date();
			updateData.statusReason = dto.statusReason;
		}

		return updateData;
	}

	async remove(tenantId: string, id: string, deletedBy: string): Promise<{ message: string }> {
		const existing = await this.prisma.employee.findFirst({
			where: { id, tenantId, deletedAt: null },
		});

		if (!existing) {
			throw new NotFoundException(`Employee with ID "${id}" not found`);
		}

		await this.prisma.employee.update({
			where: { id },
			data: {
				deletedAt: new Date(),
				status: EmployeeStatus.INACTIVE,
				updatedBy: deletedBy,
			},
		});

		return { message: "Employee deleted successfully" };
	}

	async getStatistics(tenantId: string): Promise<{
		total: number;
		byType: Record<string, number>;
		byStatus: Record<string, number>;
		byGender: Record<string, number>;
	}> {
		const [total, byType, byStatus, byGender] = await Promise.all([
			this.prisma.employee.count({ where: { tenantId, deletedAt: null } }),
			this.prisma.employee.groupBy({
				by: ["employeeType"],
				where: { tenantId, deletedAt: null },
				_count: true,
			}),
			this.prisma.employee.groupBy({
				by: ["status"],
				where: { tenantId, deletedAt: null },
				_count: true,
			}),
			this.prisma.employee.groupBy({
				by: ["gender"],
				where: { tenantId, deletedAt: null },
				_count: true,
			}),
		]);

		return {
			total,
			byType: Object.fromEntries(byType.map((t) => [t.employeeType, t._count])),
			byStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count])),
			byGender: Object.fromEntries(byGender.map((g) => [g.gender, g._count])),
		};
	}

	private buildWhereClause(tenantId: string, filter: EmployeeFilterDto): Prisma.EmployeeWhereInput {
		const where: Prisma.EmployeeWhereInput = { tenantId, deletedAt: null };

		if (filter.search) {
			where.OR = [
				{ fullName: { contains: filter.search, mode: "insensitive" } },
				{ fullNameAm: { contains: filter.search, mode: "insensitive" } },
				{ employeeId: { contains: filter.search, mode: "insensitive" } },
				{ primaryPhone: { contains: filter.search } },
			];
		}

		if (filter.employeeType) where.employeeType = filter.employeeType;
		if (filter.status) where.status = filter.status;
		if (filter.gender) where.gender = filter.gender;
		if (filter.centerId) where.centerId = filter.centerId;
		if (filter.departmentId) where.departmentId = filter.departmentId;
		if (filter.positionId) where.positionId = filter.positionId;
		if (filter.rankId) where.rankId = filter.rankId;

		return where;
	}

	private buildOrderBy(filter: EmployeeFilterDto): Prisma.EmployeeOrderByWithRelationInput {
		if (filter.sortBy) {
			return { [filter.sortBy]: filter.sortOrder ?? "asc" };
		}
		return { fullName: "asc" };
	}

	private async validateRelations(
		tenantId: string,
		dto: { centerId?: string; departmentId?: string; positionId?: string },
	): Promise<void> {
		if (dto.centerId) {
			const center = await this.prisma.center.findFirst({ where: { id: dto.centerId, tenantId } });
			if (!center) throw new BadRequestException("Center not found in this tenant");
		}
		if (dto.departmentId) {
			const department = await this.prisma.department.findFirst({ where: { id: dto.departmentId, tenantId } });
			if (!department) throw new BadRequestException("Department not found in this tenant");
		}
		if (dto.positionId) {
			const position = await this.prisma.position.findFirst({ where: { id: dto.positionId, tenantId } });
			if (!position) throw new BadRequestException("Position not found in this tenant");
		}
	}

	private getEmployeeIncludes() {
		return {
			center: { select: { id: true, name: true } },
			department: { select: { id: true, name: true } },
			position: { select: { id: true, name: true } },
			rank: { select: { id: true, name: true } },
			addresses: {
				select: {
					id: true,
					addressType: true,
					regionId: true,
					subCityId: true,
					woredaId: true,
					houseNumber: true,
					uniqueAreaName: true,
				},
				orderBy: { isPrimary: "desc" as const },
			},
			motherInfo: {
				select: {
					fullName: true,
					fullNameAm: true,
					phone: true,
					isAlive: true,
					address: true,
				},
			},
			emergencyContacts: {
				select: {
					fullName: true,
					fullNameAm: true,
					relationship: true,
					phone: true,
					alternativePhone: true,
					email: true,
					regionId: true,
					subCityId: true,
					woredaId: true,
					houseNumber: true,
					uniqueAreaName: true,
					priority: true,
				},
				orderBy: { priority: "asc" as const },
				take: 1,
			},
		} as const;
	}

	private async mapToResponse(employee: EmployeeWithRelations): Promise<EmployeeResponseDto> {
		const n = <T>(value: T | null): T | undefined => value ?? undefined;
		const e = employee;

		const primaryAddress = e.addresses?.[0];
		const motherInfo = e.motherInfo;
		const emergencyContact = e.emergencyContacts?.[0];

		const lookupNames = await this.fetchAddressLookupNames(
			primaryAddress?.regionId,
			primaryAddress?.subCityId,
			primaryAddress?.woredaId,
			emergencyContact?.regionId,
			emergencyContact?.subCityId,
			emergencyContact?.woredaId,
		);

		return {
			id: e.id,
			tenantId: e.tenantId,
			employeeId: e.employeeId,
			employeeType: e.employeeType,
			firstName: e.firstName,
			firstNameAm: e.firstNameAm,
			middleName: e.middleName,
			middleNameAm: e.middleNameAm,
			lastName: e.lastName,
			lastNameAm: e.lastNameAm,
			fullName: e.fullName,
			fullNameAm: e.fullNameAm,
			gender: e.gender,
			dateOfBirth: e.dateOfBirth,
			birthPlace: n(e.birthPlace),
			birthPlaceAm: n(e.birthPlaceAm),
			height: n(e.height),
			weight: n(e.weight),
			bloodType: n(e.bloodType),
			eyeColor: n(e.eyeColor),
			hairColor: n(e.hairColor),
			distinguishingMarks: n(e.distinguishingMarks),
			nationality: e.nationality,
			ethnicity: n(e.ethnicity),
			faydaId: n(e.faydaId),
			faydaVerified: e.faydaVerified,
			passportNumber: n(e.passportNumber),
			drivingLicense: n(e.drivingLicense),
			primaryPhone: e.primaryPhone,
			secondaryPhone: n(e.secondaryPhone),
			email: n(e.email),
			centerId: n(e.centerId),
			centerName: e.center?.name,
			departmentId: n(e.departmentId),
			departmentName: e.department?.name,
			positionId: n(e.positionId),
			positionName: e.position?.name,
			rankId: n(e.rankId),
			rankName: e.rank?.name,
			employmentDate: e.employmentDate,
			originalEmploymentDate: n(e.originalEmploymentDate),
			isTransfer: e.isTransfer,
			sourceOrganization: n(e.sourceOrganization),
			workScheduleType: e.workScheduleType,
			maritalStatus: e.maritalStatus,
			marriageDate: n(e.marriageDate),
			currentSalaryStep: e.currentSalaryStep,
			currentSalary: e.currentSalary?.toString(),
			salaryEffectiveDate: n(e.salaryEffectiveDate),
			contractStartDate: n(e.contractStartDate),
			contractEndDate: n(e.contractEndDate),
			contractAmount: e.contractAmount?.toString(),
			retirementDate: n(e.retirementDate),
			status: e.status,
			statusChangedAt: n(e.statusChangedAt),
			statusReason: n(e.statusReason),
			addressRegionId: primaryAddress?.regionId,
			addressRegionName: lookupNames.addressRegionName,
			addressSubCityId: primaryAddress?.subCityId,
			addressSubCityName: lookupNames.addressSubCityName,
			addressWoredaId: primaryAddress?.woredaId,
			addressWoredaName: lookupNames.addressWoredaName,
			addressHouseNumber: n(primaryAddress?.houseNumber),
			addressUniqueAreaName: n(primaryAddress?.uniqueAreaName),
			motherFullName: motherInfo?.fullName,
			motherFullNameAm: motherInfo?.fullNameAm,
			motherPhone: n(motherInfo?.phone),
			motherIsAlive: motherInfo?.isAlive,
			motherAddress: n(motherInfo?.address),
			emergencyFullName: emergencyContact?.fullName,
			emergencyFullNameAm: emergencyContact?.fullNameAm,
			emergencyRelationship: emergencyContact?.relationship,
			emergencyPhone: emergencyContact?.phone,
			emergencyAltPhone: n(emergencyContact?.alternativePhone),
			emergencyEmail: n(emergencyContact?.email),
			emergencyRegionId: n(emergencyContact?.regionId),
			emergencyRegionName: lookupNames.emergencyRegionName,
			emergencySubCityId: n(emergencyContact?.subCityId),
			emergencySubCityName: lookupNames.emergencySubCityName,
			emergencyWoredaId: n(emergencyContact?.woredaId),
			emergencyWoredaName: lookupNames.emergencyWoredaName,
			emergencyHouseNumber: n(emergencyContact?.houseNumber),
			emergencyUniqueAreaName: n(emergencyContact?.uniqueAreaName),
			createdAt: e.createdAt,
			updatedAt: e.updatedAt,
		};
	}

	private async fetchAddressLookupNames(
		addressRegionId?: string,
		addressSubCityId?: string,
		addressWoredaId?: string,
		emergencyRegionId?: string | null,
		emergencySubCityId?: string | null,
		emergencyWoredaId?: string | null,
	): Promise<{
		addressRegionName?: string;
		addressSubCityName?: string;
		addressWoredaName?: string;
		emergencyRegionName?: string;
		emergencySubCityName?: string;
		emergencyWoredaName?: string;
	}> {
		const regionIds = [addressRegionId, emergencyRegionId].filter(Boolean) as string[];
		const subCityIds = [addressSubCityId, emergencySubCityId].filter(Boolean) as string[];
		const woredaIds = [addressWoredaId, emergencyWoredaId].filter(Boolean) as string[];

		const [regions, subCities, woredas] = await Promise.all([
			regionIds.length > 0
				? this.prisma.region.findMany({ where: { id: { in: regionIds } }, select: { id: true, name: true } })
				: [],
			subCityIds.length > 0
				? this.prisma.subCity.findMany({ where: { id: { in: subCityIds } }, select: { id: true, name: true } })
				: [],
			woredaIds.length > 0
				? this.prisma.woreda.findMany({ where: { id: { in: woredaIds } }, select: { id: true, name: true } })
				: [],
		]);

		const regionMap = new Map(regions.map((r) => [r.id, r.name]));
		const subCityMap = new Map(subCities.map((s) => [s.id, s.name]));
		const woredaMap = new Map(woredas.map((w) => [w.id, w.name]));

		return {
			addressRegionName: addressRegionId ? regionMap.get(addressRegionId) : undefined,
			addressSubCityName: addressSubCityId ? subCityMap.get(addressSubCityId) : undefined,
			addressWoredaName: addressWoredaId ? woredaMap.get(addressWoredaId) : undefined,
			emergencyRegionName: emergencyRegionId ? regionMap.get(emergencyRegionId) : undefined,
			emergencySubCityName: emergencySubCityId ? subCityMap.get(emergencySubCityId) : undefined,
			emergencyWoredaName: emergencyWoredaId ? woredaMap.get(emergencyWoredaId) : undefined,
		};
	}

	private mapToListResponse(employee: EmployeeListItem): EmployeeListResponseDto {
		return {
			id: employee.id,
			employeeId: employee.employeeId,
			employeeType: employee.employeeType,
			fullName: employee.fullName,
			fullNameAm: employee.fullNameAm,
			gender: employee.gender,
			primaryPhone: employee.primaryPhone,
			departmentName: employee.department?.name || undefined,
			positionName: employee.position?.name || undefined,
			rankName: employee.rank?.name || undefined,
			status: employee.status,
		};
	}
}

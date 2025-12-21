import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "#api/database/prisma.service";
import { CreateMedicalRecordDto, UpdateMedicalRecordDto } from "#api/modules/employees/dto";

const MAX_CHILD_AGE = 18;

@Injectable()
export class EmployeeMedicalService {
	constructor(private readonly prisma: PrismaService) {}

	async create(tenantId: string, dto: CreateMedicalRecordDto, recordedBy: string) {
		const employee = await this.prisma.employee.findFirst({
			where: { id: dto.employeeId, tenantId, deletedAt: null },
		});

		if (!employee) {
			throw new NotFoundException("Employee not found");
		}

		if (dto.familyMemberId) {
			const familyMember = await this.prisma.employeeFamilyMember.findFirst({
				where: { id: dto.familyMemberId, employeeId: dto.employeeId, deletedAt: null },
			});

			if (!familyMember) {
				throw new NotFoundException("Family member not found");
			}
		}

		return this.prisma.employeeMedicalRecord.create({
			data: {
				tenantId,
				employeeId: dto.employeeId,
				familyMemberId: dto.familyMemberId,
				isForSelf: !dto.familyMemberId,
				visitDate: dto.visitDate,
				institutionName: dto.institutionName,
				institutionNameAm: dto.institutionNameAm,
				institutionAddress: dto.institutionAddress,
				institutionCity: dto.institutionCity,
				visitType: dto.visitType,
				diagnosis: dto.diagnosis,
				diagnosisAm: dto.diagnosisAm,
				treatment: dto.treatment,
				treatmentAm: dto.treatmentAm,
				prescribedMedication: dto.prescribedMedication,
				doctorName: dto.doctorName,
				amountCovered: dto.amountCovered,
				amountPaidByEmployee: dto.amountPaidByEmployee,
				totalBillAmount: dto.totalBillAmount,
				insuranceClaimNumber: dto.insuranceClaimNumber,
				insuranceProvider: dto.insuranceProvider,
				followUpDate: dto.followUpDate,
				notes: dto.notes,
				recordedBy,
			},
			include: {
				familyMember: true,
				employee: {
					select: { id: true, employeeId: true, fullName: true, fullNameAm: true },
				},
			},
		});
	}

	async findAllByEmployee(tenantId: string, employeeId: string) {
		const employee = await this.prisma.employee.findFirst({
			where: { id: employeeId, tenantId, deletedAt: null },
		});

		if (!employee) {
			throw new NotFoundException("Employee not found");
		}

		return this.prisma.employeeMedicalRecord.findMany({
			where: { tenantId, employeeId, deletedAt: null },
			include: {
				familyMember: true,
			},
			orderBy: { visitDate: "desc" },
		});
	}

	async findOne(tenantId: string, id: string) {
		const record = await this.prisma.employeeMedicalRecord.findFirst({
			where: { id, tenantId, deletedAt: null },
			include: {
				familyMember: true,
				employee: {
					select: { id: true, employeeId: true, fullName: true, fullNameAm: true },
				},
			},
		});

		if (!record) {
			throw new NotFoundException("Medical record not found");
		}

		return record;
	}

	async update(tenantId: string, id: string, dto: UpdateMedicalRecordDto) {
		const record = await this.prisma.employeeMedicalRecord.findFirst({
			where: { id, tenantId, deletedAt: null },
		});

		if (!record) {
			throw new NotFoundException("Medical record not found");
		}

		return this.prisma.employeeMedicalRecord.update({
			where: { id },
			data: {
				visitDate: dto.visitDate,
				institutionName: dto.institutionName,
				institutionNameAm: dto.institutionNameAm,
				institutionAddress: dto.institutionAddress,
				institutionCity: dto.institutionCity,
				visitType: dto.visitType,
				diagnosis: dto.diagnosis,
				diagnosisAm: dto.diagnosisAm,
				treatment: dto.treatment,
				treatmentAm: dto.treatmentAm,
				prescribedMedication: dto.prescribedMedication,
				doctorName: dto.doctorName,
				amountCovered: dto.amountCovered,
				amountPaidByEmployee: dto.amountPaidByEmployee,
				totalBillAmount: dto.totalBillAmount,
				insuranceClaimNumber: dto.insuranceClaimNumber,
				insuranceProvider: dto.insuranceProvider,
				followUpDate: dto.followUpDate,
				notes: dto.notes,
			},
			include: {
				familyMember: true,
			},
		});
	}

	async delete(tenantId: string, id: string) {
		const record = await this.prisma.employeeMedicalRecord.findFirst({
			where: { id, tenantId, deletedAt: null },
		});

		if (!record) {
			throw new NotFoundException("Medical record not found");
		}

		return this.prisma.employeeMedicalRecord.update({
			where: { id },
			data: { deletedAt: new Date() },
		});
	}

	async getEligibleFamilyMembers(tenantId: string, employeeId: string) {
		const employee = await this.prisma.employee.findFirst({
			where: { id: employeeId, tenantId, deletedAt: null },
		});

		if (!employee) {
			throw new NotFoundException("Employee not found");
		}

		const familyMembers = await this.prisma.employeeFamilyMember.findMany({
			where: { employeeId, tenantId, deletedAt: null },
		});

		return familyMembers.filter((member) => this.checkEligibility(member));
	}

	async getMedicalStats(tenantId: string, employeeId: string) {
		const employee = await this.prisma.employee.findFirst({
			where: { id: employeeId, tenantId, deletedAt: null },
		});

		if (!employee) {
			throw new NotFoundException("Employee not found");
		}

		const familyMembers = await this.prisma.employeeFamilyMember.findMany({
			where: { employeeId, tenantId, deletedAt: null },
		});

		const eligibleMembers = familyMembers.filter((member) => this.checkEligibility(member));

		const records = await this.prisma.employeeMedicalRecord.findMany({
			where: { employeeId, tenantId, deletedAt: null },
		});

		const totalAmountCovered = records.reduce((sum, r) => sum + (Number(r.amountCovered) || 0), 0);

		return {
			totalFamilyMembers: familyMembers.length,
			eligibleMembers: eligibleMembers.length,
			totalRecords: records.length,
			selfRecords: records.filter((r) => r.isForSelf).length,
			familyRecords: records.filter((r) => !r.isForSelf).length,
			totalAmountCovered,
		};
	}

	private checkEligibility(familyMember: {
		relationship: string;
		dateOfBirth: Date | null;
		isAlive: boolean;
		divorceDate: Date | null;
	}): boolean {
		if (!familyMember.isAlive) {
			return false;
		}

		const relationship = familyMember.relationship.toUpperCase();

		if (relationship === "SPOUSE" || relationship === "HUSBAND" || relationship === "WIFE") {
			return !familyMember.divorceDate;
		}

		if (relationship === "CHILD" || relationship === "SON" || relationship === "DAUGHTER") {
			if (!familyMember.dateOfBirth) {
				return false;
			}
			const age = this.calculateAge(familyMember.dateOfBirth);
			return age < MAX_CHILD_AGE;
		}

		return false;
	}

	private calculateAge(dateOfBirth: Date): number {
		const today = new Date();
		const birthDate = new Date(dateOfBirth);
		let age = today.getFullYear() - birthDate.getFullYear();
		const monthDiff = today.getMonth() - birthDate.getMonth();

		if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
			age--;
		}

		return age;
	}
}

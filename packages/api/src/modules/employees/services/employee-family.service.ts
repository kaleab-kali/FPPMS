import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "#api/database/prisma.service";
import { CreateFamilyMemberDto, UpdateFamilyMemberDto } from "#api/modules/employees/dto";

@Injectable()
export class EmployeeFamilyService {
	constructor(private readonly prisma: PrismaService) {}

	async create(tenantId: string, dto: CreateFamilyMemberDto) {
		const employee = await this.prisma.employee.findFirst({
			where: { id: dto.employeeId, tenantId, deletedAt: null },
		});

		if (!employee) {
			throw new NotFoundException("Employee not found");
		}

		return this.prisma.employeeFamilyMember.create({
			data: {
				tenantId,
				employeeId: dto.employeeId,
				relationship: dto.relationship,
				fullName: dto.fullName,
				fullNameAm: dto.fullNameAm,
				gender: dto.gender,
				dateOfBirth: dto.dateOfBirth,
				nationalId: dto.nationalId,
				phone: dto.phone,
				occupation: dto.occupation,
				marriageDate: dto.marriageDate,
				schoolName: dto.schoolName,
				isAlive: dto.isAlive ?? true,
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

		return this.prisma.employeeFamilyMember.findMany({
			where: { tenantId, employeeId, deletedAt: null },
			orderBy: { createdAt: "asc" },
		});
	}

	async findOne(tenantId: string, id: string) {
		const member = await this.prisma.employeeFamilyMember.findFirst({
			where: { id, tenantId, deletedAt: null },
		});

		if (!member) {
			throw new NotFoundException("Family member not found");
		}

		return member;
	}

	async update(tenantId: string, id: string, dto: UpdateFamilyMemberDto) {
		const member = await this.prisma.employeeFamilyMember.findFirst({
			where: { id, tenantId, deletedAt: null },
		});

		if (!member) {
			throw new NotFoundException("Family member not found");
		}

		return this.prisma.employeeFamilyMember.update({
			where: { id },
			data: {
				relationship: dto.relationship,
				fullName: dto.fullName,
				fullNameAm: dto.fullNameAm,
				gender: dto.gender,
				dateOfBirth: dto.dateOfBirth,
				nationalId: dto.nationalId,
				phone: dto.phone,
				occupation: dto.occupation,
				marriageDate: dto.marriageDate,
				schoolName: dto.schoolName,
				isAlive: dto.isAlive,
			},
		});
	}

	async delete(tenantId: string, id: string) {
		const member = await this.prisma.employeeFamilyMember.findFirst({
			where: { id, tenantId, deletedAt: null },
		});

		if (!member) {
			throw new NotFoundException("Family member not found");
		}

		return this.prisma.employeeFamilyMember.update({
			where: { id },
			data: { deletedAt: new Date() },
		});
	}

	async getSpouse(tenantId: string, employeeId: string) {
		return this.prisma.employeeFamilyMember.findFirst({
			where: {
				tenantId,
				employeeId,
				relationship: { in: ["SPOUSE", "HUSBAND", "WIFE"] },
				deletedAt: null,
			},
		});
	}

	async getChildren(tenantId: string, employeeId: string) {
		return this.prisma.employeeFamilyMember.findMany({
			where: {
				tenantId,
				employeeId,
				relationship: { in: ["SON", "DAUGHTER", "CHILD"] },
				deletedAt: null,
			},
			orderBy: { dateOfBirth: "desc" },
		});
	}
}

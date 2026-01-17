import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { WorkScheduleType } from "@prisma/client";
import { PrismaService } from "#api/database/prisma.service";
import { CreateShiftDefinitionDto, UpdateShiftDefinitionDto } from "../dto";
import { AttendanceCalculationService } from "./attendance-calculation.service";

@Injectable()
export class ShiftDefinitionService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly calculationService: AttendanceCalculationService,
	) {}

	async create(tenantId: string, dto: CreateShiftDefinitionDto) {
		const existing = await this.prisma.shiftDefinition.findUnique({
			where: {
				tenantId_code: {
					tenantId,
					code: dto.code,
				},
			},
		});

		if (existing) {
			throw new BadRequestException(`Shift with code ${dto.code} already exists`);
		}

		const shift = await this.prisma.shiftDefinition.create({
			data: {
				tenantId,
				code: dto.code,
				name: dto.name,
				nameAm: dto.nameAm,
				scheduleType: dto.scheduleType ?? WorkScheduleType.REGULAR,
				startTime: dto.startTime,
				endTime: dto.endTime,
				isOvernight: dto.isOvernight ?? false,
				breakMinutes: dto.breakMinutes ?? 30,
				holidayAware: dto.holidayAware ?? true,
				color: dto.color,
				isActive: dto.isActive ?? true,
			},
		});

		return this.mapToResponse(shift);
	}

	async findAll(tenantId: string, includeInactive = false) {
		const where = includeInactive ? { tenantId } : { tenantId, isActive: true };

		const shifts = await this.prisma.shiftDefinition.findMany({
			where,
			orderBy: { code: "asc" },
		});

		return shifts.map((s) => this.mapToResponse(s));
	}

	async findOne(tenantId: string, id: string) {
		const shift = await this.prisma.shiftDefinition.findFirst({
			where: { id, tenantId },
		});

		if (!shift) {
			throw new NotFoundException("Shift definition not found");
		}

		return this.mapToResponse(shift);
	}

	async findByCode(tenantId: string, code: string) {
		const shift = await this.prisma.shiftDefinition.findUnique({
			where: {
				tenantId_code: {
					tenantId,
					code,
				},
			},
		});

		if (!shift) {
			throw new NotFoundException("Shift definition not found");
		}

		return this.mapToResponse(shift);
	}

	async update(tenantId: string, id: string, dto: UpdateShiftDefinitionDto) {
		const shift = await this.prisma.shiftDefinition.findFirst({
			where: { id, tenantId },
		});

		if (!shift) {
			throw new NotFoundException("Shift definition not found");
		}

		const updated = await this.prisma.shiftDefinition.update({
			where: { id },
			data: {
				name: dto.name,
				nameAm: dto.nameAm,
				scheduleType: dto.scheduleType,
				startTime: dto.startTime,
				endTime: dto.endTime,
				isOvernight: dto.isOvernight,
				breakMinutes: dto.breakMinutes,
				holidayAware: dto.holidayAware,
				color: dto.color,
				isActive: dto.isActive,
			},
		});

		return this.mapToResponse(updated);
	}

	async delete(tenantId: string, id: string) {
		const shift = await this.prisma.shiftDefinition.findFirst({
			where: { id, tenantId },
		});

		if (!shift) {
			throw new NotFoundException("Shift definition not found");
		}

		const assignmentCount = await this.prisma.shiftAssignment.count({
			where: { shiftId: id },
		});

		if (assignmentCount > 0) {
			throw new BadRequestException(
				`Cannot delete shift with ${assignmentCount} active assignments. Deactivate the shift instead.`,
			);
		}

		const attendanceCount = await this.prisma.attendanceRecord.count({
			where: { shiftId: id },
		});

		if (attendanceCount > 0) {
			throw new BadRequestException(
				`Cannot delete shift with ${attendanceCount} attendance records. Deactivate the shift instead.`,
			);
		}

		await this.prisma.shiftDefinition.delete({
			where: { id },
		});

		return { message: "Shift definition deleted successfully" };
	}

	private mapToResponse(shift: {
		id: string;
		tenantId: string;
		code: string;
		name: string;
		nameAm: string | null;
		scheduleType: WorkScheduleType;
		startTime: string;
		endTime: string;
		isOvernight: boolean;
		breakMinutes: number;
		holidayAware: boolean;
		color: string | null;
		isActive: boolean;
		createdAt: Date;
		updatedAt: Date;
	}) {
		const workingHours = this.calculationService.calculateShiftWorkingHours({
			startTime: shift.startTime,
			endTime: shift.endTime,
			breakMinutes: shift.breakMinutes,
			isOvernight: shift.isOvernight,
		});

		return {
			id: shift.id,
			tenantId: shift.tenantId,
			code: shift.code,
			name: shift.name,
			nameAm: shift.nameAm ?? undefined,
			scheduleType: shift.scheduleType,
			startTime: shift.startTime,
			endTime: shift.endTime,
			isOvernight: shift.isOvernight,
			breakMinutes: shift.breakMinutes,
			holidayAware: shift.holidayAware,
			color: shift.color ?? undefined,
			isActive: shift.isActive,
			createdAt: shift.createdAt,
			updatedAt: shift.updatedAt,
			workingHours: Math.round(workingHours * 100) / 100,
		};
	}
}

import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { ethiopianToGregorian, gregorianToEthiopian } from "#api/common/utils/ethiopian-calendar.util";
import { PrismaService } from "#api/database/prisma.service";
import { CreateHolidayDto, HolidayQueryDto, RECURRENCE_TYPE, UpdateHolidayDto } from "./dto";

@Injectable()
export class HolidaysService {
	constructor(private readonly prisma: PrismaService) {}

	async create(tenantId: string, dto: CreateHolidayDto, createdBy: string) {
		const holidayDate = new Date(dto.holidayDate);

		const existing = await this.prisma.holiday.findUnique({
			where: {
				tenantId_holidayDate: {
					tenantId,
					holidayDate,
				},
			},
		});

		if (existing) {
			throw new BadRequestException("A holiday already exists on this date");
		}

		if (dto.isRecurring && dto.recurrenceType === RECURRENCE_TYPE.YEARLY_ETHIOPIAN) {
			if (!dto.ethiopianMonth || !dto.ethiopianDay) {
				throw new BadRequestException("Ethiopian month and day are required for Ethiopian recurring holidays");
			}
		}

		const holiday = await this.prisma.holiday.create({
			data: {
				tenantId,
				name: dto.name,
				nameAm: dto.nameAm,
				holidayDate,
				holidayType: dto.holidayType,
				isHalfDay: dto.isHalfDay ?? false,
				isRecurring: dto.isRecurring ?? false,
				recurrenceType: dto.recurrenceType ?? null,
				ethiopianMonth: dto.ethiopianMonth ?? null,
				ethiopianDay: dto.ethiopianDay ?? null,
				appliesTo: dto.appliesTo ?? ["ALL"],
				description: dto.description ?? null,
				createdBy,
			},
		});

		return this.mapToResponse(holiday);
	}

	async findAll(tenantId: string, query: HolidayQueryDto) {
		const where: Prisma.HolidayWhereInput = { tenantId };

		if (query.year || query.month) {
			const year = query.year ?? new Date().getFullYear();
			const startMonth = query.month ?? 1;
			const endMonth = query.month ?? 12;

			const startDate = new Date(year, startMonth - 1, 1);
			const endDate = new Date(year, endMonth, 0);

			where.holidayDate = {
				gte: startDate,
				lte: endDate,
			};
		} else if (query.startDate || query.endDate) {
			where.holidayDate = {};
			if (query.startDate) {
				where.holidayDate.gte = new Date(query.startDate);
			}
			if (query.endDate) {
				where.holidayDate.lte = new Date(query.endDate);
			}
		} else if (query.ethiopianYear || query.ethiopianMonth) {
			const ethYear = query.ethiopianYear ?? gregorianToEthiopian(new Date()).year;
			const startMonth = query.ethiopianMonth ?? 1;
			const endMonth = query.ethiopianMonth ?? 13;

			const startDate = ethiopianToGregorian(ethYear, startMonth, 1);
			const endDay = this.getDaysInEthiopianMonth(ethYear, endMonth);
			const endDate = ethiopianToGregorian(ethYear, endMonth, endDay);

			where.holidayDate = {
				gte: startDate,
				lte: endDate,
			};
		}

		if (query.holidayType) {
			where.holidayType = query.holidayType;
		}

		if (query.appliesTo) {
			where.appliesTo = {
				has: query.appliesTo,
			};
		}

		if (query.recurringOnly) {
			where.isRecurring = true;
		}

		const holidays = await this.prisma.holiday.findMany({
			where,
			orderBy: { holidayDate: "asc" },
		});

		return holidays.map((h) => this.mapToResponse(h));
	}

	async findOne(tenantId: string, id: string) {
		const holiday = await this.prisma.holiday.findFirst({
			where: { id, tenantId },
		});

		if (!holiday) {
			throw new NotFoundException("Holiday not found");
		}

		return this.mapToResponse(holiday);
	}

	async findByDate(tenantId: string, date: string) {
		const holidayDate = new Date(date);

		const holiday = await this.prisma.holiday.findUnique({
			where: {
				tenantId_holidayDate: {
					tenantId,
					holidayDate,
				},
			},
		});

		return holiday ? this.mapToResponse(holiday) : null;
	}

	async update(tenantId: string, id: string, dto: UpdateHolidayDto) {
		const holiday = await this.prisma.holiday.findFirst({
			where: { id, tenantId },
		});

		if (!holiday) {
			throw new NotFoundException("Holiday not found");
		}

		if (dto.holidayDate) {
			const newDate = new Date(dto.holidayDate);
			const existing = await this.prisma.holiday.findUnique({
				where: {
					tenantId_holidayDate: {
						tenantId,
						holidayDate: newDate,
					},
				},
			});

			if (existing && existing.id !== id) {
				throw new BadRequestException("A holiday already exists on this date");
			}
		}

		const updated = await this.prisma.holiday.update({
			where: { id },
			data: {
				name: dto.name,
				nameAm: dto.nameAm,
				holidayDate: dto.holidayDate ? new Date(dto.holidayDate) : undefined,
				holidayType: dto.holidayType,
				isHalfDay: dto.isHalfDay,
				isRecurring: dto.isRecurring,
				recurrenceType: dto.recurrenceType,
				ethiopianMonth: dto.ethiopianMonth,
				ethiopianDay: dto.ethiopianDay,
				appliesTo: dto.appliesTo,
				description: dto.description,
			},
		});

		return this.mapToResponse(updated);
	}

	async delete(tenantId: string, id: string) {
		const holiday = await this.prisma.holiday.findFirst({
			where: { id, tenantId },
		});

		if (!holiday) {
			throw new NotFoundException("Holiday not found");
		}

		await this.prisma.holiday.delete({
			where: { id },
		});

		return { message: "Holiday deleted successfully" };
	}

	async generateRecurringHolidays(tenantId: string, year: number) {
		const recurringHolidays = await this.prisma.holiday.findMany({
			where: {
				tenantId,
				isRecurring: true,
			},
		});

		const created: string[] = [];
		const skipped: string[] = [];

		for (const template of recurringHolidays) {
			let newDate: Date;

			if (
				template.recurrenceType === RECURRENCE_TYPE.YEARLY_ETHIOPIAN &&
				template.ethiopianMonth &&
				template.ethiopianDay
			) {
				newDate = ethiopianToGregorian(year, template.ethiopianMonth, template.ethiopianDay);
			} else if (template.recurrenceType === RECURRENCE_TYPE.YEARLY_GREGORIAN) {
				const originalDate = template.holidayDate;
				newDate = new Date(year, originalDate.getMonth(), originalDate.getDate());
			} else {
				continue;
			}

			const existing = await this.prisma.holiday.findUnique({
				where: {
					tenantId_holidayDate: {
						tenantId,
						holidayDate: newDate,
					},
				},
			});

			if (existing) {
				skipped.push(template.name);
				continue;
			}

			await this.prisma.holiday.create({
				data: {
					tenantId,
					name: template.name,
					nameAm: template.nameAm,
					holidayDate: newDate,
					holidayType: template.holidayType,
					isHalfDay: template.isHalfDay,
					isRecurring: false,
					recurrenceType: null,
					ethiopianMonth: template.ethiopianMonth,
					ethiopianDay: template.ethiopianDay,
					appliesTo: template.appliesTo,
					description: template.description,
					createdBy: template.createdBy,
				},
			});

			created.push(template.name);
		}

		return {
			created: created.length,
			skipped: skipped.length,
			createdHolidays: created,
			skippedHolidays: skipped,
		};
	}

	async getHolidaysInRange(tenantId: string, startDate: Date, endDate: Date, appliesTo?: string) {
		const where: Prisma.HolidayWhereInput = {
			tenantId,
			holidayDate: {
				gte: startDate,
				lte: endDate,
			},
		};

		if (appliesTo) {
			where.OR = [{ appliesTo: { has: "ALL" } }, { appliesTo: { has: appliesTo } }];
		}

		const holidays = await this.prisma.holiday.findMany({
			where,
			orderBy: { holidayDate: "asc" },
		});

		return holidays.map((h) => this.mapToResponse(h));
	}

	async isHoliday(tenantId: string, date: Date, appliesTo?: string): Promise<boolean> {
		const startOfDay = new Date(date);
		startOfDay.setHours(0, 0, 0, 0);

		const where: Prisma.HolidayWhereInput = {
			tenantId,
			holidayDate: startOfDay,
		};

		if (appliesTo) {
			where.OR = [{ appliesTo: { has: "ALL" } }, { appliesTo: { has: appliesTo } }];
		}

		const holiday = await this.prisma.holiday.findFirst({ where });
		return !!holiday;
	}

	async countWorkingDays(
		tenantId: string,
		startDate: Date,
		endDate: Date,
		options: { excludeWeekends?: boolean; appliesTo?: string } = {},
	): Promise<number> {
		const { excludeWeekends = true, appliesTo } = options;

		const holidays = await this.getHolidaysInRange(tenantId, startDate, endDate, appliesTo);
		const holidayDates = new Set(holidays.map((h) => h.holidayDate.toISOString().split("T")[0]));

		let count = 0;
		const current = new Date(startDate);

		while (current <= endDate) {
			const dayOfWeek = current.getDay();
			const dateStr = current.toISOString().split("T")[0];

			const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
			const isHolidayDate = holidayDates.has(dateStr);

			if ((!excludeWeekends || !isWeekend) && !isHolidayDate) {
				count++;
			}

			current.setDate(current.getDate() + 1);
		}

		return count;
	}

	private getDaysInEthiopianMonth(year: number, month: number): number {
		if (month === 13) {
			return year % 4 === 3 ? 6 : 5;
		}
		return 30;
	}

	private mapToResponse(holiday: Prisma.HolidayGetPayload<object>) {
		const eth = gregorianToEthiopian(holiday.holidayDate);

		return {
			id: holiday.id,
			tenantId: holiday.tenantId,
			name: holiday.name,
			nameAm: holiday.nameAm,
			holidayDate: holiday.holidayDate,
			holidayType: holiday.holidayType,
			isHalfDay: holiday.isHalfDay,
			isRecurring: holiday.isRecurring,
			recurrenceType: holiday.recurrenceType ?? undefined,
			ethiopianMonth: holiday.ethiopianMonth ?? undefined,
			ethiopianDay: holiday.ethiopianDay ?? undefined,
			appliesTo: holiday.appliesTo,
			description: holiday.description ?? undefined,
			createdAt: holiday.createdAt,
			updatedAt: holiday.updatedAt,
			createdBy: holiday.createdBy ?? undefined,
			ethiopianDateFormatted: `${eth.day} ${eth.monthName} ${eth.year}`,
		};
	}
}

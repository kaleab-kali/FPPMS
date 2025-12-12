import { Injectable } from "@nestjs/common";
import { PrismaService } from "#api/database/prisma.service";

const DEFAULT_CIVILIAN_RETIREMENT_AGE = 60;

interface RetirementInfo {
	retirementDate: Date;
	retirementAge: number;
	yearsUntilRetirement: number;
	monthsUntilRetirement: number;
}

@Injectable()
export class RetirementCalculationService {
	constructor(private prisma: PrismaService) {}

	async calculateRetirementDate(dateOfBirth: Date, rankId?: string): Promise<RetirementInfo> {
		let retirementAge = DEFAULT_CIVILIAN_RETIREMENT_AGE;

		if (rankId) {
			const rank = await this.prisma.militaryRank.findUnique({
				where: { id: rankId },
				select: { retirementAge: true },
			});

			if (rank) {
				retirementAge = rank.retirementAge;
			}
		}

		const birthDate = new Date(dateOfBirth);
		const retirementDate = new Date(birthDate);
		retirementDate.setFullYear(retirementDate.getFullYear() + retirementAge);

		const today = new Date();
		const diffTime = retirementDate.getTime() - today.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		const yearsUntilRetirement = Math.floor(diffDays / 365);
		const remainingDays = diffDays % 365;
		const monthsUntilRetirement = Math.floor(remainingDays / 30);

		return {
			retirementDate,
			retirementAge,
			yearsUntilRetirement: Math.max(0, yearsUntilRetirement),
			monthsUntilRetirement: Math.max(0, monthsUntilRetirement),
		};
	}

	async getRetirementAgeByRank(rankId: string): Promise<number> {
		const rank = await this.prisma.militaryRank.findUnique({
			where: { id: rankId },
			select: { retirementAge: true, level: true },
		});

		if (!rank) {
			return DEFAULT_CIVILIAN_RETIREMENT_AGE;
		}

		return rank.retirementAge;
	}

	calculateAge(dateOfBirth: Date): number {
		const today = new Date();
		const birthDate = new Date(dateOfBirth);
		let age = today.getFullYear() - birthDate.getFullYear();
		const monthDiff = today.getMonth() - birthDate.getMonth();

		if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
			age--;
		}

		return age;
	}

	isEligibleForRetirement(dateOfBirth: Date, retirementAge: number): boolean {
		const age = this.calculateAge(dateOfBirth);
		return age >= retirementAge;
	}

	async getUpcomingRetirements(
		tenantId: string,
		withinMonths: number,
	): Promise<Array<{ employeeId: string; employeeName: string; retirementDate: Date }>> {
		const futureDate = new Date();
		futureDate.setMonth(futureDate.getMonth() + withinMonths);

		const employees = await this.prisma.employee.findMany({
			where: {
				tenantId,
				status: "ACTIVE",
				retirementDate: {
					lte: futureDate,
					gte: new Date(),
				},
			},
			select: {
				id: true,
				fullName: true,
				retirementDate: true,
			},
			orderBy: { retirementDate: "asc" },
		});

		return employees.map((e) => ({
			employeeId: e.id,
			employeeName: e.fullName,
			retirementDate: e.retirementDate as Date,
		}));
	}
}

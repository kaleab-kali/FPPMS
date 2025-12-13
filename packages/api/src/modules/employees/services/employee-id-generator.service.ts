import { Injectable } from "@nestjs/common";
import { EmployeeType } from "@prisma/client";
import { PrismaService } from "#api/database/prisma.service";

const EMPLOYEE_ID_PREFIXES = {
	MILITARY: "FPC",
	CIVILIAN: "FPCIV",
	TEMPORARY: "TMP",
} as const;

const EMPLOYEE_ID_PADDING = 4;

@Injectable()
export class EmployeeIdGeneratorService {
	constructor(private prisma: PrismaService) {}

	async generateEmployeeId(tenantId: string, employeeType: EmployeeType): Promise<string> {
		const currentYear = new Date().getFullYear();
		const yearSuffix = String(currentYear).slice(-2);
		const prefix = EMPLOYEE_ID_PREFIXES[employeeType];

		const nextNumber = await this.getAndIncrementCounter(tenantId, currentYear, employeeType);

		const paddedNumber = String(nextNumber).padStart(EMPLOYEE_ID_PADDING, "0");

		return `${prefix}-${paddedNumber}/${yearSuffix}`;
	}

	private async getAndIncrementCounter(tenantId: string, year: number, employeeType: EmployeeType): Promise<number> {
		const counterKey = `employeeIdCounter_${employeeType}_${year}`;

		const tenant = await this.prisma.tenant.findUnique({
			where: { id: tenantId },
			select: { settings: true },
		});

		const settings = (tenant?.settings ?? {}) as Record<string, number>;
		const currentCounter = settings[counterKey] || 0;
		const nextCounter = currentCounter + 1;

		await this.prisma.tenant.update({
			where: { id: tenantId },
			data: {
				settings: {
					...settings,
					[counterKey]: nextCounter,
				},
			},
		});

		return nextCounter;
	}

	async getLastEmployeeId(tenantId: string): Promise<string | undefined> {
		const lastEmployee = await this.prisma.employee.findFirst({
			where: { tenantId },
			orderBy: { createdAt: "desc" },
			select: { employeeId: true },
		});

		return lastEmployee?.employeeId;
	}

	parseEmployeeId(employeeId: string): { prefix: string; number: number; year: string } | undefined {
		const match = employeeId.match(/^([A-Z]+)-(\d+)\/(\d{2})$/);
		if (!match) {
			return undefined;
		}

		return {
			prefix: match[1],
			number: Number.parseInt(match[2], 10),
			year: match[3],
		};
	}
}

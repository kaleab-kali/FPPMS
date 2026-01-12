import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { EmployeeType, Prisma, SalaryChangeType, SalaryEligibilityStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/client";
import { PrismaService } from "#api/database/prisma.service";
import { SalaryCalculationService } from "#api/modules/salary-management/services/salary-calculation.service";
import { SalaryHistoryService } from "#api/modules/salary-management/services/salary-history.service";
import { MassRaiseType } from "#api/modules/salary-management/dto/mass-raise.dto";

const MAX_STEP = 9;

interface ProcessIncrementResult {
	success: boolean;
	employeeId: string;
	employeeName: string;
	fromStep: number;
	toStep: number;
	fromSalary: Decimal;
	toSalary: Decimal;
	historyId?: string;
	error?: string;
}

interface MassRaiseResult {
	totalProcessed: number;
	successCount: number;
	failureCount: number;
	skippedCount: number;
	results: ProcessIncrementResult[];
}

@Injectable()
export class SalaryProgressionService {
	private readonly logger = new Logger(SalaryProgressionService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly salaryCalculation: SalaryCalculationService,
		private readonly salaryHistory: SalaryHistoryService,
	) {}

	@Cron(CronExpression.EVERY_DAY_AT_1AM)
	async runDailyEligibilityCheck(): Promise<void> {
		this.logger.log("Starting daily salary eligibility check...");

		const tenants = await this.prisma.tenant.findMany({
			where: { isActive: true },
			select: { id: true, code: true },
		});

		for (const tenant of tenants) {
			const newlyEligible = await this.checkDailyEligibility(tenant.id);
			this.logger.log(`Tenant ${tenant.code}: Found ${newlyEligible} newly eligible employees`);
		}

		this.logger.log("Daily salary eligibility check completed.");
	}

	async checkDailyEligibility(tenantId: string): Promise<number> {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const eligibleEmployees = await this.prisma.employee.findMany({
			where: {
				tenantId,
				employeeType: EmployeeType.MILITARY,
				status: "ACTIVE",
				rankId: { not: null },
				currentSalaryStep: { lt: MAX_STEP },
				deletedAt: null,
			},
			include: {
				rank: {
					include: {
						salarySteps: {
							orderBy: { stepNumber: "asc" },
						},
					},
				},
			},
		});

		let newEligibilityCount = 0;

		for (const employee of eligibleEmployees) {
			if (!employee.rank) continue;

			const { nextStep, eligibilityDate, isAtCeiling } = await this.salaryCalculation.calculateNextEligibilityDate(
				employee.employmentDate,
				employee.currentSalaryStep,
				employee.rank.stepPeriodYears,
			);

			if (isAtCeiling) continue;

			if (eligibilityDate <= today) {
				const existingEligibility = await this.prisma.salaryStepEligibility.findFirst({
					where: {
						tenantId,
						employeeId: employee.id,
						nextStepNumber: nextStep,
						rankId: employee.rankId!,
						status: { in: [SalaryEligibilityStatus.PENDING, SalaryEligibilityStatus.APPROVED] },
					},
				});

				if (!existingEligibility) {
					const nextStepInfo = employee.rank.salarySteps.find((s) => s.stepNumber === nextStep);

					if (nextStepInfo) {
						await this.prisma.salaryStepEligibility.create({
							data: {
								tenantId,
								employeeId: employee.id,
								rankId: employee.rankId!,
								currentStep: employee.currentSalaryStep,
								nextStepNumber: nextStep,
								currentSalary: employee.currentSalary ?? employee.rank.baseSalary,
								nextSalary: nextStepInfo.salaryAmount,
								eligibilityDate,
								status: SalaryEligibilityStatus.PENDING,
							},
						});
						newEligibilityCount++;
					}
				}
			}
		}

		return newEligibilityCount;
	}

	async processStepIncrement(
		tenantId: string,
		eligibilityId: string,
		processedBy: string,
		effectiveDate?: Date,
		notes?: string,
	): Promise<ProcessIncrementResult> {
		const eligibility = await this.prisma.salaryStepEligibility.findFirst({
			where: {
				id: eligibilityId,
				tenantId,
				status: SalaryEligibilityStatus.PENDING,
			},
			include: {
				employee: {
					select: {
						id: true,
						employeeId: true,
						fullName: true,
						currentSalaryStep: true,
						currentSalary: true,
						rankId: true,
					},
				},
				rank: true,
			},
		});

		if (!eligibility) {
			throw new NotFoundException("Salary eligibility record not found or already processed");
		}

		const actualEffectiveDate = effectiveDate ?? eligibility.eligibilityDate;

		const historyRecord = await this.salaryHistory.createHistoryEntry({
			tenantId,
			employeeId: eligibility.employeeId,
			rankId: eligibility.rankId,
			changeType: SalaryChangeType.STEP_INCREMENT,
			fromStep: eligibility.currentStep,
			toStep: eligibility.nextStepNumber,
			fromSalary: eligibility.currentSalary,
			toSalary: eligibility.nextSalary,
			effectiveDate: actualEffectiveDate,
			isAutomatic: true,
			processedBy,
			approvedBy: processedBy,
			notes,
		});

		await this.prisma.$transaction([
			this.prisma.employee.update({
				where: { id: eligibility.employeeId },
				data: {
					currentSalaryStep: eligibility.nextStepNumber,
					currentSalary: eligibility.nextSalary,
					salaryEffectiveDate: actualEffectiveDate,
				},
			}),
			this.prisma.salaryStepEligibility.update({
				where: { id: eligibilityId },
				data: {
					status: SalaryEligibilityStatus.APPROVED,
					processedAt: new Date(),
					processedBy,
					salaryHistoryId: historyRecord.id,
				},
			}),
		]);

		return {
			success: true,
			employeeId: eligibility.employee.employeeId,
			employeeName: eligibility.employee.fullName,
			fromStep: eligibility.currentStep,
			toStep: eligibility.nextStepNumber,
			fromSalary: eligibility.currentSalary,
			toSalary: eligibility.nextSalary,
			historyId: historyRecord.id,
		};
	}

	async processBatchIncrements(
		tenantId: string,
		eligibilityIds: string[],
		processedBy: string,
		effectiveDate?: Date,
		notes?: string,
	): Promise<{
		processed: number;
		failed: number;
		results: ProcessIncrementResult[];
	}> {
		const results: ProcessIncrementResult[] = [];
		let processed = 0;
		let failed = 0;

		for (const eligibilityId of eligibilityIds) {
			const result = await this.processStepIncrement(tenantId, eligibilityId, processedBy, effectiveDate, notes);

			if (result.success) {
				processed++;
			} else {
				failed++;
			}
			results.push(result);
		}

		return { processed, failed, results };
	}

	async processManualJump(
		tenantId: string,
		employeeId: string,
		toStep: number,
		orderReference: string,
		reason: string,
		effectiveDate: Date,
		processedBy: string,
		documentPath?: string,
		notes?: string,
	): Promise<ProcessIncrementResult> {
		if (!this.salaryCalculation.validateStepNumber(toStep)) {
			throw new BadRequestException(`Invalid step number: ${toStep}. Must be between 0 and ${MAX_STEP}`);
		}

		const employee = await this.prisma.employee.findFirst({
			where: {
				id: employeeId,
				tenantId,
				employeeType: EmployeeType.MILITARY,
				deletedAt: null,
			},
			include: {
				rank: true,
			},
		});

		if (!employee) {
			throw new NotFoundException("Military employee not found");
		}

		if (!employee.rank || !employee.rankId) {
			throw new BadRequestException("Employee does not have an assigned rank");
		}

		if (toStep <= employee.currentSalaryStep) {
			throw new BadRequestException(
				`Target step (${toStep}) must be greater than current step (${employee.currentSalaryStep})`,
			);
		}

		const newSalary = await this.salaryCalculation.getSalaryForStep(employee.rankId, toStep);

		const historyRecord = await this.salaryHistory.createHistoryEntry({
			tenantId,
			employeeId,
			rankId: employee.rankId,
			changeType: SalaryChangeType.MANUAL_JUMP,
			fromStep: employee.currentSalaryStep,
			toStep,
			fromSalary: employee.currentSalary ?? undefined,
			toSalary: newSalary,
			effectiveDate,
			reason,
			orderReference,
			documentPath,
			isAutomatic: false,
			processedBy,
			approvedBy: processedBy,
			notes,
		});

		await this.prisma.employee.update({
			where: { id: employeeId },
			data: {
				currentSalaryStep: toStep,
				currentSalary: newSalary,
				salaryEffectiveDate: effectiveDate,
			},
		});

		await this.prisma.salaryStepEligibility.updateMany({
			where: {
				tenantId,
				employeeId,
				status: SalaryEligibilityStatus.PENDING,
				nextStepNumber: { lte: toStep },
			},
			data: {
				status: SalaryEligibilityStatus.EXPIRED,
				processedAt: new Date(),
				processedBy,
			},
		});

		return {
			success: true,
			employeeId: employee.employeeId,
			employeeName: employee.fullName,
			fromStep: employee.currentSalaryStep,
			toStep,
			fromSalary: employee.currentSalary ?? new Decimal(0),
			toSalary: newSalary,
			historyId: historyRecord.id,
		};
	}

	async processMassRaise(
		tenantId: string,
		rankId: string,
		raiseType: MassRaiseType,
		options: {
			incrementSteps?: number;
			targetStep?: number;
			centerId?: string;
		},
		orderReference: string,
		reason: string,
		effectiveDate: Date,
		processedBy: string,
		documentPath?: string,
		notes?: string,
	): Promise<MassRaiseResult> {
		const rank = await this.prisma.militaryRank.findUnique({
			where: { id: rankId },
			include: {
				salarySteps: {
					orderBy: { stepNumber: "asc" },
				},
			},
		});

		if (!rank) {
			throw new NotFoundException("Rank not found");
		}

		const whereClause: Prisma.EmployeeWhereInput = {
			tenantId,
			rankId,
			employeeType: EmployeeType.MILITARY,
			status: "ACTIVE",
			deletedAt: null,
		};

		if (options.centerId) {
			whereClause.centerId = options.centerId;
		}

		const employees = await this.prisma.employee.findMany({
			where: whereClause,
			select: {
				id: true,
				employeeId: true,
				fullName: true,
				currentSalaryStep: true,
				currentSalary: true,
			},
		});

		const results: ProcessIncrementResult[] = [];
		let successCount = 0;
		let failureCount = 0;
		let skippedCount = 0;

		for (const employee of employees) {
			let newStep: number;

			if (raiseType === MassRaiseType.INCREMENT_BY_STEPS) {
				newStep = Math.min(employee.currentSalaryStep + (options.incrementSteps ?? 1), MAX_STEP);
			} else {
				newStep = options.targetStep ?? employee.currentSalaryStep;
			}

			if (newStep <= employee.currentSalaryStep) {
				skippedCount++;
				results.push({
					success: false,
					employeeId: employee.employeeId,
					employeeName: employee.fullName,
					fromStep: employee.currentSalaryStep,
					toStep: newStep,
					fromSalary: employee.currentSalary ?? new Decimal(0),
					toSalary: employee.currentSalary ?? new Decimal(0),
					error: "Target step not higher than current step",
				});
				continue;
			}

			const stepInfo = rank.salarySteps.find((s) => s.stepNumber === newStep);
			if (!stepInfo) {
				failureCount++;
				results.push({
					success: false,
					employeeId: employee.employeeId,
					employeeName: employee.fullName,
					fromStep: employee.currentSalaryStep,
					toStep: newStep,
					fromSalary: employee.currentSalary ?? new Decimal(0),
					toSalary: new Decimal(0),
					error: `Salary step ${newStep} not found for rank`,
				});
				continue;
			}

			const historyRecord = await this.salaryHistory.createHistoryEntry({
				tenantId,
				employeeId: employee.id,
				rankId,
				changeType: SalaryChangeType.MASS_RAISE,
				fromStep: employee.currentSalaryStep,
				toStep: newStep,
				fromSalary: employee.currentSalary ?? undefined,
				toSalary: stepInfo.salaryAmount,
				effectiveDate,
				reason,
				orderReference,
				documentPath,
				isAutomatic: false,
				processedBy,
				approvedBy: processedBy,
				notes,
			});

			await this.prisma.employee.update({
				where: { id: employee.id },
				data: {
					currentSalaryStep: newStep,
					currentSalary: stepInfo.salaryAmount,
					salaryEffectiveDate: effectiveDate,
				},
			});

			await this.prisma.salaryStepEligibility.updateMany({
				where: {
					tenantId,
					employeeId: employee.id,
					status: SalaryEligibilityStatus.PENDING,
					nextStepNumber: { lte: newStep },
				},
				data: {
					status: SalaryEligibilityStatus.EXPIRED,
					processedAt: new Date(),
					processedBy,
				},
			});

			successCount++;
			results.push({
				success: true,
				employeeId: employee.employeeId,
				employeeName: employee.fullName,
				fromStep: employee.currentSalaryStep,
				toStep: newStep,
				fromSalary: employee.currentSalary ?? new Decimal(0),
				toSalary: stepInfo.salaryAmount,
				historyId: historyRecord.id,
			});
		}

		return {
			totalProcessed: employees.length,
			successCount,
			failureCount,
			skippedCount,
			results,
		};
	}

	async processPromotion(
		tenantId: string,
		employeeId: string,
		newRankId: string,
		effectiveDate: Date,
		processedBy: string,
		orderReference?: string,
		reason?: string,
		documentPath?: string,
	): Promise<ProcessIncrementResult> {
		const employee = await this.prisma.employee.findFirst({
			where: {
				id: employeeId,
				tenantId,
				employeeType: EmployeeType.MILITARY,
				deletedAt: null,
			},
			include: {
				rank: true,
			},
		});

		if (!employee) {
			throw new NotFoundException("Military employee not found");
		}

		if (!employee.rank || !employee.rankId) {
			throw new BadRequestException("Employee does not have a current rank");
		}

		const currentSalary = employee.currentSalary ?? employee.rank.baseSalary;

		const { newStep, newSalary, explanation } = await this.salaryCalculation.calculatePromotionStep(
			employee.rankId,
			newRankId,
			currentSalary,
		);

		const historyRecord = await this.salaryHistory.createHistoryEntry({
			tenantId,
			employeeId,
			rankId: newRankId,
			changeType: SalaryChangeType.PROMOTION,
			fromStep: employee.currentSalaryStep,
			toStep: newStep,
			fromSalary: currentSalary,
			toSalary: newSalary,
			effectiveDate,
			previousRankId: employee.rankId,
			reason: reason ?? explanation,
			orderReference,
			documentPath,
			isAutomatic: false,
			processedBy,
			approvedBy: processedBy,
		});

		await this.prisma.employee.update({
			where: { id: employeeId },
			data: {
				rankId: newRankId,
				currentSalaryStep: newStep,
				currentSalary: newSalary,
				salaryEffectiveDate: effectiveDate,
			},
		});

		await this.prisma.salaryStepEligibility.updateMany({
			where: {
				tenantId,
				employeeId,
				status: SalaryEligibilityStatus.PENDING,
			},
			data: {
				status: SalaryEligibilityStatus.EXPIRED,
				processedAt: new Date(),
				processedBy,
			},
		});

		return {
			success: true,
			employeeId: employee.employeeId,
			employeeName: employee.fullName,
			fromStep: employee.currentSalaryStep,
			toStep: newStep,
			fromSalary: currentSalary,
			toSalary: newSalary,
			historyId: historyRecord.id,
		};
	}

	async rejectEligibility(
		tenantId: string,
		eligibilityId: string,
		rejectionReason: string,
		processedBy: string,
	): Promise<void> {
		const eligibility = await this.prisma.salaryStepEligibility.findFirst({
			where: {
				id: eligibilityId,
				tenantId,
				status: SalaryEligibilityStatus.PENDING,
			},
		});

		if (!eligibility) {
			throw new NotFoundException("Salary eligibility record not found or already processed");
		}

		await this.prisma.salaryStepEligibility.update({
			where: { id: eligibilityId },
			data: {
				status: SalaryEligibilityStatus.REJECTED,
				processedAt: new Date(),
				processedBy,
				rejectionReason,
			},
		});
	}

	async getMassRaisePreview(
		tenantId: string,
		rankId: string,
		raiseType: MassRaiseType,
		options: {
			incrementSteps?: number;
			targetStep?: number;
			centerId?: string;
		},
	): Promise<{
		totalEmployees: number;
		affectedEmployees: number;
		skippedEmployees: number;
		totalSalaryIncrease: Decimal;
		preview: Array<{
			employeeId: string;
			employeeName: string;
			currentStep: number;
			newStep: number;
			currentSalary: Decimal;
			newSalary: Decimal;
			willBeSkipped: boolean;
			skipReason?: string;
		}>;
	}> {
		const rank = await this.prisma.militaryRank.findUnique({
			where: { id: rankId },
			include: {
				salarySteps: {
					orderBy: { stepNumber: "asc" },
				},
			},
		});

		if (!rank) {
			throw new NotFoundException("Rank not found");
		}

		const whereClause: Prisma.EmployeeWhereInput = {
			tenantId,
			rankId,
			employeeType: EmployeeType.MILITARY,
			status: "ACTIVE",
			deletedAt: null,
		};

		if (options.centerId) {
			whereClause.centerId = options.centerId;
		}

		const employees = await this.prisma.employee.findMany({
			where: whereClause,
			select: {
				id: true,
				employeeId: true,
				fullName: true,
				currentSalaryStep: true,
				currentSalary: true,
			},
		});

		const preview: Array<{
			employeeId: string;
			employeeName: string;
			currentStep: number;
			newStep: number;
			currentSalary: Decimal;
			newSalary: Decimal;
			willBeSkipped: boolean;
			skipReason?: string;
		}> = [];

		let affectedEmployees = 0;
		let skippedEmployees = 0;
		let totalSalaryIncrease = new Decimal(0);

		for (const employee of employees) {
			let newStep: number;

			if (raiseType === MassRaiseType.INCREMENT_BY_STEPS) {
				newStep = Math.min(employee.currentSalaryStep + (options.incrementSteps ?? 1), MAX_STEP);
			} else {
				newStep = options.targetStep ?? employee.currentSalaryStep;
			}

			const willBeSkipped = newStep <= employee.currentSalaryStep;
			const stepInfo = rank.salarySteps.find((s) => s.stepNumber === newStep);
			const newSalary = stepInfo?.salaryAmount ?? (employee.currentSalary ?? new Decimal(0));

			if (willBeSkipped) {
				skippedEmployees++;
			} else {
				affectedEmployees++;
				totalSalaryIncrease = totalSalaryIncrease.plus(
					newSalary.minus(employee.currentSalary ?? new Decimal(0)),
				);
			}

			preview.push({
				employeeId: employee.employeeId,
				employeeName: employee.fullName,
				currentStep: employee.currentSalaryStep,
				newStep,
				currentSalary: employee.currentSalary ?? new Decimal(0),
				newSalary,
				willBeSkipped,
				skipReason: willBeSkipped ? "Target step not higher than current step" : undefined,
			});
		}

		return {
			totalEmployees: employees.length,
			affectedEmployees,
			skippedEmployees,
			totalSalaryIncrease,
			preview,
		};
	}
}

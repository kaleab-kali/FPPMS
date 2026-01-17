import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "#api/database/prisma.service";
import { CreateRewardMilestoneDto, UpdateRewardMilestoneDto } from "./dto";

@Injectable()
export class RewardMilestonesService {
	constructor(private readonly prisma: PrismaService) {}

	async create(tenantId: string, dto: CreateRewardMilestoneDto) {
		const existing = await this.prisma.rewardMilestone.findFirst({
			where: { tenantId, yearsOfService: dto.yearsOfService },
		});

		if (existing) {
			throw new BadRequestException(`A milestone for ${dto.yearsOfService} years of service already exists`);
		}

		return this.prisma.rewardMilestone.create({
			data: {
				tenantId,
				yearsOfService: dto.yearsOfService,
				name: dto.name,
				nameAm: dto.nameAm,
				description: dto.description,
				rewardType: dto.rewardType,
				monetaryValue: dto.monetaryValue ? new Prisma.Decimal(dto.monetaryValue) : undefined,
				isActive: dto.isActive ?? true,
			},
		});
	}

	async findAll(tenantId: string, includeInactive = false) {
		return this.prisma.rewardMilestone.findMany({
			where: {
				tenantId,
				...(includeInactive ? {} : { isActive: true }),
			},
			orderBy: { yearsOfService: "asc" },
		});
	}

	async findOne(tenantId: string, id: string) {
		const milestone = await this.prisma.rewardMilestone.findFirst({
			where: { id, tenantId },
		});

		if (!milestone) {
			throw new NotFoundException("Reward milestone not found");
		}

		return milestone;
	}

	async findByYearsOfService(tenantId: string, yearsOfService: number) {
		return this.prisma.rewardMilestone.findFirst({
			where: { tenantId, yearsOfService, isActive: true },
		});
	}

	async update(tenantId: string, id: string, dto: UpdateRewardMilestoneDto) {
		const milestone = await this.findOne(tenantId, id);

		if (dto.yearsOfService && dto.yearsOfService !== milestone.yearsOfService) {
			const existing = await this.prisma.rewardMilestone.findFirst({
				where: {
					tenantId,
					yearsOfService: dto.yearsOfService,
					id: { not: id },
				},
			});

			if (existing) {
				throw new BadRequestException(`A milestone for ${dto.yearsOfService} years of service already exists`);
			}
		}

		return this.prisma.rewardMilestone.update({
			where: { id },
			data: {
				yearsOfService: dto.yearsOfService,
				name: dto.name,
				nameAm: dto.nameAm,
				description: dto.description,
				rewardType: dto.rewardType,
				monetaryValue: dto.monetaryValue !== undefined ? new Prisma.Decimal(dto.monetaryValue) : undefined,
				isActive: dto.isActive,
			},
		});
	}

	async remove(tenantId: string, id: string) {
		await this.findOne(tenantId, id);

		const rewardsCount = await this.prisma.serviceReward.count({
			where: { milestoneId: id },
		});

		if (rewardsCount > 0) {
			return this.prisma.rewardMilestone.update({
				where: { id },
				data: { isActive: false },
			});
		}

		return this.prisma.rewardMilestone.delete({
			where: { id },
		});
	}

	async getRewardsCountByMilestone(tenantId: string) {
		const milestones = await this.findAll(tenantId, true);

		const counts = await Promise.all(
			milestones.map(async (milestone) => {
				const [total, awarded] = await Promise.all([
					this.prisma.serviceReward.count({
						where: { tenantId, milestoneId: milestone.id },
					}),
					this.prisma.serviceReward.count({
						where: { tenantId, milestoneId: milestone.id, status: "AWARDED" },
					}),
				]);

				return {
					milestoneId: milestone.id,
					milestoneName: milestone.name,
					yearsOfService: milestone.yearsOfService,
					totalRewards: total,
					awardedRewards: awarded,
				};
			}),
		);

		return counts;
	}
}

import { Module } from "@nestjs/common";
import { RewardMilestonesController } from "./reward-milestones.controller";
import { RewardMilestonesService } from "./reward-milestones.service";
import { ServiceRewardsController } from "./service-rewards.controller";
import { ServiceRewardsService } from "./service-rewards.service";
import { EligibilityCalculationService } from "./services/eligibility-calculation.service";

@Module({
	controllers: [RewardMilestonesController, ServiceRewardsController],
	providers: [RewardMilestonesService, ServiceRewardsService, EligibilityCalculationService],
	exports: [RewardMilestonesService, ServiceRewardsService, EligibilityCalculationService],
})
export class RewardsModule {}

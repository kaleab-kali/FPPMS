import { Controller, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentTenant } from "#api/common/decorators/current-tenant.decorator";
import { CurrentUser } from "#api/common/decorators/current-user.decorator";
import { Permissions } from "#api/common/decorators/permissions.decorator";
import { DashboardService } from "./dashboard.service";
import { HqDashboardResponseDto } from "./dto/dashboard.dto";

@ApiTags("dashboard")
@ApiBearerAuth("JWT-auth")
@Controller("dashboard")
export class DashboardController {
	constructor(private readonly dashboardService: DashboardService) {}

	@Get("hq-overview")
	@Permissions("dashboard.read.hq")
	@ApiOperation({
		summary: "Get HQ oversight dashboard",
		description: "Get overview statistics across all centers for HQ administrators",
	})
	@ApiResponse({ status: 200, description: "HQ dashboard data", type: HqDashboardResponseDto })
	getHqOverview(@CurrentTenant() tenantId: string, @CurrentUser("userId") userId: string) {
		return this.dashboardService.getHqOverview(tenantId, userId);
	}
}

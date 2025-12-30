import { Controller, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentTenant } from "#api/common/decorators/current-tenant.decorator";
import { CurrentUser } from "#api/common/decorators/current-user.decorator";
import { Permissions } from "#api/common/decorators/permissions.decorator";
import { AuthUserDto } from "#api/common/dto/auth-user.dto";
import { AccessContext, DashboardService } from "./dashboard.service";
import { HqDashboardResponseDto } from "./dto/dashboard.dto";

const buildAccessContext = (user: AuthUserDto): AccessContext => ({
	centerId: user.centerId,
	effectiveAccessScope: user.effectiveAccessScope,
});

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
	@ApiResponse({ status: 403, description: "Forbidden - requires ALL_CENTERS access scope" })
	getHqOverview(@CurrentTenant() tenantId: string, @CurrentUser() user: AuthUserDto) {
		return this.dashboardService.getHqOverview(tenantId, buildAccessContext(user));
	}
}

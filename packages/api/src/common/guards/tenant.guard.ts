import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { RequestWithUser } from "#api/common/interfaces/request-with-user.interface";

@Injectable()
export class TenantGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest<RequestWithUser>();
		const user = request.user;

		if (!user || !user.tenantId) {
			throw new ForbiddenException("Tenant context is required");
		}

		const resourceTenantId = request.params?.tenantId || request.body?.tenantId;

		if (resourceTenantId && resourceTenantId !== user.tenantId) {
			throw new ForbiddenException("Access denied to this tenant resource");
		}

		return true;
	}
}

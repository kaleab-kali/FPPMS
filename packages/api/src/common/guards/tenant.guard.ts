import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "#api/common/decorators/public.decorator";
import { RequestWithUser } from "#api/common/interfaces/request-with-user.interface";

@Injectable()
export class TenantGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		if (isPublic) {
			return true;
		}

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

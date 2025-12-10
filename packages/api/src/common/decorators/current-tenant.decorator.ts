import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { RequestWithUser } from "#api/common/interfaces/request-with-user.interface";

export const CurrentTenant = createParamDecorator((data: unknown, ctx: ExecutionContext): string => {
	const request = ctx.switchToHttp().getRequest<RequestWithUser>();
	return request.user?.tenantId || "";
});

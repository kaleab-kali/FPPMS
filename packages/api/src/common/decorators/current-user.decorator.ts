import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { RequestWithUser } from "#api/common/interfaces/request-with-user.interface";

export const CurrentUser = createParamDecorator((data: string | undefined, ctx: ExecutionContext) => {
	const request = ctx.switchToHttp().getRequest<RequestWithUser>();
	const user = request.user;

	if (data) {
		return user?.[data as keyof typeof user];
	}

	return user;
});

import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Observable } from "rxjs";
import { RequestWithUser } from "#api/common/interfaces/request-with-user.interface";

@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
		const request = context.switchToHttp().getRequest<RequestWithUser>();

		if (request.user?.tenantId) {
			request.tenantId = request.user.tenantId;
		}

		return next.handle();
	}
}

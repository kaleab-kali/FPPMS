import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Observable, tap } from "rxjs";
import { RequestWithUser } from "#api/common/interfaces/request-with-user.interface";

@Injectable()
export class AuditInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
		const request = context.switchToHttp().getRequest<RequestWithUser>();
		const { method, originalUrl, body } = request;
		const userId = request.user?.id;
		const tenantId = request.user?.tenantId;
		const startTime = Date.now();

		return next.handle().pipe(
			tap({
				next: () => {
					const duration = Date.now() - startTime;
					const auditEntry = {
						userId,
						tenantId,
						action: method,
						resource: originalUrl,
						requestBody: this.sanitizeBody(body),
						duration,
						timestamp: new Date().toISOString(),
					};
					this.logAudit(auditEntry);
				},
				error: (error: Error) => {
					const duration = Date.now() - startTime;
					const auditEntry = {
						userId,
						tenantId,
						action: method,
						resource: originalUrl,
						requestBody: this.sanitizeBody(body),
						duration,
						timestamp: new Date().toISOString(),
						error: error.message,
					};
					this.logAudit(auditEntry);
				},
			}),
		);
	}

	private sanitizeBody(body: Record<string, unknown>): Record<string, unknown> {
		if (!body) return {};
		const sanitized = { ...body };
		const sensitiveFields = ["password", "currentPassword", "newPassword", "token"];
		for (const field of sensitiveFields) {
			if (field in sanitized) {
				sanitized[field] = "[REDACTED]";
			}
		}
		return sanitized;
	}

	private logAudit(_entry: Record<string, unknown>): void {
		// TODO: Implement actual audit logging to database
	}
}

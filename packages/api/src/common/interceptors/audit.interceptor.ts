import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from "@nestjs/common";
import { AuditAction } from "@prisma/client";
import { from, Observable, switchMap, tap } from "rxjs";
import { RequestWithUser } from "#api/common/interfaces/request-with-user.interface";
import { PrismaService } from "#api/database/prisma.service";
import { AuditLogService } from "#api/modules/audit-log/audit-log.service";

const HTTP_METHOD_TO_ACTION: Record<string, AuditAction> = {
	GET: AuditAction.VIEW,
	POST: AuditAction.CREATE,
	PUT: AuditAction.UPDATE,
	PATCH: AuditAction.UPDATE,
	DELETE: AuditAction.DELETE,
} as const;

const SENSITIVE_FIELDS = ["password", "currentPassword", "newPassword", "token", "secret", "apiKey"] as const;

const EXCLUDED_PATHS = ["/health", "/metrics", "/swagger", "/api-docs", "/favicon"] as const;

@Injectable()
export class AuditInterceptor implements NestInterceptor {
	private readonly logger = new Logger(AuditInterceptor.name);

	constructor(
		private readonly auditLogService: AuditLogService,
		private readonly prisma: PrismaService,
	) {}

	intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
		const request = context.switchToHttp().getRequest<RequestWithUser>();
		const { method, originalUrl, body, headers } = request;

		this.logger.log(`AuditInterceptor called: ${method} ${originalUrl}`);

		const shouldSkip = EXCLUDED_PATHS.some((path) => originalUrl.includes(path));
		if (shouldSkip) {
			this.logger.log(`Skipping audit for excluded path: ${originalUrl}`);
			return next.handle();
		}

		const userId = request.user?.id;
		const tenantId = request.user?.tenantId ?? request.tenantId;

		this.logger.log(`User: ${userId}, Tenant: ${tenantId}`);

		if (!tenantId) {
			this.logger.warn(`No tenantId found for request: ${method} ${originalUrl}`);
			return next.handle();
		}

		const userAgent = headers["user-agent"] ?? "";
		const ipAddress = this.extractIpAddress(request);
		const { module, resource, resourceId } = this.parseUrl(originalUrl);
		const action = HTTP_METHOD_TO_ACTION[method] ?? AuditAction.VIEW;
		const { deviceType, browser, os } = this.parseUserAgent(userAgent);
		const requestId = (headers["x-request-id"] as string) ?? this.generateRequestId();

		const previousValuePromise =
			(action === AuditAction.UPDATE || action === AuditAction.DELETE) && resourceId && tenantId
				? this.fetchPreviousValue(module, resourceId, tenantId)
				: Promise.resolve(undefined);

		return from(previousValuePromise).pipe(
			switchMap((previousValue) =>
				next.handle().pipe(
					tap({
						next: (responseData) => {
							const extractedResourceId = resourceId ?? this.extractResourceIdFromResponse(responseData);
							const isSelfEdit = request.user?.employeeId && extractedResourceId === request.user.employeeId;

							this.logger.log(`Creating audit log for: ${action} ${module}/${resource}`);
							this.auditLogService
								.create({
									tenantId,
									userId,
									username: request.user?.username,
									userRole: request.user?.roles?.[0],
									userCenter: request.user?.centerId,
									action,
									module,
									resource,
									resourceId: extractedResourceId,
									ipAddress,
									userAgent,
									deviceType,
									browser,
									os,
									requestId,
									previousValue: previousValue ? this.sanitizeBody(previousValue) : undefined,
									newValue:
										action === AuditAction.CREATE || action === AuditAction.UPDATE
											? this.sanitizeBody(body)
											: undefined,
									changedFields: action === AuditAction.UPDATE ? Object.keys(this.sanitizeBody(body)) : [],
									description: `${isSelfEdit ? "[SELF_EDIT] " : ""}${this.generateDescription(action, module, resource)}`,
								})
								.then((result) => {
									this.logger.log(`Audit log created successfully: ${result.id}`);
								})
								.catch((error) => {
									this.logger.error(`Failed to create audit log: ${error.message}`, error.stack);
								});
						},
						error: (error: Error) => {
							this.auditLogService
								.create({
									tenantId,
									userId,
									username: request.user?.username,
									userRole: request.user?.roles?.[0],
									userCenter: request.user?.centerId,
									action,
									module,
									resource,
									resourceId,
									ipAddress,
									userAgent,
									deviceType,
									browser,
									os,
									requestId,
									previousValue: previousValue ? this.sanitizeBody(previousValue) : undefined,
									newValue: this.sanitizeBody(body),
									description: `Failed: ${this.generateDescription(action, module, resource)} - ${error.message}`,
								})
								.catch((auditError) => {
									this.logger.error(`Failed to create audit log for error: ${auditError.message}`, auditError.stack);
								});
						},
					}),
				),
			),
		);
	}

	private readonly MODULE_TO_MODEL: Record<string, string> = {
		employees: "employee",
		complaints: "complaint",
		committees: "committee",
		attendance: "attendanceRecord",
		users: "user",
		roles: "role",
		departments: "department",
		positions: "position",
		centers: "center",
		salary: "salaryStepEligibility",
		leave: "leaveRequest",
		holidays: "holiday",
		rewards: "reward",
		documents: "document",
	};

	private async fetchPreviousValue(
		module: string,
		resourceId: string,
		tenantId: string,
	): Promise<Record<string, unknown> | undefined> {
		const modelName = this.MODULE_TO_MODEL[module];
		if (!modelName) return undefined;

		const prismaModel = (this.prisma as unknown as Record<string, unknown>)[modelName];
		if (!prismaModel || typeof (prismaModel as Record<string, unknown>).findFirst !== "function") return undefined;

		const record = await (prismaModel as { findFirst: (args: unknown) => Promise<unknown> }).findFirst({
			where: { id: resourceId, tenantId },
		});

		if (!record || typeof record !== "object") return undefined;
		return record as Record<string, unknown>;
	}

	private extractIpAddress(request: RequestWithUser): string {
		const forwardedFor = request.headers["x-forwarded-for"];
		if (forwardedFor) {
			const ips = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor.split(",")[0];
			return ips.trim();
		}

		const realIp = request.headers["x-real-ip"];
		if (realIp) {
			return Array.isArray(realIp) ? realIp[0] : realIp;
		}

		return request.ip ?? request.socket?.remoteAddress ?? "unknown";
	}

	private parseUrl(url: string): { module: string; resource: string; resourceId?: string } {
		const cleanUrl = url.split("?")[0];

		const pathParts = cleanUrl.split("/").filter((part) => part && part !== "api" && part !== "v1");

		if (pathParts.length === 0) {
			return { module: "root", resource: "root" };
		}

		const module = pathParts[0];

		const resource = this.singularize(module);

		let resourceId: string | undefined;
		if (pathParts.length > 1 && this.isResourceId(pathParts[1])) {
			resourceId = pathParts[1];
		}

		return { module, resource, resourceId };
	}

	private singularize(word: string): string {
		if (word.endsWith("ies")) {
			return `${word.slice(0, -3)}y`;
		}
		if (word.endsWith("es") && !word.endsWith("ss")) {
			return word.slice(0, -2);
		}
		if (word.endsWith("s") && !word.endsWith("ss")) {
			return word.slice(0, -1);
		}
		return word;
	}

	private isResourceId(part: string): boolean {
		return (
			/^[a-zA-Z0-9_-]{10,}$/.test(part) || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(part)
		);
	}

	private parseUserAgent(userAgent: string): { deviceType: string; browser: string; os: string } {
		const result = {
			deviceType: "unknown",
			browser: "unknown",
			os: "unknown",
		};

		if (!userAgent) {
			return result;
		}

		const uaLower = userAgent.toLowerCase();

		if (uaLower.includes("mobile") || uaLower.includes("android") || uaLower.includes("iphone")) {
			result.deviceType = "mobile";
		} else if (uaLower.includes("tablet") || uaLower.includes("ipad")) {
			result.deviceType = "tablet";
		} else {
			result.deviceType = "desktop";
		}

		if (uaLower.includes("edg/") || uaLower.includes("edge/")) {
			result.browser = "Edge";
		} else if (uaLower.includes("chrome/") && !uaLower.includes("edg/")) {
			result.browser = "Chrome";
		} else if (uaLower.includes("firefox/")) {
			result.browser = "Firefox";
		} else if (uaLower.includes("safari/") && !uaLower.includes("chrome/")) {
			result.browser = "Safari";
		} else if (uaLower.includes("opera/") || uaLower.includes("opr/")) {
			result.browser = "Opera";
		} else if (uaLower.includes("msie") || uaLower.includes("trident/")) {
			result.browser = "Internet Explorer";
		}

		if (uaLower.includes("windows nt 10")) {
			result.os = "Windows 10";
		} else if (uaLower.includes("windows nt 11") || (uaLower.includes("windows nt 10") && uaLower.includes("wow64"))) {
			result.os = "Windows 11";
		} else if (uaLower.includes("windows")) {
			result.os = "Windows";
		} else if (uaLower.includes("mac os x")) {
			result.os = "macOS";
		} else if (uaLower.includes("linux")) {
			result.os = "Linux";
		} else if (uaLower.includes("android")) {
			result.os = "Android";
		} else if (uaLower.includes("iphone") || uaLower.includes("ipad")) {
			result.os = "iOS";
		}

		return result;
	}

	private sanitizeBody(body: Record<string, unknown>): Record<string, unknown> {
		if (!body || typeof body !== "object") {
			return {};
		}

		const sanitized: Record<string, unknown> = {};

		for (const [key, value] of Object.entries(body)) {
			if (SENSITIVE_FIELDS.some((field) => key.toLowerCase().includes(field.toLowerCase()))) {
				sanitized[key] = "[REDACTED]";
			} else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
				sanitized[key] = this.sanitizeBody(value as Record<string, unknown>);
			} else {
				sanitized[key] = value;
			}
		}

		return sanitized;
	}

	private extractResourceIdFromResponse(response: unknown): string | undefined {
		if (!response || typeof response !== "object") {
			return undefined;
		}

		const responseObj = response as Record<string, unknown>;

		if (typeof responseObj.id === "string") {
			return responseObj.id;
		}

		if (responseObj.data && typeof responseObj.data === "object") {
			const data = responseObj.data as Record<string, unknown>;
			if (typeof data.id === "string") {
				return data.id;
			}
		}

		return undefined;
	}

	private generateDescription(action: AuditAction, module: string, resource: string): string {
		const actionVerbs: Record<AuditAction, string> = {
			[AuditAction.CREATE]: "Created",
			[AuditAction.UPDATE]: "Updated",
			[AuditAction.DELETE]: "Deleted",
			[AuditAction.VIEW]: "Viewed",
			[AuditAction.LOGIN]: "Logged in",
			[AuditAction.LOGOUT]: "Logged out",
			[AuditAction.APPROVE]: "Approved",
			[AuditAction.REJECT]: "Rejected",
			[AuditAction.EXPORT]: "Exported",
			[AuditAction.IMPORT]: "Imported",
		};

		const verb = actionVerbs[action] ?? "Performed action on";
		return `${verb} ${resource} in ${module}`;
	}

	private generateRequestId(): string {
		const timestamp = Date.now().toString(36);
		const randomPart = Math.random().toString(36).substring(2, 10);
		return `req_${timestamp}${randomPart}`;
	}
}

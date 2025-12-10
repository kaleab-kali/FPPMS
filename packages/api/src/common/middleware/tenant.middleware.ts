import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class TenantMiddleware implements NestMiddleware {
	use(req: Request, _res: Response, next: NextFunction): void {
		const tenantHeader = req.headers["x-tenant-id"];
		if (tenantHeader && typeof tenantHeader === "string") {
			(req as Request & { tenantId?: string }).tenantId = tenantHeader;
		}
		next();
	}
}

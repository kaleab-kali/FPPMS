import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

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

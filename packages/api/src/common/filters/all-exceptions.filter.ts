import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { Response } from "express";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	catch(exception: unknown, host: ArgumentsHost): void {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();

		const status = HttpStatus.INTERNAL_SERVER_ERROR;
		const message = exception instanceof Error ? exception.message : "Internal server error";

		response.status(status).json({
			statusCode: status,
			timestamp: new Date().toISOString(),
			message,
			error: "Internal Server Error",
		});
	}
}

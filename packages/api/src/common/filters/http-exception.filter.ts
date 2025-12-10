import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { Response } from "express";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	catch(exception: HttpException, host: ArgumentsHost): void {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const status = exception.getStatus();
		const exceptionResponse = exception.getResponse();

		const errorResponse = {
			statusCode: status,
			timestamp: new Date().toISOString(),
			message:
				typeof exceptionResponse === "string"
					? exceptionResponse
					: (exceptionResponse as Record<string, unknown>).message || exception.message,
			error: HttpStatus[status] || "Error",
		};

		response.status(status).json(errorResponse);
	}
}

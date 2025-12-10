import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { Response } from "express";

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
	catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost): void {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();

		const errorMapping: Record<string, { status: number; message: string }> = {
			P2002: { status: HttpStatus.CONFLICT, message: "A record with this value already exists" },
			P2003: { status: HttpStatus.BAD_REQUEST, message: "Foreign key constraint failed" },
			P2025: { status: HttpStatus.NOT_FOUND, message: "Record not found" },
			P2014: { status: HttpStatus.BAD_REQUEST, message: "Invalid relation" },
			P2016: { status: HttpStatus.BAD_REQUEST, message: "Query interpretation error" },
		};

		const error = errorMapping[exception.code] || {
			status: HttpStatus.INTERNAL_SERVER_ERROR,
			message: "Database error occurred",
		};

		response.status(error.status).json({
			statusCode: error.status,
			timestamp: new Date().toISOString(),
			message: error.message,
			error: exception.code,
		});
	}
}

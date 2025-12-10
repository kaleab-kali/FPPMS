export class ApiResponseDto<T> {
	success: boolean;
	data: T;
	message?: string;
	timestamp: string;
}

export class ApiErrorResponseDto {
	success: boolean;
	statusCode: number;
	message: string;
	error?: string;
	timestamp: string;
}

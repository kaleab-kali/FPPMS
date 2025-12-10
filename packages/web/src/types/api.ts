export interface PaginationParams {
	page?: number;
	pageSize?: number;
	search?: string;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}

export interface PaginatedMeta {
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}

export interface PaginatedResponse<T> {
	data: T[];
	meta: PaginatedMeta;
}

export interface ApiErrorResponse {
	message: string;
	statusCode: number;
	error?: string;
}

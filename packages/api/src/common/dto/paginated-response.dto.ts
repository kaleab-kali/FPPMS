export class PaginationMeta {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
}

export class PaginatedResponseDto<T> {
	data: T[];
	meta: PaginationMeta;
}

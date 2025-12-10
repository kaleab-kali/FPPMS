import { PaginatedResult } from "#api/common/interfaces/paginated-result.interface";

export const paginate = <T>(data: T[], total: number, page: number, limit: number): PaginatedResult<T> => {
	const totalPages = Math.ceil(total / limit);

	return {
		data,
		meta: {
			total,
			page,
			limit,
			totalPages,
			hasNextPage: page < totalPages,
			hasPreviousPage: page > 1,
		},
	};
};

export const calculateSkip = (page: number, limit: number): number => {
	return (page - 1) * limit;
};

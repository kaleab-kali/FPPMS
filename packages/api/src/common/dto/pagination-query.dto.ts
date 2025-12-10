import { Transform } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class PaginationQueryDto {
	@IsOptional()
	@IsInt()
	@Min(1)
	@Transform(({ value }) => parseInt(value, 10))
	page?: number = 1;

	@IsOptional()
	@IsInt()
	@Min(1)
	@Max(100)
	@Transform(({ value }) => parseInt(value, 10))
	limit?: number = 20;

	@IsOptional()
	@IsString()
	sortBy?: string;

	@IsOptional()
	@IsIn(["asc", "desc"])
	sortOrder?: "asc" | "desc" = "desc";

	@IsOptional()
	@IsString()
	search?: string;
}

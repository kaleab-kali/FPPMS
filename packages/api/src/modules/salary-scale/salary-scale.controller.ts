import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SalaryScaleStatus } from "@prisma/client";
import { CurrentUser } from "#api/common/decorators/current-user.decorator";
import { Permissions } from "#api/common/decorators/permissions.decorator";
import { AuthUserDto } from "#api/common/dto/auth-user.dto";
import { CreateSalaryScaleDto } from "#api/modules/salary-scale/dto/create-salary-scale.dto";
import {
	SalaryScaleListResponseDto,
	SalaryScaleRankResponseDto,
	SalaryScaleVersionResponseDto,
} from "#api/modules/salary-scale/dto/salary-scale-response.dto";
import { UpdateSalaryScaleDto } from "#api/modules/salary-scale/dto/update-salary-scale.dto";
import { SalaryScaleService } from "#api/modules/salary-scale/salary-scale.service";

@ApiTags("salary-scales")
@ApiBearerAuth("JWT-auth")
@Controller("salary-scales")
export class SalaryScaleController {
	constructor(private salaryScaleService: SalaryScaleService) {}

	@Post()
	@Permissions("salary-scales.create.salary-scale")
	@ApiOperation({
		summary: "Create a new salary scale version",
		description: "Create a new salary scale with all rank configurations and salary steps",
	})
	@ApiResponse({ status: 201, description: "Salary scale created successfully", type: SalaryScaleVersionResponseDto })
	@ApiResponse({ status: 400, description: "Bad request - scale code already exists" })
	create(@CurrentUser() user: AuthUserDto, @Body() dto: CreateSalaryScaleDto): Promise<SalaryScaleVersionResponseDto> {
		return this.salaryScaleService.create(user.tenantId, dto, user.id);
	}

	@Get()
	@Permissions("salary-scales.read.salary-scale")
	@ApiOperation({
		summary: "List all salary scale versions",
		description: "Get all salary scale versions, optionally filtered by status",
	})
	@ApiQuery({
		name: "status",
		required: false,
		enum: SalaryScaleStatus,
		description: "Filter by status (DRAFT, ACTIVE, ARCHIVED)",
	})
	@ApiResponse({ status: 200, description: "List of salary scales", type: [SalaryScaleListResponseDto] })
	findAll(
		@CurrentUser() user: AuthUserDto,
		@Query("status") status?: SalaryScaleStatus,
	): Promise<SalaryScaleListResponseDto[]> {
		return this.salaryScaleService.findAll(user.tenantId, status);
	}

	@Get("active")
	@Permissions("salary-scales.read.salary-scale")
	@ApiOperation({
		summary: "Get the currently active salary scale",
		description: "Returns the active salary scale with all ranks and steps",
	})
	@ApiResponse({
		status: 200,
		description: "Active salary scale or null if none active",
		type: SalaryScaleVersionResponseDto,
	})
	findActive(@CurrentUser() user: AuthUserDto): Promise<SalaryScaleVersionResponseDto | null> {
		return this.salaryScaleService.findActiveScale(user.tenantId);
	}

	@Get(":id")
	@Permissions("salary-scales.read.salary-scale")
	@ApiOperation({
		summary: "Get salary scale by ID",
		description: "Get a single salary scale with all its rank configurations and salary steps",
	})
	@ApiResponse({ status: 200, description: "Salary scale details", type: SalaryScaleVersionResponseDto })
	@ApiResponse({ status: 404, description: "Salary scale not found" })
	findOne(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<SalaryScaleVersionResponseDto> {
		return this.salaryScaleService.findOne(user.tenantId, id);
	}

	@Get(":id/ranks/:rankCode")
	@Permissions("salary-scales.read.salary-scale")
	@ApiOperation({
		summary: "Get salary configuration for a specific rank",
		description: "Get the salary configuration including all steps for a specific rank in a scale",
	})
	@ApiResponse({ status: 200, description: "Rank salary configuration", type: SalaryScaleRankResponseDto })
	@ApiResponse({ status: 404, description: "Rank not found in this scale" })
	getRankSalary(
		@CurrentUser() user: AuthUserDto,
		@Param("id") id: string,
		@Param("rankCode") rankCode: string,
	): Promise<SalaryScaleRankResponseDto | null> {
		return this.salaryScaleService.getRankSalary(user.tenantId, id, rankCode);
	}

	@Patch(":id")
	@Permissions("salary-scales.update.salary-scale")
	@ApiOperation({
		summary: "Update salary scale",
		description: "Update salary scale details. If ranks array is provided, it will replace all existing ranks.",
	})
	@ApiResponse({ status: 200, description: "Salary scale updated", type: SalaryScaleVersionResponseDto })
	@ApiResponse({ status: 400, description: "Cannot update archived scale" })
	@ApiResponse({ status: 404, description: "Salary scale not found" })
	update(
		@CurrentUser() user: AuthUserDto,
		@Param("id") id: string,
		@Body() dto: UpdateSalaryScaleDto,
	): Promise<SalaryScaleVersionResponseDto> {
		return this.salaryScaleService.update(user.tenantId, id, dto);
	}

	@Post(":id/activate")
	@Permissions("salary-scales.update.salary-scale")
	@ApiOperation({
		summary: "Activate a salary scale",
		description: "Set this scale as the active one. Previous active scale will be archived.",
	})
	@ApiResponse({ status: 200, description: "Salary scale activated", type: SalaryScaleVersionResponseDto })
	@ApiResponse({ status: 400, description: "Cannot activate archived scale" })
	@ApiResponse({ status: 404, description: "Salary scale not found" })
	activate(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<SalaryScaleVersionResponseDto> {
		return this.salaryScaleService.activate(user.tenantId, id, user.id);
	}

	@Post(":id/archive")
	@Permissions("salary-scales.update.salary-scale")
	@ApiOperation({
		summary: "Archive a salary scale",
		description: "Archive this scale. It will no longer be usable but kept for historical records.",
	})
	@ApiResponse({ status: 200, description: "Salary scale archived", type: SalaryScaleVersionResponseDto })
	@ApiResponse({ status: 404, description: "Salary scale not found" })
	archive(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<SalaryScaleVersionResponseDto> {
		return this.salaryScaleService.archive(user.tenantId, id);
	}

	@Post(":id/duplicate")
	@Permissions("salary-scales.create.salary-scale")
	@ApiOperation({
		summary: "Duplicate a salary scale",
		description: "Create a copy of an existing scale with a new code. Useful for creating new versions.",
	})
	@ApiQuery({
		name: "newCode",
		required: true,
		description: "Code for the new salary scale version",
		example: "2020-EC",
	})
	@ApiResponse({ status: 201, description: "Salary scale duplicated", type: SalaryScaleVersionResponseDto })
	@ApiResponse({ status: 400, description: "New code already exists" })
	@ApiResponse({ status: 404, description: "Original salary scale not found" })
	duplicate(
		@CurrentUser() user: AuthUserDto,
		@Param("id") id: string,
		@Query("newCode") newCode: string,
	): Promise<SalaryScaleVersionResponseDto> {
		return this.salaryScaleService.duplicate(user.tenantId, id, newCode, user.id);
	}

	@Delete(":id")
	@Permissions("salary-scales.delete.salary-scale")
	@ApiOperation({
		summary: "Delete a salary scale",
		description: "Delete a salary scale. Cannot delete active scales - archive them first.",
	})
	@ApiResponse({ status: 200, description: "Salary scale deleted" })
	@ApiResponse({ status: 400, description: "Cannot delete active scale" })
	@ApiResponse({ status: 404, description: "Salary scale not found" })
	remove(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<{ message: string }> {
		return this.salaryScaleService.remove(user.tenantId, id);
	}
}

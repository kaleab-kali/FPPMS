import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "#api/common/decorators/current-user.decorator";
import { Permissions } from "#api/common/decorators/permissions.decorator";
import { AuthUserDto } from "#api/common/dto/auth-user.dto";
import { CreateHolidayDto, HolidayQueryDto, HolidayResponseDto, UpdateHolidayDto } from "./dto";
import { HolidaysService } from "./holidays.service";

@ApiTags("holidays")
@ApiBearerAuth("JWT-auth")
@Controller("holidays")
export class HolidaysController {
	constructor(private readonly holidaysService: HolidaysService) {}

	@Post()
	@Permissions("holidays.create")
	@ApiOperation({
		summary: "Create holiday",
		description: "Create a new holiday (national, religious, or company-specific)",
	})
	@ApiResponse({ status: 201, description: "Holiday created", type: HolidayResponseDto })
	@ApiResponse({ status: 400, description: "Invalid input or holiday already exists on this date" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Insufficient permissions" })
	create(@CurrentUser() user: AuthUserDto, @Body() dto: CreateHolidayDto): Promise<HolidayResponseDto> {
		return this.holidaysService.create(user.tenantId, dto, user.id);
	}

	@Get()
	@Permissions("holidays.read")
	@ApiOperation({
		summary: "List holidays",
		description: "Get holidays with filtering by date range, type, or Ethiopian calendar",
	})
	@ApiResponse({ status: 200, description: "List of holidays", type: [HolidayResponseDto] })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Insufficient permissions" })
	findAll(@CurrentUser() user: AuthUserDto, @Query() query: HolidayQueryDto): Promise<HolidayResponseDto[]> {
		return this.holidaysService.findAll(user.tenantId, query);
	}

	@Get("check/:date")
	@Permissions("holidays.read")
	@ApiOperation({
		summary: "Check if date is a holiday",
		description: "Check if a specific date is a holiday",
	})
	@ApiParam({ name: "date", description: "Date to check (YYYY-MM-DD)" })
	@ApiResponse({ status: 200, description: "Holiday found or null" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	findByDate(@CurrentUser() user: AuthUserDto, @Param("date") date: string) {
		return this.holidaysService.findByDate(user.tenantId, date);
	}

	@Get("working-days")
	@Permissions("holidays.read")
	@ApiOperation({
		summary: "Count working days",
		description: "Count working days in a date range, excluding weekends and holidays",
	})
	@ApiQuery({ name: "startDate", required: true, description: "Start date (YYYY-MM-DD)" })
	@ApiQuery({ name: "endDate", required: true, description: "End date (YYYY-MM-DD)" })
	@ApiQuery({ name: "excludeWeekends", required: false, description: "Exclude weekends (default: true)" })
	@ApiQuery({ name: "appliesTo", required: false, description: "Filter by appliesTo (center/department ID)" })
	@ApiResponse({ status: 200, description: "Number of working days" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	async countWorkingDays(
		@CurrentUser() user: AuthUserDto,
		@Query("startDate") startDate: string,
		@Query("endDate") endDate: string,
		@Query("excludeWeekends") excludeWeekends?: string,
		@Query("appliesTo") appliesTo?: string,
	) {
		const workingDays = await this.holidaysService.countWorkingDays(
			user.tenantId,
			new Date(startDate),
			new Date(endDate),
			{
				excludeWeekends: excludeWeekends !== "false",
				appliesTo,
			},
		);

		return { workingDays, startDate, endDate };
	}

	@Post("generate/:year")
	@Permissions("holidays.create")
	@ApiOperation({
		summary: "Generate recurring holidays",
		description: "Generate holidays for a year based on recurring holiday templates",
	})
	@ApiParam({ name: "year", description: "Ethiopian year to generate holidays for" })
	@ApiResponse({ status: 201, description: "Generated holidays summary" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Insufficient permissions" })
	generateRecurring(@CurrentUser() user: AuthUserDto, @Param("year") year: string) {
		return this.holidaysService.generateRecurringHolidays(user.tenantId, Number(year));
	}

	@Get(":id")
	@Permissions("holidays.read")
	@ApiOperation({
		summary: "Get holiday by ID",
		description: "Get a single holiday by its ID",
	})
	@ApiParam({ name: "id", description: "Holiday ID" })
	@ApiResponse({ status: 200, description: "Holiday found", type: HolidayResponseDto })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Insufficient permissions" })
	@ApiResponse({ status: 404, description: "Holiday not found" })
	findOne(@CurrentUser() user: AuthUserDto, @Param("id") id: string): Promise<HolidayResponseDto> {
		return this.holidaysService.findOne(user.tenantId, id);
	}

	@Patch(":id")
	@Permissions("holidays.update")
	@ApiOperation({
		summary: "Update holiday",
		description: "Update an existing holiday",
	})
	@ApiParam({ name: "id", description: "Holiday ID" })
	@ApiResponse({ status: 200, description: "Holiday updated", type: HolidayResponseDto })
	@ApiResponse({ status: 400, description: "Invalid input" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Insufficient permissions" })
	@ApiResponse({ status: 404, description: "Holiday not found" })
	update(
		@CurrentUser() user: AuthUserDto,
		@Param("id") id: string,
		@Body() dto: UpdateHolidayDto,
	): Promise<HolidayResponseDto> {
		return this.holidaysService.update(user.tenantId, id, dto);
	}

	@Delete(":id")
	@Permissions("holidays.delete")
	@ApiOperation({
		summary: "Delete holiday",
		description: "Delete a holiday",
	})
	@ApiParam({ name: "id", description: "Holiday ID" })
	@ApiResponse({ status: 200, description: "Holiday deleted" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Insufficient permissions" })
	@ApiResponse({ status: 404, description: "Holiday not found" })
	delete(@CurrentUser() user: AuthUserDto, @Param("id") id: string) {
		return this.holidaysService.delete(user.tenantId, id);
	}
}

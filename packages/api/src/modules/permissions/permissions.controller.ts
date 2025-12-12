import { Controller, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { PermissionResponseDto } from "#api/modules/permissions/dto/permission-response.dto";
import { PermissionsService } from "#api/modules/permissions/permissions.service";

@ApiTags("permissions")
@ApiBearerAuth("JWT-auth")
@Controller("permissions")
export class PermissionsController {
	constructor(private permissionsService: PermissionsService) {}

	@Get()
	@ApiOperation({ summary: "List all permissions", description: "Get all permissions, optionally filtered by module" })
	@ApiQuery({ name: "module", required: false, description: "Filter by module name" })
	@ApiResponse({ status: 200, description: "List of permissions", type: [PermissionResponseDto] })
	findAll(@Query("module") module?: string): Promise<PermissionResponseDto[]> {
		if (module) {
			return this.permissionsService.findByModule(module);
		}
		return this.permissionsService.findAll();
	}

	@Get("modules")
	@ApiOperation({ summary: "Get permission modules", description: "Get list of all permission modules" })
	@ApiResponse({ status: 200, description: "List of module names", type: [String] })
	getModules(): Promise<string[]> {
		return this.permissionsService.getModules();
	}
}

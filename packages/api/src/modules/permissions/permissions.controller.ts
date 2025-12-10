import { Controller, Get, Query } from "@nestjs/common";
import { PermissionResponseDto } from "#api/modules/permissions/dto/permission-response.dto";
import { PermissionsService } from "#api/modules/permissions/permissions.service";

@Controller("permissions")
export class PermissionsController {
	constructor(private permissionsService: PermissionsService) {}

	@Get()
	findAll(@Query("module") module?: string): Promise<PermissionResponseDto[]> {
		if (module) {
			return this.permissionsService.findByModule(module);
		}
		return this.permissionsService.findAll();
	}

	@Get("modules")
	getModules(): Promise<string[]> {
		return this.permissionsService.getModules();
	}
}

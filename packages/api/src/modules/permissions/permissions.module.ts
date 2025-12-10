import { Module } from "@nestjs/common";
import { PermissionsController } from "#api/modules/permissions/permissions.controller";
import { PermissionsService } from "#api/modules/permissions/permissions.service";

@Module({
	controllers: [PermissionsController],
	providers: [PermissionsService],
	exports: [PermissionsService],
})
export class PermissionsModule {}

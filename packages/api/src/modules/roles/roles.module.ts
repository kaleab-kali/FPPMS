import { Module } from "@nestjs/common";
import { DatabaseModule } from "#api/database";
import { RolesController } from "#api/modules/roles/roles.controller";
import { RolesService } from "#api/modules/roles/roles.service";

@Module({
	imports: [DatabaseModule],
	controllers: [RolesController],
	providers: [RolesService],
	exports: [RolesService],
})
export class RolesModule {}

import { Module } from "@nestjs/common";
import { DatabaseModule } from "#api/database";
import { TenantsController } from "#api/modules/tenants/tenants.controller";
import { TenantsService } from "#api/modules/tenants/tenants.service";

@Module({
	imports: [DatabaseModule],
	controllers: [TenantsController],
	providers: [TenantsService],
	exports: [TenantsService],
})
export class TenantsModule {}

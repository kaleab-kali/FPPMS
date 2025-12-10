import { Module } from "@nestjs/common";
import { DatabaseModule } from "#api/database";
import { CentersController } from "#api/modules/centers/centers.controller";
import { CentersService } from "#api/modules/centers/centers.service";

@Module({
	imports: [DatabaseModule],
	controllers: [CentersController],
	providers: [CentersService],
	exports: [CentersService],
})
export class CentersModule {}

import { Module } from "@nestjs/common";
import { DatabaseModule } from "#api/database";
import { RegionsController } from "#api/modules/lookups/regions.controller";
import { RegionsService } from "#api/modules/lookups/regions.service";
import { SubCitiesController } from "#api/modules/lookups/sub-cities.controller";
import { SubCitiesService } from "#api/modules/lookups/sub-cities.service";
import { WoredasController } from "#api/modules/lookups/woredas.controller";
import { WoredasService } from "#api/modules/lookups/woredas.service";

@Module({
	imports: [DatabaseModule],
	controllers: [RegionsController, SubCitiesController, WoredasController],
	providers: [RegionsService, SubCitiesService, WoredasService],
	exports: [RegionsService, SubCitiesService, WoredasService],
})
export class LookupsModule {}

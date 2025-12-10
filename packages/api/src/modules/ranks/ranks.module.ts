import { Module } from "@nestjs/common";
import { DatabaseModule } from "#api/database";
import { RanksController } from "#api/modules/ranks/ranks.controller";
import { RanksService } from "#api/modules/ranks/ranks.service";

@Module({
	imports: [DatabaseModule],
	controllers: [RanksController],
	providers: [RanksService],
	exports: [RanksService],
})
export class RanksModule {}

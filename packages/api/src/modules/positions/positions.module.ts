import { Module } from "@nestjs/common";
import { DatabaseModule } from "#api/database";
import { PositionsController } from "#api/modules/positions/positions.controller";
import { PositionsService } from "#api/modules/positions/positions.service";

@Module({
	imports: [DatabaseModule],
	controllers: [PositionsController],
	providers: [PositionsService],
	exports: [PositionsService],
})
export class PositionsModule {}

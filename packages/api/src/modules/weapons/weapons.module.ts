import { Module } from "@nestjs/common";
import { DatabaseModule } from "#api/database";
import { AmmunitionController } from "./ammunition.controller";
import { AmmunitionService } from "./ammunition.service";
import { WeaponsController } from "./weapons.controller";
import { WeaponsService } from "./weapons.service";

@Module({
	imports: [DatabaseModule],
	controllers: [WeaponsController, AmmunitionController],
	providers: [WeaponsService, AmmunitionService],
	exports: [WeaponsService, AmmunitionService],
})
export class WeaponsModule {}

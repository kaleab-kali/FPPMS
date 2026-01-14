import { Module } from "@nestjs/common";
import { DatabaseModule } from "#api/database";
import { CenterInventoryController } from "./center-inventory.controller";
import { CenterInventoryService } from "./center-inventory.service";
import { InventoryController } from "./inventory.controller";
import { InventoryService } from "./inventory.service";

@Module({
	imports: [DatabaseModule],
	controllers: [InventoryController, CenterInventoryController],
	providers: [InventoryService, CenterInventoryService],
	exports: [InventoryService, CenterInventoryService],
})
export class InventoryModule {}

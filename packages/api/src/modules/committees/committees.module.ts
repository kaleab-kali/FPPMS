import { Module } from "@nestjs/common";
import { DatabaseModule } from "#api/database/database.module.js";
import { CommitteesController } from "./committees.controller.js";
import { CommitteesService } from "./committees.service.js";

@Module({
	imports: [DatabaseModule],
	controllers: [CommitteesController],
	providers: [CommitteesService],
	exports: [CommitteesService],
})
export class CommitteesModule {}

import { Module } from "@nestjs/common";
import { DatabaseModule } from "#api/database/database.module";
import { CommitteesController } from "./committees.controller";
import { CommitteesService } from "./committees.service";

@Module({
	imports: [DatabaseModule],
	controllers: [CommitteesController],
	providers: [CommitteesService],
	exports: [CommitteesService],
})
export class CommitteesModule {}

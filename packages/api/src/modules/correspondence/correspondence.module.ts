import { Module } from "@nestjs/common";
import { DatabaseModule } from "#api/database/database.module";
import { CorrespondenceController } from "./correspondence.controller";
import { CorrespondenceService } from "./correspondence.service";

@Module({
	imports: [DatabaseModule],
	controllers: [CorrespondenceController],
	providers: [CorrespondenceService],
	exports: [CorrespondenceService],
})
export class CorrespondenceModule {}

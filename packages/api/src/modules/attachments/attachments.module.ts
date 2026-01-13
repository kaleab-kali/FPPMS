import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { DatabaseModule } from "#api/database/database.module";
import { AttachmentsController } from "#api/modules/attachments/attachments.controller";
import { AttachmentsService } from "#api/modules/attachments/attachments.service";
import { AuthModule } from "#api/modules/auth/auth.module";

const MAX_FILE_SIZE = 50 * 1024 * 1024;

@Module({
	imports: [
		DatabaseModule,
		AuthModule,
		MulterModule.register({
			storage: memoryStorage(),
			limits: {
				fileSize: MAX_FILE_SIZE,
			},
		}),
	],
	controllers: [AttachmentsController],
	providers: [AttachmentsService],
	exports: [AttachmentsService],
})
export class AttachmentsModule {}

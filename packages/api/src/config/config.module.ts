import { Global, Module } from "@nestjs/common";
import { ConfigModule as NestConfigModule } from "@nestjs/config";
import { appConfig } from "#api/config/app.config";
import { databaseConfig } from "#api/config/database.config";
import { authConfig } from "#api/config/auth.config";
import { fileStorageConfig } from "#api/config/file-storage.config";

@Global()
@Module({
	imports: [
		NestConfigModule.forRoot({
			isGlobal: true,
			load: [appConfig, databaseConfig, authConfig, fileStorageConfig],
			envFilePath: [".env.local", ".env"],
		}),
	],
})
export class ConfigModule {}

import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AppController } from "#api/app.controller";
import { AppService } from "#api/app.service";
import { CommonModule } from "#api/common/common.module";
import { LoggerMiddleware } from "#api/common/middleware/logger.middleware";
import { TenantMiddleware } from "#api/common/middleware/tenant.middleware";
import { ConfigModule } from "#api/config";
import { DatabaseModule } from "#api/database";
import { AuthModule } from "#api/modules/auth/auth.module";

@Module({
	imports: [ConfigModule, DatabaseModule, CommonModule, AuthModule],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer): void {
		consumer.apply(LoggerMiddleware, TenantMiddleware).forRoutes("*");
	}
}

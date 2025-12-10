import { Module } from "@nestjs/common";
import { DatabaseModule } from "#api/database";
import { UsersController } from "#api/modules/users/users.controller";
import { UsersService } from "#api/modules/users/users.service";

@Module({
	imports: [DatabaseModule],
	controllers: [UsersController],
	providers: [UsersService],
	exports: [UsersService],
})
export class UsersModule {}

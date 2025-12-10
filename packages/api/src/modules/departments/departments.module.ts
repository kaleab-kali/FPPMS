import { Module } from "@nestjs/common";
import { DatabaseModule } from "#api/database";
import { DepartmentsController } from "#api/modules/departments/departments.controller";
import { DepartmentsService } from "#api/modules/departments/departments.service";

@Module({
	imports: [DatabaseModule],
	controllers: [DepartmentsController],
	providers: [DepartmentsService],
	exports: [DepartmentsService],
})
export class DepartmentsModule {}

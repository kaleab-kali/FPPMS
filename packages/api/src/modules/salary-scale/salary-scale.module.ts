import { Module } from "@nestjs/common";
import { PrismaService } from "#api/database/prisma.service";
import { SalaryScaleController } from "#api/modules/salary-scale/salary-scale.controller";
import { SalaryScaleService } from "#api/modules/salary-scale/salary-scale.service";

@Module({
	controllers: [SalaryScaleController],
	providers: [SalaryScaleService, PrismaService],
	exports: [SalaryScaleService],
})
export class SalaryScaleModule {}

import { Controller, Get } from "@nestjs/common";
import { AppService } from "#api/app.service";
import { Public } from "#api/common/decorators/public.decorator";

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Public()
	@Get()
	getHello(): string {
		return this.appService.getHello();
	}
}

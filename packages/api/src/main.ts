import { NestFactory } from "@nestjs/core";
import { AppModule } from "#api/app.module";

const PORT = 3000;
const API_PREFIX = "api";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.enableCors({
		origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	});

	app.setGlobalPrefix(API_PREFIX);

	await app.listen(process.env.PORT ?? PORT);
	console.log(`Application is running on: http://localhost:${PORT}/${API_PREFIX}`);
}
bootstrap();

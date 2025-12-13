import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "#api/app.module";

const PORT = 3000;
const API_PREFIX = "api";
const SWAGGER_PATH = "docs";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			whitelist: true,
			forbidNonWhitelisted: false,
			transformOptions: {
				enableImplicitConversion: true,
			},
		}),
	);

	app.enableCors({
		origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	});

	app.setGlobalPrefix(API_PREFIX);

	const config = new DocumentBuilder()
		.setTitle("EPPMS API")
		.setDescription("Ethiopian Prison Personnel Management System API Documentation")
		.setVersion("1.0")
		.addBearerAuth(
			{
				type: "http",
				scheme: "bearer",
				bearerFormat: "JWT",
				name: "Authorization",
				description: "Enter JWT token",
				in: "header",
			},
			"JWT-auth",
		)
		.addTag("auth", "Authentication endpoints")
		.addTag("tenants", "Tenant management")
		.addTag("centers", "Center management")
		.addTag("departments", "Department management")
		.addTag("positions", "Position management")
		.addTag("users", "User management")
		.addTag("roles", "Role management")
		.addTag("permissions", "Permission management")
		.addTag("ranks", "Military rank management")
		.addTag("lookups", "Lookup data (regions, sub-cities, woredas)")
		.addTag("employees", "Employee management (military, civilian, temporary)")
		.build();

	const documentFactory = () => SwaggerModule.createDocument(app, config);
	SwaggerModule.setup(SWAGGER_PATH, app, documentFactory, {
		swaggerOptions: {
			persistAuthorization: true,
		},
	});

	await app.listen(process.env.PORT ?? PORT);
	console.log(`Application is running on: http://localhost:${PORT}/${API_PREFIX}`);
	console.log(`Swagger documentation: http://localhost:${PORT}/${SWAGGER_PATH}`);
}
bootstrap();

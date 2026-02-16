import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import { AppModule } from "#api/app.module";

const PORT = 3000;
const API_PREFIX = "api";
const SWAGGER_PATH = "docs";

const DEFAULT_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"];

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.use(
		helmet({
			contentSecurityPolicy: {
				directives: {
					defaultSrc: ["'self'"],
					styleSrc: ["'self'", "'unsafe-inline'"],
					imgSrc: ["'self'", "data:", "https:"],
					scriptSrc: ["'self'"],
				},
			},
			hsts: {
				maxAge: 31536000,
				includeSubDomains: true,
				preload: true,
			},
			referrerPolicy: { policy: "strict-origin-when-cross-origin" },
		}),
	);

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

	const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : DEFAULT_ORIGINS;

	app.enableCors({
		origin: allowedOrigins,
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
		credentials: true,
		maxAge: 3600,
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

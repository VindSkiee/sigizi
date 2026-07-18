import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import {
  AllExceptionsFilter,
  PrismaExceptionFilter,
  ResponseTransformInterceptor,
  AppLoggerService,
} from "./common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Get logger from app
  const logger = app.get(AppLoggerService);
  app.useLogger(logger);

  // Global filters (order matters: Prisma first, then All)
  app.useGlobalFilters(
    new PrismaExceptionFilter(logger),
    new AllExceptionsFilter(logger),
  );

  // Global interceptors
  app.useGlobalInterceptors(new ResponseTransformInterceptor());

  // CORS
  app.enableCors({
    origin: process.env.NEXT_PUBLIC_PORTAL_URL,
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix("api");

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle("SIGIZI API")
    .setDescription(
      "Platform GovTech untuk digitalisasi perizinan dan pengawasan vendor MBG",
    )
    .setVersion("0.1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);

  logger.log(`SIGIZI API running on http://localhost:${port}`, "Bootstrap");
  logger.log(`Swagger docs: http://localhost:${port}/docs`, "Bootstrap");
}
bootstrap();

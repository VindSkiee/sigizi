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

  // 1. Get logger from app & set as global logger
  const logger = app.get(AppLoggerService);
  app.useLogger(logger);

  // 2. Global filters (order matters: Prisma first, then All)
  app.useGlobalFilters(
    new PrismaExceptionFilter(logger),
    new AllExceptionsFilter(logger),
  );

  // 3. Global interceptors
  app.useGlobalInterceptors(new ResponseTransformInterceptor());

  // 4. CORS configuration
  app.enableCors({
    origin: true, // Ubah array menjadi boolean 'true'
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // 5. Global prefix (Wajib SEBELUM app.listen)
  app.setGlobalPrefix("api");

  // 6. Validation (Wajib SEBELUM app.listen)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 7. Swagger setup (Wajib SEBELUM app.listen)
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

  // 8. JALANKAN SERVER (Cukup panggil SEKALI di paling akhir)
  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');

  logger.log(`SIGIZI API running on http://localhost:${port}`, "Bootstrap");
  logger.log(`Swagger docs: http://localhost:${port}/docs`, "Bootstrap");
}
bootstrap();
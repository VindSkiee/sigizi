import { Module, Global } from "@nestjs/common";
import { loggerConfig } from "./logger.config";
import { AppLoggerService } from "./pino-logger.service";

@Global()
@Module({
  imports: [loggerConfig],
  providers: [AppLoggerService],
  exports: [AppLoggerService],
})
export class LoggerModule {}

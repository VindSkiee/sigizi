import { Injectable, LoggerService } from "@nestjs/common";
import { Logger } from "nestjs-pino";

@Injectable()
export class AppLoggerService implements LoggerService {
  constructor(private readonly logger: Logger) {}

  log(message: string, context?: string) {
    this.logger.log(message, context);
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, trace, context);
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, context);
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, context);
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, context);
  }

  logRequest(method: string, url: string, requestId?: string) {
    this.logger.log(
      `[${requestId}] ${method} ${url} - Incoming request`,
      "HTTP",
    );
  }

  logResponse(
    method: string,
    url: string,
    statusCode: number,
    requestId?: string,
    duration?: number,
  ) {
    this.logger.log(
      `[${requestId}] ${method} ${url} ${statusCode} ${duration}ms`,
      "HTTP",
    );
  }

  logError(error: Error, requestId?: string, context?: string) {
    this.logger.error(`[${requestId}] ${error.message}`, error.stack, context);
  }
}

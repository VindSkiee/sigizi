import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { Request, Response } from "express";
import { AppLoggerService } from "../logger/pino-logger.service";

@Injectable()
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = request.requestId;
    const isDev = process.env.NODE_ENV !== "production";

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal server error";
    let code = "INTERNAL_ERROR";
    let details: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === "string") {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === "object") {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || exception.message;
        details = responseObj.details || responseObj.errors;
        code = responseObj.code || this.getErrorCode(status);
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.logError(exception, requestId, "UnhandledException");
    }

    const errorResponse = {
      success: false,
      error: {
        code,
        message: Array.isArray(message) ? message[0] : message,
        ...(details && { details }),
        ...(isDev && exception instanceof Error && { stack: exception.stack }),
      },
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
      },
    };

    response.status(status).json(errorResponse);
  }

  private getErrorCode(status: number): string {
    const errorCodes: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: "BAD_REQUEST",
      [HttpStatus.UNAUTHORIZED]: "UNAUTHORIZED",
      [HttpStatus.FORBIDDEN]: "FORBIDDEN",
      [HttpStatus.NOT_FOUND]: "NOT_FOUND",
      [HttpStatus.CONFLICT]: "CONFLICT",
      [HttpStatus.UNPROCESSABLE_ENTITY]: "VALIDATION_ERROR",
      [HttpStatus.TOO_MANY_REQUESTS]: "RATE_LIMITED",
      [HttpStatus.INTERNAL_SERVER_ERROR]: "INTERNAL_ERROR",
      [HttpStatus.BAD_GATEWAY]: "BAD_GATEWAY",
      [HttpStatus.SERVICE_UNAVAILABLE]: "SERVICE_UNAVAILABLE",
    };
    return errorCodes[status] || "ERROR";
  }
}

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { Request, Response } from "express";
import { AppLoggerService } from "../logger/pino-logger.service";

@Injectable()
@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLoggerService) {}

  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = request.requestId;
    const isDev = process.env.NODE_ENV !== "production";

    const prismaErrorMap: Record<
      string,
      { status: number; code: string; message: string }
    > = {
      P2002: {
        status: HttpStatus.CONFLICT,
        code: "DUPLICATE_ENTRY",
        message: "Resource already exists with this unique field",
      },
      P2025: {
        status: HttpStatus.NOT_FOUND,
        code: "RECORD_NOT_FOUND",
        message: "Record not found",
      },
      P2003: {
        status: HttpStatus.BAD_REQUEST,
        code: "INVALID_RELATION",
        message: "Related record not found",
      },
      P2014: {
        status: HttpStatus.BAD_REQUEST,
        code: "REQUIRED_RELATION",
        message: "This operation requires a related record",
      },
      P2000: {
        status: HttpStatus.BAD_REQUEST,
        code: "DATA_TOO_LONG",
        message: "Input data is too long",
      },
      P2001: {
        status: HttpStatus.NOT_FOUND,
        code: "RECORD_NOT_FOUND",
        message: "Record not found",
      },
      P2011: {
        status: HttpStatus.BAD_REQUEST,
        code: "CONSTRAINT_VIOLATION",
        message: "Null constraint violation",
      },
      P2012: {
        status: HttpStatus.BAD_REQUEST,
        code: "MISSING_REQUIRED_FIELD",
        message: "Missing required field",
      },
      P2013: {
        status: HttpStatus.BAD_REQUEST,
        code: "MISSING_REQUIRED_ARGUMENT",
        message: "Missing required argument",
      },
      P2015: {
        status: HttpStatus.NOT_FOUND,
        code: "RECORD_NOT_FOUND",
        message: "Record not found",
      },
      P2016: {
        status: HttpStatus.BAD_REQUEST,
        code: "INVALID_QUERY",
        message: "Invalid query arguments",
      },
      P2017: {
        status: HttpStatus.BAD_REQUEST,
        code: "OPERATION_FAILED",
        message: "Operation failed due to relation constraint",
      },
      P2018: {
        status: HttpStatus.BAD_REQUEST,
        code: "RELATED_RECORD_NOT_FOUND",
        message: "Related record not found",
      },
      P2019: {
        status: HttpStatus.BAD_REQUEST,
        code: "INPUT_ERROR",
        message: "Input error",
      },
      P2020: {
        status: HttpStatus.BAD_REQUEST,
        code: "VALUE_OUT_OF_RANGE",
        message: "Value out of range",
      },
      P2021: {
        status: HttpStatus.BAD_REQUEST,
        code: "TABLE_NOT_FOUND",
        message: "Table does not exist",
      },
      P2022: {
        status: HttpStatus.BAD_REQUEST,
        code: "COLUMN_NOT_FOUND",
        message: "Column does not exist",
      },
    };

    const errorInfo = prismaErrorMap[exception.code] || {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: "DATABASE_ERROR",
      message: "A database error occurred",
    };

    this.logger.logError(
      new Error(`Prisma Error ${exception.code}: ${errorInfo.message}`),
      requestId,
      "PrismaException",
    );

    const errorResponse = {
      success: false,
      error: {
        code: errorInfo.code,
        message: errorInfo.message,
        ...(isDev && {
          details: {
            prismaCode: exception.code,
            meta: exception.meta,
          },
        }),
      },
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
      },
    };

    response.status(errorInfo.status).json(errorResponse);
  }
}

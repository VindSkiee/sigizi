import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { AppLoggerService } from "../logger/pino-logger.service";

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: AppLoggerService) {}

  use(req: Request, _res: Response, next: NextFunction) {
    const { method, url } = req;
    const requestId = req.requestId;
    const startTime = Date.now();

    this.logger.logRequest(method, url, requestId);

    _res.on("finish", () => {
      const duration = Date.now() - startTime;
      const statusCode = _res.statusCode;
      this.logger.logResponse(method, url, statusCode, requestId, duration);
    });

    next();
  }
}

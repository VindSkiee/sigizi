import { LoggerModule } from "nestjs-pino";
import { Request } from "express";
import { randomUUID } from "crypto";

const isDev = process.env.NODE_ENV !== "production";

export const loggerConfig = LoggerModule.forRoot({
  pinoHttp: {
    level: process.env.LOG_LEVEL || (isDev ? "debug" : "info"),
    transport: isDev
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        }
      : undefined,
    formatters: {
      level: (label) => ({ level: label }),
    },
    mixin: () => ({ service: "sigizi-backend" }),
    timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
    customLogLevel: (_req, res, err) => {
      if (res.statusCode >= 500 || err) return "error";
      if (res.statusCode >= 400) return "warn";
      return "info";
    },
    customSuccessMessage: (req) => {
      return `${req.method} ${req.url} completed`;
    },
    customErrorMessage: (_req, _res, err) => {
      return `Request failed: ${err.message}`;
    },
  },
});

export function genRequestId(_req: Request): string {
  return randomUUID();
}

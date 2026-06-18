import { randomUUID } from 'crypto';
import { Params } from 'nestjs-pino';
import { AppEnv } from '../common/enums/app-env.enum';

const isProd = process.env.APP_ENV === AppEnv.Prod;
const isTest = process.env.APP_ENV === AppEnv.Test;
// Pretty output only in an interactive terminal (local `npm run start:dev`).
// In any container stdout is not a TTY → emit JSON, which the log shipper parses.
// (pino-pretty is a devDependency and isn't present in the production image.)
const usePretty = !isProd && process.stdout.isTTY;

// Structured logging config (pino):
//  - PROD: single-line JSON to stdout (parsed by the log shipper → Better Stack)
//  - DEV : pretty, colourised, human-readable
//  - TEST: silent (no noise in the test runner)
//  - request payloads (bodies) ARE logged (via LoggingInterceptor) so we can see
//    what actually happened; only credentials are redacted (auth/cookie headers,
//    OTP codes, passwords) — never log those.
export const loggerConfig: Params = {
  pinoHttp: {
    level: process.env.LOG_LEVEL ?? (isProd ? 'info' : 'debug'),
    enabled: !isTest,
    base: { service: 'keren-server', env: process.env.APP_ENV },
    // correlation id per request (echoed back so logs can be traced end-to-end)
    genReqId: (req, res) => {
      const id = (req.headers['x-request-id'] as string) ?? randomUUID();
      res.setHeader('x-request-id', id);
      return id;
    },
    // emit string level names ("info"/"error") instead of pino's numeric codes (30/50)
    formatters: {
      level: (label: string) => ({ level: label }),
    },
    // the LoggingInterceptor emits one structured line per request — disable
    // pino-http's own "request completed" line to avoid duplication.
    autoLogging: false,
    // never log headers/cookies/bodies — only the safe request shape.
    // prefer req.ip (Express + trust proxy = real client IP) over the raw socket
    // address, which behind nginx is just the proxy's internal Docker IP.
    serializers: {
      req: (req) => ({
        id: req.id,
        method: req.method,
        url: req.url,
        ip: req.raw?.ip ?? req.remoteAddress,
      }),
      res: (res) => ({ statusCode: res.statusCode }),
    },
    // Redact credentials wherever they appear (headers + logged request bodies).
    // Payloads are logged on purpose; secrets are not.
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'body.code',
        'body.otp',
        'body.password',
        'body.token',
        '*.password',
      ],
      remove: true,
    },
    transport: usePretty
      ? { target: 'pino-pretty', options: { singleLine: true, translateTime: 'SYS:HH:MM:ss' } }
      : undefined,
  },
};

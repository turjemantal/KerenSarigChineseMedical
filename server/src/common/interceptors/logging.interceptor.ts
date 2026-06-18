import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { maskPhone } from '../utils/phone.utils';
import { LOG_DROP_BODY_FIELDS, LOG_MASK_BODY_FIELDS } from '../constants/logging.constants';
import type { AuthUser } from '../../auth/jwt.strategy';

// PII-minimized request body for logging: PII/health fields are dropped, phone is
// masked. The real values live in the DB and are looked up by entity id when needed.
function sanitizeBody(body: unknown): unknown {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return body;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
    if (LOG_DROP_BODY_FIELDS.includes(key)) continue;
    if (LOG_MASK_BODY_FIELDS.includes(key) && typeof value === 'string') {
      out[key] = maskPhone(value);
      continue;
    }
    out[key] = value;
  }
  return out;
}

// One structured line per HTTP request: fn, request { method, url, body },
// response { status }, durationMs, reqId.
// Body is sanitized (PII dropped/masked) — see logging.constants.ts.
// Uses the per-request pino logger (req.log) so every line shares the request's reqId.
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') return next.handle();

    const http = context.switchToHttp();
    const req = http.getRequest<{
      log?: { info: (o: unknown, m?: string) => void; error: (o: unknown, m?: string) => void };
      method: string; originalUrl?: string; url: string;
      body: unknown; user?: AuthUser;
    }>();
    const res = http.getResponse<{ statusCode: number }>();
    const logger = req.log;
    if (!logger) return next.handle();

    const start = Date.now();
    const base = {
      fn: `${context.getClass().name}.${context.getHandler().name}`,
      request: {
        method: req.method,
        url: req.originalUrl ?? req.url,
        body: sanitizeBody(req.body),
      },
    };

    return next.handle().pipe(
      tap({
        next: () =>
          logger.info({ ...base, response: { status: res.statusCode }, durationMs: Date.now() - start }, 'request completed'),
        error: (err: { status?: number; message?: string }) =>
          logger.error({ ...base, response: { status: err?.status ?? 500, error: err?.message }, durationMs: Date.now() - start }, 'request failed'),
      }),
    );
  }
}

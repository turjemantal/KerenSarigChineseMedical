import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

// Logs one line per HTTP request: method, path, status code, and duration.
// Gives a baseline "access log" for the whole API (visible via docker logs).
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const { method, originalUrl, ip } = req;
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const res = context.switchToHttp().getResponse();
          this.logger.log(`${method} ${originalUrl} ${res.statusCode} ${Date.now() - start}ms — ${ip}`);
        },
        error: (err) => {
          const status = err?.status ?? 500;
          this.logger.warn(`${method} ${originalUrl} ${status} ${Date.now() - start}ms — ${ip}`);
        },
      }),
    );
  }
}

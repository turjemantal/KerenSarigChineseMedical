import { Injectable, Logger, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerLimitDetail } from '@nestjs/throttler';

// Same per-IP rate limiting as the built-in guard, but logs a warning whenever a
// client is throttled — so volume attacks (e.g. SMS pumping) show up in the logs.
@Injectable()
export class LoggingThrottlerGuard extends ThrottlerGuard {
  private readonly logger = new Logger('Throttler');

  protected async throwThrottlingException(
    context: ExecutionContext,
    detail: ThrottlerLimitDetail,
  ): Promise<void> {
    const req = context.switchToHttp().getRequest();
    this.logger.warn(
      `[RateLimit] ${req.ip} blocked on ${req.method} ${req.originalUrl} (limit=${detail.limit}/${detail.ttl}ms, hits=${detail.totalHits})`,
    );
    return super.throwThrottlingException(context, detail);
  }
}

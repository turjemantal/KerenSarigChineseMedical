// Overall health verdict reported by GET /api/health.
export enum HealthStatus {
  Ok = 'ok',
  Degraded = 'degraded',
}

// Human-readable name per Mongoose connection readyState (index = state code).
// Typed as string[] (not a tuple) so an out-of-range code like 99 (uninitialized)
// simply yields undefined → DB_STATE_UNKNOWN, rather than a tuple-index error.
export const MONGOOSE_READY_STATES: string[] = ['disconnected', 'connected', 'connecting', 'disconnecting'];
export const DB_STATE_CONNECTED = 'connected';
export const DB_STATE_UNKNOWN = 'unknown';

/**
 * Shared bootstrap for one-off DB maintenance scripts (scripts/*.ts).
 *
 * There is intentionally NO migration framework / ledger — each script is an explicit,
 * idempotent task you run by hand WHEN you need it (e.g. after a deploy that adds an
 * index). `withDb` just provides the connection + the same safety guard as main.ts:
 * a non-PROD run may only touch a local DB, so a script can never hit production by
 * accident.
 *
 *   APP_ENV=PROD MONGODB_URI='<prod-uri>' ts-node --transpile-only scripts/<name>.ts
 */
import { resolve } from 'path';
import { config as loadEnv } from 'dotenv';

loadEnv({ path: resolve(process.cwd(), '../.env'), quiet: true });

import mongoose from 'mongoose';
import { LOCAL_DB_HOSTS, MONGODB_SRV_PREFIX, MONGODB_PREFIX } from '../src/common/constants/database.constants';
import { AppEnv } from '../src/common/enums/app-env.enum';

function dbHostIsLocal(uri: string): boolean {
  if (uri.startsWith(MONGODB_SRV_PREFIX)) return false;
  let host = '';
  try {
    host = new URL(uri).hostname;
  } catch {
    host = uri.replace(MONGODB_PREFIX, '').replace(/.*@/, '').split(/[:/?,]/)[0];
  }
  return (LOCAL_DB_HOSTS as readonly string[]).includes(host);
}

/**
 * Connects, runs `task`, disconnects. Refuses a remote DB outside PROD. Exits non-zero
 * on failure so it's safe to chain in a deploy step.
 */
export function withDb(label: string, task: () => Promise<void>): void {
  const uri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/keren-clinic';
  if (process.env.APP_ENV !== AppEnv.Prod && !dbHostIsLocal(uri)) {
    console.error('[Safety] Refusing to touch a remote DB outside PROD. Use a local database.');
    process.exit(1);
  }

  void (async () => {
    console.log(`▶ ${label}`);
    await mongoose.connect(uri);
    try {
      await task();
      console.log(`✅ ${label} — done`);
    } finally {
      await mongoose.disconnect();
    }
  })().catch((err) => {
    console.error(`❌ ${label} — failed:`, err);
    process.exit(1);
  });
}

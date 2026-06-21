/**
 * Migration runner.
 *
 * Discovers versioned migrations (migrations/v<N>/*.ts), and applies — in order, on a
 * single connection — any that aren't yet recorded in the `_migrations` collection.
 * Each applied migration is recorded, so it runs exactly once per database.
 *
 * Add a migration: drop a file in migrations/v<N>/ that exports `export async function
 * up()`. Nothing else to wire — no package.json change. (The initDB baseline for fresh
 * local volumes lives separately in migrations/init/ and is not run here.)
 *
 * Usage: npm run migrate
 *   MONGODB_URI + APP_ENV come from the environment / root .env (like the server). A
 *   non-PROD run may only touch a local DB — the same safety guard as main.ts.
 */
import { resolve } from 'path';
import { readdirSync } from 'fs';
import { config as loadEnv } from 'dotenv';

loadEnv({ path: resolve(process.cwd(), '../.env'), quiet: true });

import mongoose from 'mongoose';
import { LOCAL_DB_HOSTS, MONGODB_SRV_PREFIX, MONGODB_PREFIX } from '../src/common/constants/database.constants';
import { AppEnv } from '../src/common/enums/app-env.enum';

const MIGRATIONS_COLLECTION = '_migrations';

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

interface Migration {
  name: string;
  up: () => Promise<void>;
}

// Find every migrations/v<N>/*.{ts,js} that exports up(), ordered by version then filename.
async function discover(): Promise<Migration[]> {
  const migrations: Migration[] = [];
  const versions = readdirSync(__dirname, { withFileTypes: true })
    .filter((e) => e.isDirectory() && /^v\d+$/.test(e.name))
    .map((e) => e.name)
    .sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));

  for (const version of versions) {
    const files = readdirSync(resolve(__dirname, version))
      .filter((f) => /\.(ts|js)$/.test(f) && !f.endsWith('.d.ts'))
      .sort();
    for (const file of files) {
      const mod = (await import(resolve(__dirname, version, file))) as { up?: () => Promise<void> };
      if (typeof mod.up === 'function') {
        migrations.push({ name: `${version}/${file.replace(/\.(ts|js)$/, '')}`, up: mod.up });
      }
    }
  }
  return migrations;
}

async function main(): Promise<void> {
  const uri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/keren-clinic';
  if (process.env.APP_ENV !== AppEnv.Prod && !dbHostIsLocal(uri)) {
    console.error('[Safety] Refusing to migrate a remote DB outside PROD. Use a local database.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  const ledger = mongoose.connection.collection(MIGRATIONS_COLLECTION);
  const applied = new Set((await ledger.find({}).toArray()).map((d) => d.name as string));

  const migrations = await discover();
  let ran = 0;
  for (const m of migrations) {
    if (applied.has(m.name)) {
      console.log(`• ${m.name} — already applied`);
      continue;
    }
    console.log(`▶ ${m.name}`);
    await m.up();
    await ledger.insertOne({ name: m.name, appliedAt: new Date() });
    ran++;
  }

  console.log(`✅ Migrations complete: ${ran} applied, ${migrations.length - ran} already up to date.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});

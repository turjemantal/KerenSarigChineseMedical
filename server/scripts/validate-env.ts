/**
 * Pre-flight validation for a rendered .env file.
 *
 * Runs the SAME Joi schema the server uses at startup (src/config/env.validation)
 * against a given env file, plus checks the vars docker-compose.prod.yml needs to
 * pull images. Used by the CD pipeline to validate the prod .env BEFORE anything
 * is shipped — so "I forgot to add a required var" fails the deploy red while
 * production stays on the last working version, instead of crash-looping live.
 *
 * Usage: ts-node scripts/validate-env.ts <path-to-env-file>
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { parse } from 'dotenv';
import { envSchema } from '../src/config/env.validation';

const file = process.argv[2];
if (!file) {
  console.error('Usage: validate:env <path-to-env-file>');
  process.exit(2);
}

let raw: string;
try {
  raw = readFileSync(resolve(file), 'utf8');
} catch {
  console.error(`❌ Cannot read env file: ${file}`);
  process.exit(2);
}

const parsed = parse(raw);

// Not part of the app schema, but docker-compose.prod.yml needs these to pull images.
const composeVars = ['ECR_SERVER_IMAGE', 'ECR_CLIENT_IMAGE'];
const missingCompose = composeVars.filter((key) => !parsed[key]);

const { error } = envSchema.validate(parsed);

if (error || missingCompose.length) {
  console.error('❌ Prod .env failed pre-flight validation — deploy aborted, production untouched.');
  if (error) console.error(`  Schema: ${error.message}`);
  if (missingCompose.length) console.error(`  Missing compose vars: ${missingCompose.join(', ')}`);
  process.exit(1);
}

console.log('✅ Prod .env passed pre-flight validation');

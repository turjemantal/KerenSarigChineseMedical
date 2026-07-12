// One-off SMS smoke test — verifies the 019sms API token + sender identity.
// Usage:  npx ts-node scripts/test-sms.ts <to-phone-05XXXXXXXX> [sender]
//         sender defaults to SMS_019_SENDER; pass e.g. "KerenSarig" to test
//         another sender name (max 11 chars, English letters/digits).
import { resolve } from 'path';
import { config as loadEnv } from 'dotenv';
loadEnv({ path: resolve(__dirname, '../../.env'), quiet: true });

import { config } from '../src/config';
import { SMS_019_API_URL, SMS_019_SUCCESS_STATUS } from '../src/common/constants/sms.constants';

async function main() {
  const [to, sender = config.sms019.sender] = process.argv.slice(2);
  if (!to) {
    console.error('Usage: npx ts-node scripts/test-sms.ts <to-phone> [sender]');
    process.exit(1);
  }

  const body = {
    sms: {
      user: { username: config.sms019.username },
      source: sender,
      destinations: { phone: [{ _: to }] },
      message: 'בדיקה — קליניקת קרן שריג ✓',
    },
  };

  console.log(`Sending test SMS  source="${sender}"  to="${to}" …`);
  const res = await fetch(SMS_019_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.sms019.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  console.log(`019sms response (HTTP ${res.status}): ${text}`);
  const parsed = JSON.parse(text);
  if (!res.ok || parsed.status !== SMS_019_SUCCESS_STATUS) {
    throw new Error(`019sms rejected the message (status=${parsed.status}: ${parsed.message})`);
  }
  console.log('Accepted — check the phone, and delivery reports in the 019 web console.');
}

main().catch(e => {
  console.error('FAILED:', e.message ?? e);
  process.exit(1);
});

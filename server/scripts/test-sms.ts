// One-off SMS smoke test — verifies Twilio API key auth + sender identity.
// Usage:  npx ts-node scripts/test-sms.ts <to-phone-05XXXXXXXX> [from]
//         from defaults to TWILIO_FROM_NUMBER; pass e.g. "KerenSarig" to test
//         an alphanumeric sender ID.
import { resolve } from 'path';
import { config as loadEnv } from 'dotenv';
loadEnv({ path: resolve(__dirname, '../../.env'), quiet: true });

import { Twilio } from 'twilio';
import { config } from '../src/config';
import { toE164 } from '../src/common/utils/phone.utils';

async function main() {
  const [to, from = config.twilio.fromNumber] = process.argv.slice(2);
  if (!to) {
    console.error('Usage: npx ts-node scripts/test-sms.ts <to-phone> [from]');
    process.exit(1);
  }

  const client = new Twilio(config.twilio.apiKeySid, config.twilio.apiKeySecret, {
    accountSid: config.twilio.accountSid,
  });

  const recipient = toE164(to);
  console.log(`Sending test SMS  from="${from}"  to="${recipient}" …`);
  const msg = await client.messages.create({
    from,
    to: recipient,
    body: 'בדיקה — קליניקת קרן שריג ✓',
  });
  console.log(`Accepted by Twilio: sid=${msg.sid} status=${msg.status}`);
  console.log('Check the phone — and message status at https://console.twilio.com/us1/monitor/logs/sms');
}

main().catch(e => {
  console.error('FAILED:', e.message ?? e);
  process.exit(1);
});

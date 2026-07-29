import { readFileSync } from 'fs';
import { join } from 'path';
import { APPOINTMENT_DURATION_MINUTES } from '../src/common/constants/schedule.constants';
import { FREE_CANCELLATION_HOURS } from '../src/common/constants/schedule.constants';
import { PHONE_REGEX } from '../src/common/constants/validation.constants';

// The client can't import from the server (separate build contexts — see the Docker
// setup), so client/src/constants.ts hand-mirrors a few server values. A silent drift
// there is nasty: the UI promises a rule the server doesn't actually enforce. A 50-minute
// appointment drawn as 45, a "free until 24h" notice the server rejects at 23h.
//
// This test is the gate: it reads the real client file and fails CI the moment a mirrored
// value stops matching its server original. Update BOTH, or this goes red.
const CLIENT_CONSTANTS = join(__dirname, '../../client/src/constants.ts');

function clientNumber(name: string): number {
  const source = readFileSync(CLIENT_CONSTANTS, 'utf8');
  const match = new RegExp(`export const ${name} = (\\d+)`).exec(source);
  if (!match) throw new Error(`${name} not found in client/src/constants.ts`);
  return Number(match[1]);
}

function clientRegex(name: string): string {
  const source = readFileSync(CLIENT_CONSTANTS, 'utf8');
  const match = new RegExp(`export const ${name} = (/.*/)\\s*$`, 'm').exec(source);
  if (!match) throw new Error(`${name} not found in client/src/constants.ts`);
  return match[1];
}

describe('client constants mirror the server', () => {
  it('APPOINTMENT_DURATION_MINUTES matches', () => {
    expect(clientNumber('APPOINTMENT_DURATION_MINUTES')).toBe(APPOINTMENT_DURATION_MINUTES);
  });

  it('FREE_CANCELLATION_HOURS matches', () => {
    expect(clientNumber('FREE_CANCELLATION_HOURS')).toBe(FREE_CANCELLATION_HOURS);
  });

  it('PHONE_REGEX matches', () => {
    expect(clientRegex('PHONE_REGEX')).toBe(String(PHONE_REGEX));
  });
});

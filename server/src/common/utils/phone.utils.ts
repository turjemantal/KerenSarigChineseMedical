import { ISRAEL_COUNTRY_CODE } from '../constants/defaults.constants';

export function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.startsWith('0')
    ? `+${ISRAEL_COUNTRY_CODE}${digits.slice(1)}`
    : `+${digits}`;
}

export function toInternational(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.startsWith('0')
    ? `${ISRAEL_COUNTRY_CODE}${digits.slice(1)}`
    : digits;
}

// mask a phone for logs: 0501234567 → 050***4567 (never log a full number)
export function maskPhone(phone: string): string {
  return phone.length < 7 ? '***' : `${phone.slice(0, 3)}***${phone.slice(-4)}`;
}

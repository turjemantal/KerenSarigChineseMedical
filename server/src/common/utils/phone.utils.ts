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

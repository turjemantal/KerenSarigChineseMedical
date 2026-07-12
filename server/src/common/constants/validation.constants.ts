export const PHONE_REGEX = /^05\d{8}$/;
export const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
export const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
// 019sms sender ("source") — max 11 chars, English letters and digits only
export const SMS_SENDER_REGEX = /^[A-Za-z0-9]{1,11}$/;

export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 100;
export const CONCERN_MIN_LENGTH = 4;
export const CONCERN_MAX_LENGTH = 500;
export const NOTES_MAX_LENGTH = 1000;
export const SOURCE_MAX_LENGTH = 50;
export const TREATMENT_MAX_LENGTH = 100;
export const REASON_MAX_LENGTH = 200;
export const MAX_PUBLIC_RANGE_DAYS = 366;
export const OTP_CODE_LENGTH = 6;

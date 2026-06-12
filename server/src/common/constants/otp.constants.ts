export const OTP_EXPIRY_MINUTES = 10;
export const OTP_EXPIRY_MS = OTP_EXPIRY_MINUTES * 60 * 1000;
export const OTP_CODE_MIN = 100_000;
export const OTP_CODE_RANGE = 900_000;

// ─── Anti-abuse: per-phone SMS limits (cost + harassment protection) ──────────
// Minimum wait between two OTP sends to the same number.
export const OTP_RESEND_COOLDOWN_SECONDS = 60;
export const OTP_RESEND_COOLDOWN_MS = OTP_RESEND_COOLDOWN_SECONDS * 1000;
// Rolling window for the per-phone send cap, and how many sends it allows.
export const OTP_SEND_WINDOW_HOURS = 24;
export const OTP_SEND_WINDOW_MS = OTP_SEND_WINDOW_HOURS * 60 * 60 * 1000;
export const OTP_MAX_SENDS_PER_WINDOW = 5;

// ─── Anti-abuse: per-IP rate limits (named throttlers) ────────────────────────
export const OTP_IP_PER_MINUTE = 3;
export const OTP_IP_PER_HOUR = 15;

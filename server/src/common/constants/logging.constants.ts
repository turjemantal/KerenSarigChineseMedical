// PII / sensitive request-body fields that must NOT reach the logs (which ship to
// a third-party store). They are dropped entirely — the real values live in the DB
// and are looked up by entity id when genuinely needed. `concern` is health data.
export const LOG_DROP_BODY_FIELDS = ['name', 'email', 'concern', 'notes', 'code', 'otp', 'password', 'token'];

// Body fields kept but masked (e.g. phone → 050***4567) so a record stays traceable
// without exposing the full value.
export const LOG_MASK_BODY_FIELDS = ['phone'];

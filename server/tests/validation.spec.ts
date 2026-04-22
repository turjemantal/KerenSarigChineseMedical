import { BadRequestException } from '@nestjs/common';
import { createLeadSchema, updateLeadSchema } from '../src/leads/dto/validations/lead.schemas';
import { createAppointmentSchema, updateAppointmentSchema } from '../src/appointments/dto/validations/appointment.schemas';
import { requestOtpSchema, verifyOtpSchema, adminLoginSchema, updateNameSchema } from '../src/auth/dto/validations/auth.schemas';
import { JoiValidationPipe } from '../src/common/pipes/joi-validation.pipe';
import { AppointmentStatus } from '../src/common/enums/appointment-status.enum';
import { LeadStatus } from '../src/common/enums/lead-status.enum';

// ── Lead schemas ───────────────────────────────────────────────────────────────

describe('createLeadSchema', () => {
  const valid = { name: 'ישראל ישראלי', phone: '0501234567', concern: 'כאב גב כרוני' };

  it('accepts a valid lead payload', () => {
    expect(createLeadSchema.validate(valid).error).toBeUndefined();
  });

  it('rejects missing name', () => {
    expect(createLeadSchema.validate({ ...valid, name: undefined }).error).toBeDefined();
  });

  it('rejects name shorter than 2 characters', () => {
    expect(createLeadSchema.validate({ ...valid, name: 'א' }).error).toBeDefined();
  });

  it('rejects a non-Israeli phone (wrong prefix)', () => {
    expect(createLeadSchema.validate({ ...valid, phone: '0321234567' }).error).toBeDefined();
  });

  it('rejects phone shorter than 10 digits', () => {
    expect(createLeadSchema.validate({ ...valid, phone: '050123' }).error).toBeDefined();
  });

  it('accepts all Israeli mobile prefixes (052, 053, 054, 055, 058)', () => {
    for (const phone of ['0521234567', '0531234567', '0541234567', '0551234567', '0581234567']) {
      expect(createLeadSchema.validate({ ...valid, phone }).error).toBeUndefined();
    }
  });

  it('rejects an invalid email format', () => {
    expect(createLeadSchema.validate({ ...valid, email: 'not-an-email' }).error).toBeDefined();
  });

  it('accepts a valid email', () => {
    expect(createLeadSchema.validate({ ...valid, email: 'user@example.com' }).error).toBeUndefined();
  });

  it('accepts empty-string email (field is optional)', () => {
    expect(createLeadSchema.validate({ ...valid, email: '' }).error).toBeUndefined();
  });

  it('rejects concern shorter than 4 characters', () => {
    expect(createLeadSchema.validate({ ...valid, concern: 'אב' }).error).toBeDefined();
  });

  it('rejects concern longer than 500 characters', () => {
    expect(createLeadSchema.validate({ ...valid, concern: 'א'.repeat(501) }).error).toBeDefined();
  });

  it('strips unknown fields', () => {
    const { value } = createLeadSchema.validate({ ...valid, unknownField: 'x' }, { stripUnknown: true });
    expect(value).not.toHaveProperty('unknownField');
  });
});

describe('updateLeadSchema', () => {
  it('accepts every LeadStatus enum value', () => {
    for (const status of Object.values(LeadStatus)) {
      expect(updateLeadSchema.validate({ status }).error).toBeUndefined();
    }
  });

  it('rejects a status value outside the enum', () => {
    expect(updateLeadSchema.validate({ status: 'unknown' }).error).toBeDefined();
  });

  it('accepts a notes-only update', () => {
    expect(updateLeadSchema.validate({ notes: 'הערה חדשה' }).error).toBeUndefined();
  });
});

// ── Appointment schemas ────────────────────────────────────────────────────────

describe('createAppointmentSchema', () => {
  const valid = { date: '2026-06-15', time: '10:30' };

  it('accepts a minimal valid payload (date + time only)', () => {
    expect(createAppointmentSchema.validate(valid).error).toBeUndefined();
  });

  it('rejects missing date', () => {
    expect(createAppointmentSchema.validate({ time: '10:30' }).error).toBeDefined();
  });

  it('rejects missing time', () => {
    expect(createAppointmentSchema.validate({ date: '2026-06-15' }).error).toBeDefined();
  });

  it('rejects malformed date (not YYYY-MM-DD)', () => {
    expect(createAppointmentSchema.validate({ ...valid, date: '15/06/2026' }).error).toBeDefined();
  });

  it('rejects malformed time (not HH:MM)', () => {
    expect(createAppointmentSchema.validate({ ...valid, time: '9:5' }).error).toBeDefined();
  });

  it('accepts boundary times (00:00 and 23:59)', () => {
    expect(createAppointmentSchema.validate({ ...valid, time: '00:00' }).error).toBeUndefined();
    expect(createAppointmentSchema.validate({ ...valid, time: '23:59' }).error).toBeUndefined();
  });

  it('rejects hour 24 (24:00)', () => {
    expect(createAppointmentSchema.validate({ ...valid, time: '24:00' }).error).toBeDefined();
  });

  it('rejects an invalid email', () => {
    expect(createAppointmentSchema.validate({ ...valid, email: 'bad-email' }).error).toBeDefined();
  });

  it('accepts a valid optional email', () => {
    expect(createAppointmentSchema.validate({ ...valid, email: 'client@example.com' }).error).toBeUndefined();
  });
});

describe('updateAppointmentSchema', () => {
  it('accepts every AppointmentStatus enum value', () => {
    for (const status of Object.values(AppointmentStatus)) {
      expect(updateAppointmentSchema.validate({ status }).error).toBeUndefined();
    }
  });

  it('rejects a status value outside the enum', () => {
    expect(updateAppointmentSchema.validate({ status: 'invalid' }).error).toBeDefined();
  });
});

// ── Auth schemas ───────────────────────────────────────────────────────────────

describe('requestOtpSchema', () => {
  it('accepts a valid Israeli phone', () => {
    expect(requestOtpSchema.validate({ phone: '0501234567' }).error).toBeUndefined();
  });

  it('rejects a non-Israeli phone', () => {
    expect(requestOtpSchema.validate({ phone: '0721234567' }).error).toBeDefined();
  });

  it('rejects missing phone', () => {
    expect(requestOtpSchema.validate({}).error).toBeDefined();
  });
});

describe('verifyOtpSchema', () => {
  const valid = { phone: '0501234567', code: '123456' };

  it('accepts a valid phone + 6-digit code', () => {
    expect(verifyOtpSchema.validate(valid).error).toBeUndefined();
  });

  it('rejects a code shorter than 6 digits', () => {
    expect(verifyOtpSchema.validate({ ...valid, code: '12345' }).error).toBeDefined();
  });

  it('rejects a non-numeric code', () => {
    expect(verifyOtpSchema.validate({ ...valid, code: 'abcdef' }).error).toBeDefined();
  });

  it('accepts optional name field', () => {
    expect(verifyOtpSchema.validate({ ...valid, name: 'ישראל' }).error).toBeUndefined();
  });
});

describe('adminLoginSchema', () => {
  it('accepts a non-empty password', () => {
    expect(adminLoginSchema.validate({ password: 'secret' }).error).toBeUndefined();
  });

  it('rejects missing password', () => {
    expect(adminLoginSchema.validate({}).error).toBeDefined();
  });

  it('rejects empty-string password', () => {
    expect(adminLoginSchema.validate({ password: '' }).error).toBeDefined();
  });
});

describe('updateNameSchema', () => {
  it('accepts a valid name', () => {
    expect(updateNameSchema.validate({ name: 'ישראל ישראלי' }).error).toBeUndefined();
  });

  it('rejects a name shorter than 2 characters', () => {
    expect(updateNameSchema.validate({ name: 'א' }).error).toBeDefined();
  });

  it('rejects missing name', () => {
    expect(updateNameSchema.validate({}).error).toBeDefined();
  });
});

// ── JoiValidationPipe ─────────────────────────────────────────────────────────

describe('JoiValidationPipe', () => {
  it('returns validated value and strips unknown fields', () => {
    const pipe = new JoiValidationPipe(createLeadSchema);
    const result = pipe.transform({ name: 'ישראל ישראלי', phone: '0501234567', concern: 'כאב גב כרוני', extra: 'drop' });
    expect(result).not.toHaveProperty('extra');
    expect(result).toMatchObject({ name: 'ישראל ישראלי', phone: '0501234567' });
  });

  it('throws BadRequestException when body fails schema validation', () => {
    const pipe = new JoiValidationPipe(createLeadSchema);
    expect(() => pipe.transform({ name: 'X', phone: 'bad', concern: 'ok ok ok' })).toThrow(BadRequestException);
  });

  it('joins multiple field errors with a semicolon separator', () => {
    const pipe = new JoiValidationPipe(createLeadSchema);
    try {
      pipe.transform({ name: 'X', phone: 'bad' });
    } catch (e: any) {
      expect(e.message).toContain(';');
    }
  });
});

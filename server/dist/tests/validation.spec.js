"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const lead_schemas_1 = require("../src/leads/validations/lead.schemas");
const appointment_schemas_1 = require("../src/appointments/validations/appointment.schemas");
const auth_schemas_1 = require("../src/auth/validations/auth.schemas");
const joi_validation_guard_1 = require("../src/common/guards/joi-validation.guard");
const appointment_status_enum_1 = require("../src/common/enums/appointment-status.enum");
const lead_status_enum_1 = require("../src/common/enums/lead-status.enum");
function makeContext(body, schema) {
    const reflector = new core_1.Reflector();
    jest.spyOn(reflector, 'get').mockReturnValue(schema);
    const req = { body };
    const ctx = {
        switchToHttp: () => ({ getRequest: () => req }),
        getHandler: () => ({}),
    };
    return { guard: new joi_validation_guard_1.JoiValidationGuard(reflector), ctx, req };
}
describe('createLeadSchema', () => {
    const valid = { name: 'ישראל ישראלי', phone: '0501234567', concern: 'כאב גב כרוני' };
    it('accepts a valid lead payload', () => {
        expect(lead_schemas_1.createLeadSchema.validate(valid).error).toBeUndefined();
    });
    it('rejects missing name', () => {
        expect(lead_schemas_1.createLeadSchema.validate({ ...valid, name: undefined }).error).toBeDefined();
    });
    it('rejects name shorter than 2 characters', () => {
        expect(lead_schemas_1.createLeadSchema.validate({ ...valid, name: 'א' }).error).toBeDefined();
    });
    it('rejects a non-Israeli phone (wrong prefix)', () => {
        expect(lead_schemas_1.createLeadSchema.validate({ ...valid, phone: '0321234567' }).error).toBeDefined();
    });
    it('rejects phone shorter than 10 digits', () => {
        expect(lead_schemas_1.createLeadSchema.validate({ ...valid, phone: '050123' }).error).toBeDefined();
    });
    it('accepts all Israeli mobile prefixes (052, 053, 054, 055, 058)', () => {
        for (const phone of ['0521234567', '0531234567', '0541234567', '0551234567', '0581234567']) {
            expect(lead_schemas_1.createLeadSchema.validate({ ...valid, phone }).error).toBeUndefined();
        }
    });
    it('rejects an invalid email format', () => {
        expect(lead_schemas_1.createLeadSchema.validate({ ...valid, email: 'not-an-email' }).error).toBeDefined();
    });
    it('accepts a valid email', () => {
        expect(lead_schemas_1.createLeadSchema.validate({ ...valid, email: 'user@example.com' }).error).toBeUndefined();
    });
    it('accepts empty-string email (field is optional)', () => {
        expect(lead_schemas_1.createLeadSchema.validate({ ...valid, email: '' }).error).toBeUndefined();
    });
    it('rejects concern shorter than 4 characters', () => {
        expect(lead_schemas_1.createLeadSchema.validate({ ...valid, concern: 'אב' }).error).toBeDefined();
    });
    it('rejects concern longer than 500 characters', () => {
        expect(lead_schemas_1.createLeadSchema.validate({ ...valid, concern: 'א'.repeat(501) }).error).toBeDefined();
    });
    it('strips unknown fields', () => {
        const { value } = lead_schemas_1.createLeadSchema.validate({ ...valid, unknownField: 'x' }, { stripUnknown: true });
        expect(value).not.toHaveProperty('unknownField');
    });
});
describe('updateLeadSchema', () => {
    it('accepts every LeadStatus enum value', () => {
        for (const status of Object.values(lead_status_enum_1.LeadStatus)) {
            expect(lead_schemas_1.updateLeadSchema.validate({ status }).error).toBeUndefined();
        }
    });
    it('rejects a status value outside the enum', () => {
        expect(lead_schemas_1.updateLeadSchema.validate({ status: 'unknown' }).error).toBeDefined();
    });
    it('accepts a notes-only update', () => {
        expect(lead_schemas_1.updateLeadSchema.validate({ notes: 'הערה חדשה' }).error).toBeUndefined();
    });
});
describe('createAppointmentSchema', () => {
    const valid = { date: '2026-06-15', time: '10:30' };
    it('accepts a minimal valid payload (date + time only)', () => {
        expect(appointment_schemas_1.createAppointmentSchema.validate(valid).error).toBeUndefined();
    });
    it('rejects missing date', () => {
        expect(appointment_schemas_1.createAppointmentSchema.validate({ time: '10:30' }).error).toBeDefined();
    });
    it('rejects missing time', () => {
        expect(appointment_schemas_1.createAppointmentSchema.validate({ date: '2026-06-15' }).error).toBeDefined();
    });
    it('rejects malformed date (not YYYY-MM-DD)', () => {
        expect(appointment_schemas_1.createAppointmentSchema.validate({ ...valid, date: '15/06/2026' }).error).toBeDefined();
    });
    it('rejects malformed time (not HH:MM)', () => {
        expect(appointment_schemas_1.createAppointmentSchema.validate({ ...valid, time: '9:5' }).error).toBeDefined();
    });
    it('accepts boundary times (00:00 and 23:59)', () => {
        expect(appointment_schemas_1.createAppointmentSchema.validate({ ...valid, time: '00:00' }).error).toBeUndefined();
        expect(appointment_schemas_1.createAppointmentSchema.validate({ ...valid, time: '23:59' }).error).toBeUndefined();
    });
    it('rejects hour 24 (24:00)', () => {
        expect(appointment_schemas_1.createAppointmentSchema.validate({ ...valid, time: '24:00' }).error).toBeDefined();
    });
    it('rejects an invalid email', () => {
        expect(appointment_schemas_1.createAppointmentSchema.validate({ ...valid, email: 'bad-email' }).error).toBeDefined();
    });
    it('accepts a valid optional email', () => {
        expect(appointment_schemas_1.createAppointmentSchema.validate({ ...valid, email: 'client@example.com' }).error).toBeUndefined();
    });
});
describe('updateAppointmentSchema', () => {
    it('accepts every AppointmentStatus enum value', () => {
        for (const status of Object.values(appointment_status_enum_1.AppointmentStatus)) {
            expect(appointment_schemas_1.updateAppointmentSchema.validate({ status }).error).toBeUndefined();
        }
    });
    it('rejects a status value outside the enum', () => {
        expect(appointment_schemas_1.updateAppointmentSchema.validate({ status: 'invalid' }).error).toBeDefined();
    });
});
describe('requestOtpSchema', () => {
    it('accepts a valid Israeli phone', () => {
        expect(auth_schemas_1.requestOtpSchema.validate({ phone: '0501234567' }).error).toBeUndefined();
    });
    it('rejects a non-Israeli phone', () => {
        expect(auth_schemas_1.requestOtpSchema.validate({ phone: '0721234567' }).error).toBeDefined();
    });
    it('rejects missing phone', () => {
        expect(auth_schemas_1.requestOtpSchema.validate({}).error).toBeDefined();
    });
});
describe('verifyOtpSchema', () => {
    const valid = { phone: '0501234567', code: '123456' };
    it('accepts a valid phone + 6-digit code', () => {
        expect(auth_schemas_1.verifyOtpSchema.validate(valid).error).toBeUndefined();
    });
    it('rejects a code shorter than 6 digits', () => {
        expect(auth_schemas_1.verifyOtpSchema.validate({ ...valid, code: '12345' }).error).toBeDefined();
    });
    it('rejects a non-numeric code', () => {
        expect(auth_schemas_1.verifyOtpSchema.validate({ ...valid, code: 'abcdef' }).error).toBeDefined();
    });
    it('accepts optional name field', () => {
        expect(auth_schemas_1.verifyOtpSchema.validate({ ...valid, name: 'ישראל' }).error).toBeUndefined();
    });
});
describe('adminLoginSchema', () => {
    it('accepts a non-empty password', () => {
        expect(auth_schemas_1.adminLoginSchema.validate({ password: 'secret' }).error).toBeUndefined();
    });
    it('rejects missing password', () => {
        expect(auth_schemas_1.adminLoginSchema.validate({}).error).toBeDefined();
    });
    it('rejects empty-string password', () => {
        expect(auth_schemas_1.adminLoginSchema.validate({ password: '' }).error).toBeDefined();
    });
});
describe('updateNameSchema', () => {
    it('accepts a valid name', () => {
        expect(auth_schemas_1.updateNameSchema.validate({ name: 'ישראל ישראלי' }).error).toBeUndefined();
    });
    it('rejects a name shorter than 2 characters', () => {
        expect(auth_schemas_1.updateNameSchema.validate({ name: 'א' }).error).toBeDefined();
    });
    it('rejects missing name', () => {
        expect(auth_schemas_1.updateNameSchema.validate({}).error).toBeDefined();
    });
});
describe('JoiValidationGuard', () => {
    it('returns true and strips unknown fields from req.body on success', () => {
        const body = { name: 'ישראל ישראלי', phone: '0501234567', concern: 'כאב גב כרוני', extra: 'drop' };
        const { guard, ctx, req } = makeContext(body, lead_schemas_1.createLeadSchema);
        expect(guard.canActivate(ctx)).toBe(true);
        expect(req.body).not.toHaveProperty('extra');
        expect(req.body).toMatchObject({ name: 'ישראל ישראלי', phone: '0501234567' });
    });
    it('throws BadRequestException when body fails schema validation', () => {
        const { guard, ctx } = makeContext({ name: 'X', phone: 'bad', concern: 'ok ok ok' }, lead_schemas_1.createLeadSchema);
        expect(() => guard.canActivate(ctx)).toThrow(common_1.BadRequestException);
    });
    it('joins multiple field errors with a semicolon separator', () => {
        const { guard, ctx } = makeContext({ name: 'X', phone: 'bad' }, lead_schemas_1.createLeadSchema);
        try {
            guard.canActivate(ctx);
        }
        catch (e) {
            expect(e.message).toContain(';');
        }
    });
    it('passes through without error when no schema is set on the handler', () => {
        const { guard, ctx } = makeContext({ anything: 'goes' }, undefined);
        expect(guard.canActivate(ctx)).toBe(true);
    });
});
//# sourceMappingURL=validation.spec.js.map
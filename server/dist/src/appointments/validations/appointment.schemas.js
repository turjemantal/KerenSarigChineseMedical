"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAppointmentSchema = exports.createAppointmentSchema = void 0;
const Joi = require("joi");
const appointment_status_enum_1 = require("../../common/enums/appointment-status.enum");
const validation_constants_1 = require("../../common/constants/validation.constants");
exports.createAppointmentSchema = Joi.object({
    name: Joi.string().trim().min(validation_constants_1.NAME_MIN_LENGTH).max(validation_constants_1.NAME_MAX_LENGTH).optional(),
    phone: Joi.string().pattern(validation_constants_1.PHONE_REGEX).optional().messages({
        'string.pattern.base': 'מספר טלפון לא תקין (05X-XXXXXXX)',
    }),
    email: Joi.string().email({ tlds: { allow: false } }).optional().allow('').messages({
        'string.email': 'כתובת אימייל לא תקינה',
    }),
    treatment: Joi.string().max(validation_constants_1.TREATMENT_MAX_LENGTH).optional().allow(''),
    concern: Joi.string().trim().max(validation_constants_1.CONCERN_MAX_LENGTH).optional().allow(''),
    date: Joi.string().pattern(validation_constants_1.DATE_REGEX).required().messages({
        'string.pattern.base': 'תאריך לא תקין — נדרש פורמט YYYY-MM-DD',
        'any.required': 'תאריך הוא שדה חובה',
    }),
    time: Joi.string().pattern(validation_constants_1.TIME_REGEX).required().messages({
        'string.pattern.base': 'שעה לא תקינה — נדרש פורמט HH:MM',
        'any.required': 'שעה היא שדה חובה',
    }),
    notes: Joi.string().max(validation_constants_1.NOTES_MAX_LENGTH).optional().allow(''),
    source: Joi.string().max(validation_constants_1.SOURCE_MAX_LENGTH).optional().allow(''),
});
exports.updateAppointmentSchema = Joi.object({
    status: Joi.string()
        .valid(...Object.values(appointment_status_enum_1.AppointmentStatus))
        .optional()
        .messages({ 'any.only': 'סטטוס לא תקין' }),
    notes: Joi.string().max(validation_constants_1.NOTES_MAX_LENGTH).optional().allow(''),
});
//# sourceMappingURL=appointment.schemas.js.map
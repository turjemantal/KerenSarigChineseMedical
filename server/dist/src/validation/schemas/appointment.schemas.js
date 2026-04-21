"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAppointmentSchema = exports.createAppointmentSchema = void 0;
const Joi = require("joi");
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const ISRAELI_PHONE = /^05\d{8}$/;
exports.createAppointmentSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).optional(),
    phone: Joi.string().pattern(ISRAELI_PHONE).optional().messages({
        'string.pattern.base': 'מספר טלפון לא תקין (05X-XXXXXXX)',
    }),
    email: Joi.string().email({ tlds: { allow: false } }).optional().allow('').messages({
        'string.email': 'כתובת אימייל לא תקינה',
    }),
    treatment: Joi.string().max(100).optional().allow(''),
    concern: Joi.string().trim().max(500).optional().allow(''),
    date: Joi.string().pattern(DATE_REGEX).required().messages({
        'string.pattern.base': 'תאריך לא תקין — נדרש פורמט YYYY-MM-DD',
        'any.required': 'תאריך הוא שדה חובה',
    }),
    time: Joi.string().pattern(TIME_REGEX).required().messages({
        'string.pattern.base': 'שעה לא תקינה — נדרש פורמט HH:MM',
        'any.required': 'שעה היא שדה חובה',
    }),
    notes: Joi.string().max(1000).optional().allow(''),
    source: Joi.string().max(50).optional().allow(''),
});
exports.updateAppointmentSchema = Joi.object({
    status: Joi.string()
        .valid('pending', 'scheduled', 'completed', 'cancelled', 'noshow')
        .optional()
        .messages({ 'any.only': 'סטטוס לא תקין' }),
    notes: Joi.string().max(1000).optional().allow(''),
});
//# sourceMappingURL=appointment.schemas.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLeadSchema = exports.createLeadSchema = void 0;
const Joi = require("joi");
const ISRAELI_PHONE = /^05\d{8}$/;
exports.createLeadSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required().messages({
        'string.min': 'שם חייב להכיל לפחות 2 תווים',
        'string.max': 'שם לא יכול לעלות על 100 תווים',
        'any.required': 'שם הוא שדה חובה',
    }),
    phone: Joi.string().pattern(ISRAELI_PHONE).required().messages({
        'string.pattern.base': 'מספר טלפון לא תקין — אנא הזינו מספר ישראלי תקין (05X-XXXXXXX)',
        'any.required': 'טלפון הוא שדה חובה',
    }),
    email: Joi.string().email({ tlds: { allow: false } }).optional().allow('').messages({
        'string.email': 'כתובת אימייל לא תקינה',
    }),
    concern: Joi.string().trim().min(4).max(500).required().messages({
        'string.min': 'אנא תארו את הבעיה ב-4 תווים לפחות',
        'string.max': 'תיאור הבעיה לא יכול לעלות על 500 תווים',
        'any.required': 'תיאור הבעיה הוא שדה חובה',
    }),
    treatment: Joi.string().max(100).optional().allow(''),
    preferredDate: Joi.string().optional().allow(''),
    preferredTime: Joi.string().optional().allow(''),
    notes: Joi.string().max(1000).optional().allow(''),
    source: Joi.string().max(50).optional().allow(''),
});
exports.updateLeadSchema = Joi.object({
    status: Joi.string().valid('new', 'contacted', 'booked', 'closed').optional().messages({
        'any.only': 'סטטוס לא תקין',
    }),
    notes: Joi.string().max(1000).optional().allow(''),
});
//# sourceMappingURL=lead.schemas.js.map
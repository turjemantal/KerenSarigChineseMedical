"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLeadSchema = exports.createLeadSchema = void 0;
const Joi = require("joi");
const lead_status_enum_1 = require("../../common/enums/lead-status.enum");
const validation_constants_1 = require("../../common/constants/validation.constants");
exports.createLeadSchema = Joi.object({
    name: Joi.string().trim().min(validation_constants_1.NAME_MIN_LENGTH).max(validation_constants_1.NAME_MAX_LENGTH).required().messages({
        'string.min': 'שם חייב להכיל לפחות 2 תווים',
        'string.max': 'שם לא יכול לעלות על 100 תווים',
        'any.required': 'שם הוא שדה חובה',
    }),
    phone: Joi.string().pattern(validation_constants_1.PHONE_REGEX).required().messages({
        'string.pattern.base': 'מספר טלפון לא תקין — אנא הזינו מספר ישראלי תקין (05X-XXXXXXX)',
        'any.required': 'טלפון הוא שדה חובה',
    }),
    email: Joi.string().email({ tlds: { allow: false } }).optional().allow('').messages({
        'string.email': 'כתובת אימייל לא תקינה',
    }),
    concern: Joi.string().trim().min(validation_constants_1.CONCERN_MIN_LENGTH).max(validation_constants_1.CONCERN_MAX_LENGTH).required().messages({
        'string.min': 'אנא תארו את הבעיה ב-4 תווים לפחות',
        'string.max': 'תיאור הבעיה לא יכול לעלות על 500 תווים',
        'any.required': 'תיאור הבעיה הוא שדה חובה',
    }),
    treatment: Joi.string().max(validation_constants_1.TREATMENT_MAX_LENGTH).optional().allow(''),
    preferredDate: Joi.string().optional().allow(''),
    preferredTime: Joi.string().optional().allow(''),
    notes: Joi.string().max(validation_constants_1.NOTES_MAX_LENGTH).optional().allow(''),
    source: Joi.string().max(validation_constants_1.SOURCE_MAX_LENGTH).optional().allow(''),
});
exports.updateLeadSchema = Joi.object({
    status: Joi.string()
        .valid(...Object.values(lead_status_enum_1.LeadStatus))
        .optional()
        .messages({ 'any.only': 'סטטוס לא תקין' }),
    notes: Joi.string().max(validation_constants_1.NOTES_MAX_LENGTH).optional().allow(''),
});
//# sourceMappingURL=lead.schemas.js.map
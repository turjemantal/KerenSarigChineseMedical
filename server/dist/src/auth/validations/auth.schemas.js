"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNameSchema = exports.adminLoginSchema = exports.verifyOtpSchema = exports.requestOtpSchema = void 0;
const Joi = require("joi");
const validation_constants_1 = require("../../common/constants/validation.constants");
exports.requestOtpSchema = Joi.object({
    phone: Joi.string().pattern(validation_constants_1.PHONE_REGEX).required().messages({
        'string.pattern.base': 'מספר טלפון לא תקין — אנא הזינו מספר ישראלי תקין (05X-XXXXXXX)',
        'any.required': 'טלפון הוא שדה חובה',
    }),
});
exports.verifyOtpSchema = Joi.object({
    phone: Joi.string().pattern(validation_constants_1.PHONE_REGEX).required().messages({
        'string.pattern.base': 'מספר טלפון לא תקין',
        'any.required': 'טלפון הוא שדה חובה',
    }),
    code: Joi.string().length(validation_constants_1.OTP_CODE_LENGTH).pattern(/^\d+$/).required().messages({
        'string.length': `קוד האימות חייב להכיל ${validation_constants_1.OTP_CODE_LENGTH} ספרות`,
        'string.pattern.base': 'קוד האימות חייב להכיל ספרות בלבד',
        'any.required': 'קוד אימות הוא שדה חובה',
    }),
    name: Joi.string().trim().min(validation_constants_1.NAME_MIN_LENGTH).max(validation_constants_1.NAME_MAX_LENGTH).optional(),
});
exports.adminLoginSchema = Joi.object({
    password: Joi.string().required().messages({
        'any.required': 'סיסמה היא שדה חובה',
        'string.empty': 'סיסמה היא שדה חובה',
    }),
});
exports.updateNameSchema = Joi.object({
    name: Joi.string().trim().min(validation_constants_1.NAME_MIN_LENGTH).max(validation_constants_1.NAME_MAX_LENGTH).required().messages({
        'string.min': `שם חייב להכיל לפחות ${validation_constants_1.NAME_MIN_LENGTH} תווים`,
        'string.empty': 'שם הוא שדה חובה',
        'any.required': 'שם הוא שדה חובה',
    }),
});
//# sourceMappingURL=auth.schemas.js.map
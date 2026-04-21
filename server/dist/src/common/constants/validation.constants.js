"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTP_CODE_LENGTH = exports.TREATMENT_MAX_LENGTH = exports.SOURCE_MAX_LENGTH = exports.NOTES_MAX_LENGTH = exports.CONCERN_MAX_LENGTH = exports.CONCERN_MIN_LENGTH = exports.NAME_MAX_LENGTH = exports.NAME_MIN_LENGTH = exports.TIME_REGEX = exports.DATE_REGEX = exports.PHONE_REGEX = void 0;
exports.PHONE_REGEX = /^05\d{8}$/;
exports.DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
exports.TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
exports.NAME_MIN_LENGTH = 2;
exports.NAME_MAX_LENGTH = 100;
exports.CONCERN_MIN_LENGTH = 4;
exports.CONCERN_MAX_LENGTH = 500;
exports.NOTES_MAX_LENGTH = 1000;
exports.SOURCE_MAX_LENGTH = 50;
exports.TREATMENT_MAX_LENGTH = 100;
exports.OTP_CODE_LENGTH = 6;
//# sourceMappingURL=validation.constants.js.map
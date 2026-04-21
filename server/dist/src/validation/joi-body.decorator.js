"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JoiBody = void 0;
const common_1 = require("@nestjs/common");
const joi_validation_guard_1 = require("./joi-validation.guard");
const JoiBody = (schema) => (0, common_1.applyDecorators)((0, common_1.SetMetadata)(joi_validation_guard_1.JOI_SCHEMA_KEY, schema), (0, common_1.UseGuards)(joi_validation_guard_1.JoiValidationGuard));
exports.JoiBody = JoiBody;
//# sourceMappingURL=joi-body.decorator.js.map
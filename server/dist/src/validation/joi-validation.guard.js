"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JoiValidationGuard = exports.JOI_SCHEMA_KEY = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
exports.JOI_SCHEMA_KEY = 'joi_schema';
let JoiValidationGuard = class JoiValidationGuard {
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const schema = this.reflector.get(exports.JOI_SCHEMA_KEY, context.getHandler());
        if (!schema)
            return true;
        const req = context.switchToHttp().getRequest();
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            allowUnknown: false,
            stripUnknown: true,
        });
        if (error) {
            throw new common_1.BadRequestException(error.details.map(d => d.message).join('; '));
        }
        req.body = value;
        return true;
    }
};
exports.JoiValidationGuard = JoiValidationGuard;
exports.JoiValidationGuard = JoiValidationGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], JoiValidationGuard);
//# sourceMappingURL=joi-validation.guard.js.map
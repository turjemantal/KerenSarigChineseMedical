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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const otp_schema_1 = require("./otp.schema");
const clients_service_1 = require("../clients/clients.service");
const otp_constants_1 = require("../common/constants/otp.constants");
const jwt_constants_1 = require("../common/constants/jwt.constants");
let AuthService = class AuthService {
    constructor(otpModel, jwtService, clientsService) {
        this.otpModel = otpModel;
        this.jwtService = jwtService;
        this.clientsService = clientsService;
    }
    async requestOtp(phone) {
        const code = Math.floor(otp_constants_1.OTP_CODE_MIN + Math.random() * otp_constants_1.OTP_CODE_RANGE).toString();
        await this.otpModel.deleteMany({ phone });
        await this.otpModel.create({ phone, code });
        console.log(`[OTP] ${phone} → ${code}`);
        return { message: 'OTP sent' };
    }
    async updateName(phone, name) {
        const client = await this.clientsService.updateName(phone, name);
        if (!client)
            throw new common_1.BadRequestException('Client not found');
        const token = this.jwtService.sign({ sub: String(client._id), phone: client.phone, name: client.name });
        return { token, client: { _id: client._id, phone: client.phone, name: client.name, email: client.email } };
    }
    async adminLogin(password) {
        const expected = process.env.ADMIN_PASSWORD;
        if (!expected || password !== expected)
            throw new common_1.UnauthorizedException('סיסמה שגויה');
        const token = this.jwtService.sign({ sub: 'admin', role: 'admin' }, { expiresIn: jwt_constants_1.JWT_ADMIN_EXPIRY });
        return { token };
    }
    async verifyOtp(phone, code, name) {
        const otp = await this.otpModel.findOne({ phone, code }).exec();
        if (!otp || otp.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Invalid or expired OTP');
        }
        await this.otpModel.deleteMany({ phone });
        const client = await this.clientsService.findOrCreate(phone, name);
        const token = this.jwtService.sign({
            sub: String(client._id),
            phone: client.phone,
            name: client.name,
        });
        return {
            token,
            client: {
                _id: client._id,
                phone: client.phone,
                name: client.name,
                email: client.email,
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(otp_schema_1.Otp.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        jwt_1.JwtService,
        clients_service_1.ClientsService])
], AuthService);
//# sourceMappingURL=auth.service.js.map
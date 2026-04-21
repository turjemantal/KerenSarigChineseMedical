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
exports.ClientsService = void 0;
const common_1 = require("@nestjs/common");
const clients_dao_1 = require("./clients.dao");
let ClientsService = class ClientsService {
    constructor(dao) {
        this.dao = dao;
    }
    findByPhone(phone) {
        return this.dao.findByPhone(phone);
    }
    async findOrCreate(phone, name) {
        const existing = await this.dao.findByPhone(phone);
        if (existing) {
            if (name && !existing.name)
                await this.dao.update(phone, name);
            return existing;
        }
        return this.dao.create(phone, name);
    }
    updateName(phone, name) {
        return this.dao.update(phone, name);
    }
};
exports.ClientsService = ClientsService;
exports.ClientsService = ClientsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [clients_dao_1.ClientsDao])
], ClientsService);
//# sourceMappingURL=clients.service.js.map
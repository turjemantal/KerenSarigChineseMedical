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
exports.LeadsService = void 0;
const common_1 = require("@nestjs/common");
const leads_dao_1 = require("./leads.dao");
let LeadsService = class LeadsService {
    constructor(leadsDao) {
        this.leadsDao = leadsDao;
    }
    create(dto) {
        return this.leadsDao.create(dto);
    }
    findAll() {
        return this.leadsDao.findAll();
    }
    async findById(id) {
        const lead = await this.leadsDao.findById(id);
        if (!lead)
            throw new common_1.NotFoundException(`Lead ${id} not found`);
        return lead;
    }
    async update(id, dto) {
        const lead = await this.leadsDao.update(id, dto);
        if (!lead)
            throw new common_1.NotFoundException(`Lead ${id} not found`);
        return lead;
    }
    async delete(id) {
        const lead = await this.leadsDao.delete(id);
        if (!lead)
            throw new common_1.NotFoundException(`Lead ${id} not found`);
    }
};
exports.LeadsService = LeadsService;
exports.LeadsService = LeadsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [leads_dao_1.LeadsDao])
], LeadsService);
//# sourceMappingURL=leads.service.js.map
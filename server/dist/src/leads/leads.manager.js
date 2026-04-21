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
exports.LeadsManager = void 0;
const common_1 = require("@nestjs/common");
const leads_service_1 = require("./leads.service");
let LeadsManager = class LeadsManager {
    constructor(leadsService) {
        this.leadsService = leadsService;
    }
    async submitLead(dto) {
        const lead = await this.leadsService.create(dto);
        return lead;
    }
    getAll() {
        return this.leadsService.findAll();
    }
    getById(id) {
        return this.leadsService.findById(id);
    }
    updateStatus(id, dto) {
        return this.leadsService.update(id, dto);
    }
    remove(id) {
        return this.leadsService.delete(id);
    }
};
exports.LeadsManager = LeadsManager;
exports.LeadsManager = LeadsManager = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [leads_service_1.LeadsService])
], LeadsManager);
//# sourceMappingURL=leads.manager.js.map
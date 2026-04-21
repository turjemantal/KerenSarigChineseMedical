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
exports.AppointmentsService = void 0;
const common_1 = require("@nestjs/common");
const appointments_dao_1 = require("./appointments.dao");
let AppointmentsService = class AppointmentsService {
    constructor(dao) {
        this.dao = dao;
    }
    create(dto) {
        return this.dao.create(dto);
    }
    findAll() {
        return this.dao.findAll();
    }
    findByDate(date) {
        return this.dao.findByDate(date);
    }
    findByPhone(phone) {
        return this.dao.findByPhone(phone);
    }
    async findById(id) {
        const appt = await this.dao.findById(id);
        if (!appt)
            throw new common_1.NotFoundException(`Appointment ${id} not found`);
        return appt;
    }
    async update(id, dto) {
        const appt = await this.dao.update(id, dto);
        if (!appt)
            throw new common_1.NotFoundException(`Appointment ${id} not found`);
        return appt;
    }
    async delete(id) {
        const appt = await this.dao.delete(id);
        if (!appt)
            throw new common_1.NotFoundException(`Appointment ${id} not found`);
    }
};
exports.AppointmentsService = AppointmentsService;
exports.AppointmentsService = AppointmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [appointments_dao_1.AppointmentsDao])
], AppointmentsService);
//# sourceMappingURL=appointments.service.js.map
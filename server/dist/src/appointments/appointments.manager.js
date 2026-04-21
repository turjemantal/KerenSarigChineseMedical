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
exports.AppointmentsManager = void 0;
const common_1 = require("@nestjs/common");
const appointments_service_1 = require("./appointments.service");
let AppointmentsManager = class AppointmentsManager {
    constructor(service) {
        this.service = service;
    }
    async book(dto) {
        const appt = await this.service.create(dto);
        return appt;
    }
    getAll() {
        return this.service.findAll();
    }
    getAvailability(date) {
        return this.service.findByDate(date).then(appts => appts.map(a => a.time));
    }
    getByPhone(phone) {
        return this.service.findByPhone(phone);
    }
    getById(id) {
        return this.service.findById(id);
    }
    update(id, dto) {
        return this.service.update(id, dto);
    }
    remove(id) {
        return this.service.delete(id);
    }
};
exports.AppointmentsManager = AppointmentsManager;
exports.AppointmentsManager = AppointmentsManager = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [appointments_service_1.AppointmentsService])
], AppointmentsManager);
//# sourceMappingURL=appointments.manager.js.map
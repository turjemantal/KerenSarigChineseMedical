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
exports.AppointmentsDao = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const appointment_schema_1 = require("./appointment.schema");
let AppointmentsDao = class AppointmentsDao {
    constructor(model) {
        this.model = model;
    }
    create(dto) {
        return this.model.create(dto);
    }
    findAll() {
        return this.model.find().sort({ date: 1, time: 1 }).exec();
    }
    findByDate(date) {
        return this.model.find({ date, status: { $ne: 'cancelled' } }).exec();
    }
    findByPhone(phone) {
        return this.model.find({ phone }).sort({ date: 1, time: 1 }).exec();
    }
    findById(id) {
        return this.model.findById(id).exec();
    }
    update(id, dto) {
        return this.model.findByIdAndUpdate(id, dto, { new: true }).exec();
    }
    delete(id) {
        return this.model.findByIdAndDelete(id).exec();
    }
};
exports.AppointmentsDao = AppointmentsDao;
exports.AppointmentsDao = AppointmentsDao = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(appointment_schema_1.Appointment.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], AppointmentsDao);
//# sourceMappingURL=appointments.dao.js.map
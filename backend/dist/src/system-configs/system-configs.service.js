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
exports.SystemConfigsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const system_config_entity_1 = require("./system-config.entity");
let SystemConfigsService = class SystemConfigsService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async onModuleInit() {
        await this.repo.query(`CREATE TABLE IF NOT EXISTS system_configs (key TEXT PRIMARY KEY, value TEXT NOT NULL)`);
        const minOrder = await this.repo.findOne({ where: { key: 'min_order_amount' } });
        if (!minOrder) {
            await this.repo.save({ key: 'min_order_amount', value: '500' });
            console.log('[CONFIG] Seeded default min_order_amount = 500');
        }
    }
    async get(key, defaultValue = '') {
        const config = await this.repo.findOne({ where: { key } });
        return config ? config.value : defaultValue;
    }
    async update(key, value) {
        let config = await this.repo.findOne({ where: { key } });
        if (config) {
            config.value = value;
        }
        else {
            config = this.repo.create({ key, value });
        }
        return this.repo.save(config);
    }
};
exports.SystemConfigsService = SystemConfigsService;
exports.SystemConfigsService = SystemConfigsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(system_config_entity_1.SystemConfig)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SystemConfigsService);
//# sourceMappingURL=system-configs.service.js.map
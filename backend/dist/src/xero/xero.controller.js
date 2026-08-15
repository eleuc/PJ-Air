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
exports.XeroController = void 0;
const common_1 = require("@nestjs/common");
const xero_service_1 = require("./xero.service");
let XeroController = class XeroController {
    xeroService;
    constructor(xeroService) {
        this.xeroService = xeroService;
    }
    async connect(res) {
        const url = await this.xeroService.getXeroAuthUrl();
        return res.redirect(url);
    }
    async callback(code, res) {
        if (code) {
            await this.xeroService.handleCallback(code);
        }
        const frontendUrl = process.env.FRONTEND_URL || 'https://testing.jhoanes.com';
        return res.redirect(`${frontendUrl}/produccion/settings`);
    }
    async syncOrder(orderId) {
        return this.xeroService.syncOrderToXero(orderId);
    }
    async syncBatch() {
        return this.xeroService.syncPendingPaidOrders();
    }
};
exports.XeroController = XeroController;
__decorate([
    (0, common_1.Get)('connect'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], XeroController.prototype, "connect", null);
__decorate([
    (0, common_1.Get)('callback'),
    __param(0, (0, common_1.Query)('code')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], XeroController.prototype, "callback", null);
__decorate([
    (0, common_1.Post)('sync/:orderId'),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], XeroController.prototype, "syncOrder", null);
__decorate([
    (0, common_1.Post)('sync-batch'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], XeroController.prototype, "syncBatch", null);
exports.XeroController = XeroController = __decorate([
    (0, common_1.Controller)('xero'),
    __metadata("design:paramtypes", [xero_service_1.XeroService])
], XeroController);
//# sourceMappingURL=xero.controller.js.map
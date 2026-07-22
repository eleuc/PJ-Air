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
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const payments_service_1 = require("./payments.service");
const create_payment_intent_dto_1 = require("./dto/create-payment-intent.dto");
const auth_guard_1 = require("../auth/auth.guard");
let PaymentsController = class PaymentsController {
    paymentsService;
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    async getPaymentStats(req) {
        if (!req.user || req.user.role !== 'admin') {
            throw new common_1.ForbiddenException('Solo los administradores pueden ver reportes financieros');
        }
        return this.paymentsService.getPaymentStats();
    }
    async createPaymentIntent(dto) {
        if (!dto.orderId) {
            throw new common_1.BadRequestException('orderId is required');
        }
        return this.paymentsService.createPaymentIntent(dto.orderId);
    }
    async mockConfirmStripePayment(body) {
        if (!body.orderId) {
            throw new common_1.BadRequestException('orderId is required');
        }
        return this.paymentsService.mockConfirmStripePayment(body.orderId);
    }
    async capturePayPalPayment(body) {
        if (!body.orderId || !body.transactionId) {
            throw new common_1.BadRequestException('orderId and transactionId are required');
        }
        return this.paymentsService.capturePayPalPayment(body.orderId, body.transactionId);
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Get)('stats'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getPaymentStats", null);
__decorate([
    (0, common_1.Post)('stripe/create-intent'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_payment_intent_dto_1.CreatePaymentIntentDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createPaymentIntent", null);
__decorate([
    (0, common_1.Post)('stripe/mock-confirm'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "mockConfirmStripePayment", null);
__decorate([
    (0, common_1.Post)('paypal/capture'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "capturePayPalPayment", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map
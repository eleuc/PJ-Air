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
exports.WebhooksController = void 0;
const common_1 = require("@nestjs/common");
const payments_service_1 = require("./payments.service");
let WebhooksController = class WebhooksController {
    paymentsService;
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    async handleStripeWebhook(signature, req) {
        if (!signature) {
            throw new common_1.BadRequestException('stripe-signature header is missing');
        }
        const rawBody = req.rawBody;
        if (!rawBody) {
            throw new common_1.BadRequestException('rawBody is missing from request');
        }
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_mock_webhook_secret_please_change_me_in_env_file';
        await this.paymentsService.handleStripeWebhook(rawBody, signature, webhookSecret);
        return { received: true };
    }
};
exports.WebhooksController = WebhooksController;
__decorate([
    (0, common_1.Post)('stripe'),
    __param(0, (0, common_1.Headers)('stripe-signature')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "handleStripeWebhook", null);
exports.WebhooksController = WebhooksController = __decorate([
    (0, common_1.Controller)('payments/webhook'),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], WebhooksController);
//# sourceMappingURL=webhooks.controller.js.map
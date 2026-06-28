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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("./order.entity");
const order_item_entity_1 = require("./order-item.entity");
let OrdersService = class OrdersService {
    orderRepository;
    orderItemRepository;
    constructor(orderRepository, orderItemRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
    }
    async findInRange(startDate, endDate, userId) {
        const qb = this.orderRepository.createQueryBuilder('order')
            .leftJoinAndSelect('order.items', 'items')
            .leftJoinAndSelect('items.product', 'product')
            .leftJoinAndSelect('order.user', 'user')
            .leftJoinAndSelect('user.profile', 'profile')
            .where('order.created_at >= :start', { start: startDate })
            .andWhere('order.created_at <= :end', { end: endDate });
        if (userId) {
            qb.andWhere('order.user_id = :userId', { userId });
        }
        return qb.orderBy('order.created_at', 'DESC').getMany();
    }
    async findAll() {
        return this.orderRepository.find({
            relations: ['items', 'items.product', 'user', 'user.profile', 'delivery_user', 'delivery_user.profile', 'address'],
            order: { created_at: 'DESC' }
        });
    }
    async findByUser(userId) {
        return this.orderRepository.find({
            where: { user_id: userId },
            relations: ['items', 'items.product', 'address'],
            order: { created_at: 'DESC' }
        });
    }
    async findOne(id) {
        const order = await this.orderRepository.findOne({
            where: { id },
            relations: ['items', 'items.product', 'user', 'user.profile', 'delivery_user', 'delivery_user.profile', 'address']
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return order;
    }
    async create(userId, orderData) {
        const { items, ...rest } = orderData;
        const { deliveryDate, paymentDueDate, addressId, deliveryType, deliveryAddressText, ...otherData } = rest;
        const orderToCreate = this.orderRepository.create({
            ...otherData,
            delivery_date: deliveryDate,
            payment_due_date: paymentDueDate,
            address_id: addressId || null,
            delivery_type: deliveryType || 'saved',
            delivery_address_text: deliveryAddressText || null,
            user_id: userId,
        });
        const savedResult = await this.orderRepository.save(orderToCreate);
        const savedOrder = Array.isArray(savedResult) ? savedResult[0] : savedResult;
        if (items && items.length > 0) {
            const orderItems = items.map((item) => this.orderItemRepository.create({
                product_id: item.productId,
                price_at_time: item.price,
                quantity: item.quantity,
                order_id: savedOrder.id,
            }));
            await this.orderItemRepository.save(orderItems);
        }
        return this.findOne(savedOrder.id);
    }
    async updateStatus(id, status) {
        const order = await this.findOne(id);
        order.status = status;
        return this.orderRepository.save(order);
    }
    async assignDelivery(id, deliveryUserId) {
        const order = await this.findOne(id);
        order.delivery_user_id = deliveryUserId;
        return this.orderRepository.save(order);
    }
    async update(id, updateData) {
        const order = await this.findOne(id);
        const { status, total, delivery_date, address_id, motivo, items } = updateData;
        if (motivo) {
            const originalLines = (order.items || []).map(item => `${item.quantity} Unidades de ${item.product?.name || 'Producto'}, precio unitario: ${item.price_at_time}, subtotal: ${(item.quantity * item.price_at_time).toFixed(2)}`).join('; ');
            const auditLog = `El pedido ha sido modificado por: ${motivo}, pedido original: ${originalLines}, total original: ${Number(order.total || 0).toFixed(2)}. Modificado el ${new Date().toLocaleString('es-ES')}.\n`;
            order.notes = auditLog + (order.notes || '');
        }
        if (status)
            order.status = status;
        if (total !== undefined)
            order.total = total;
        if (delivery_date)
            order.delivery_date = delivery_date;
        if (address_id)
            order.address_id = address_id;
        if (items && Array.isArray(items)) {
            order.items = [];
            await this.orderItemRepository.delete({ order_id: id });
            const newItems = items.map((item) => this.orderItemRepository.create({
                product_id: item.product_id || item.productId,
                price_at_time: item.price_at_time || item.price,
                quantity: item.quantity,
                order_id: id,
            }));
            order.items = await this.orderItemRepository.save(newItems);
        }
        await this.orderRepository.save(order);
        return this.findOne(id);
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(order_item_entity_1.OrderItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], OrdersService);
//# sourceMappingURL=orders.service.js.map
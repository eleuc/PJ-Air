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
exports.DevtoolsService = void 0;
const common_1 = require("@nestjs/common");
const products_service_1 = require("../products/products.service");
const users_service_1 = require("../users/users.service");
const orders_service_1 = require("../orders/orders.service");
const addresses_service_1 = require("../addresses/addresses.service");
const products_seed_1 = require("./products.seed");
let DevtoolsService = class DevtoolsService {
    productsService;
    usersService;
    ordersService;
    addressesService;
    constructor(productsService, usersService, ordersService, addressesService) {
        this.productsService = productsService;
        this.usersService = usersService;
        this.ordersService = ordersService;
        this.addressesService = addressesService;
    }
    async seedProducts() {
        return this.productsService.syncLocalProducts(products_seed_1.SEED_PRODUCTS);
    }
    async seedAdmin() {
        const ADMIN_EMAIL = 'admin@test.com';
        const existing = await this.usersService.findByEmail(ADMIN_EMAIL);
        if (existing) {
            return { message: 'Admin already exists', email: existing.email };
        }
        const user = await this.usersService.create({
            email: ADMIN_EMAIL,
            password: '123123',
            role: 'admin',
        });
        const newUser = Array.isArray(user) ? user[0] : user;
        await this.usersService.createProfile({
            id: newUser.id,
            full_name: 'Administrador',
            username: 'admin',
        });
        await this.usersService.updateRole(newUser.id, 'admin');
        return { message: 'Admin created successfully', email: ADMIN_EMAIL };
    }
    async seedReports() {
        console.log('--- START SEED REPORTS (30 DAYS) ---');
        const allProducts = await this.productsService.findAll();
        const createdClients = [];
        for (let i = 1; i <= 20; i++) {
            const name = `Client ${i}`;
            const email = `client${i}@test.com`;
            let user = await this.usersService.findByEmail(email);
            if (!user) {
                console.log(`Creating user: ${email}`);
                user = await this.usersService.create({
                    email,
                    password: '123123',
                    role: 'client'
                });
                const newUser = Array.isArray(user) ? user[0] : user;
                await this.usersService.createProfile({
                    id: newUser.id,
                    full_name: name,
                    username: `client_${i}`,
                    company_name: `Company ${i}`
                });
                user = newUser;
            }
            let numAddr = 1;
            if (i > 12 && i <= 16)
                numAddr = 2;
            if (i > 16)
                numAddr = 3 + (i % 2);
            const existingAddr = await this.addressesService.addressRepository.find({ where: { user_id: user.id } });
            if (existingAddr.length < numAddr) {
                for (let a = existingAddr.length; a < numAddr; a++) {
                    await this.addressesService.addressRepository.save({
                        user_id: user.id,
                        alias: `Address ${a + 1}`,
                        address: `Test Street ${a + 1}, Zip ${1000 + i}`,
                        city: 'Sample City',
                        is_default: a === 0
                    });
                }
            }
            createdClients.push(user);
        }
        const ordersCreatedCount = 0;
        const deliveryTypes = ['pickup', 'saved', 'other'];
        for (const client of createdClients) {
            console.log(`Seeding orders for client: ${client.email}`);
            let currentDate = new Date();
            currentDate.setDate(currentDate.getDate() - 30);
            const today = new Date();
            while (currentDate <= today) {
                let orderTotal = 0;
                const items = [];
                let totalQty = 0;
                const targetUnits = 6 + Math.floor(Math.random() * 25);
                let attempts = 0;
                while ((orderTotal < 500 || totalQty < targetUnits) && attempts < 10) {
                    const prod = allProducts[Math.floor(Math.random() * allProducts.length)];
                    const qty = Math.max(1, Math.floor(targetUnits / 3));
                    items.push({
                        product_id: prod.id,
                        price_at_time: prod.price,
                        quantity: qty
                    });
                    orderTotal += prod.price * qty;
                    totalQty += qty;
                    attempts++;
                }
                if (orderTotal > 1200) { }
                const deliveryType = deliveryTypes[Math.floor(Math.random() * deliveryTypes.length)];
                const order = this.ordersService.orderRepository.create({
                    user_id: client.id,
                    total: orderTotal,
                    status: 'delivered',
                    created_at: new Date(currentDate),
                    delivery_date: currentDate.toISOString().split('T')[0],
                    delivery_type: deliveryType,
                    delivery_address_text: deliveryType === 'other' ? 'Historical Temporary Addr' : null
                });
                const savedOrder = await this.ordersService.orderRepository.save(order);
                const orderItems = items.map(it => this.ordersService.orderItemRepository.create({
                    ...it,
                    order_id: savedOrder.id
                }));
                await this.ordersService.orderItemRepository.save(orderItems);
                const gap = 2 + Math.floor(Math.random() * 2);
                currentDate.setDate(currentDate.getDate() + gap);
            }
        }
        console.log('--- SEED REPORTS COMPLETED ---');
        return { message: 'Seed reports completed with specific business rules', clients: createdClients.length };
    }
};
exports.DevtoolsService = DevtoolsService;
exports.DevtoolsService = DevtoolsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [products_service_1.ProductsService,
        users_service_1.UsersService,
        orders_service_1.OrdersService,
        addresses_service_1.AddressesService])
], DevtoolsService);
//# sourceMappingURL=devtools.service.js.map
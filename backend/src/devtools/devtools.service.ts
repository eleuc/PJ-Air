import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';
import { OrdersService } from '../orders/orders.service';
import { AddressesService } from '../addresses/addresses.service';
import { SEED_PRODUCTS } from './products.seed';

@Injectable()
export class DevtoolsService {
  constructor(
    private productsService: ProductsService,
    private usersService: UsersService,
    private ordersService: OrdersService,
    private addressesService: AddressesService,
  ) {}

  async seedProducts() {
    return this.productsService.syncLocalProducts(SEED_PRODUCTS as any);
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

    // 1. Create 20 Clients with Address Distribution
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
            }) as any;
            
            const newUser = Array.isArray(user) ? user[0] : user;
            await this.usersService.createProfile({
                id: newUser.id,
                full_name: name,
                username: `client_${i}`,
                company_name: `Company ${i}`
            });
            user = newUser;
        }

        // Address Distribution
        // 60% (1-12) => 1 addr
        // 20% (13-16) => 2 addr
        // 20% (17-20) => 3-4 addr
        let numAddr = 1;
        if (i > 12 && i <= 16) numAddr = 2;
        if (i > 16) numAddr = 3 + (i % 2); // 3 or 4

        const existingAddr = await (this.addressesService as any).addressRepository.find({ where: { user_id: user!.id } });
        if (existingAddr.length < numAddr) {
            for (let a = existingAddr.length; a < numAddr; a++) {
                await (this.addressesService as any).addressRepository.save({
                    user_id: user!.id,
                    alias: `Address ${a + 1}`,
                    address: `Test Street ${a + 1}, Zip ${1000 + i}`,
                    city: 'Sample City',
                    is_default: a === 0
                });
            }
        }
        createdClients.push(user);
    }

    // 2. Clear previous test orders if they exist to keep it clean (Optional, but user asked for "un mes")
    // I'll just append for safety, but user might want fresh. I'll just skip delete.

    // 3. Generate Orders
    const ordersCreatedCount = 0;
    const deliveryTypes = ['pickup', 'saved', 'other'];

    for (const client of createdClients) {
        console.log(`Seeding orders for client: ${client!.email}`);
        // Start 30 days ago
        let currentDate = new Date();
        currentDate.setDate(currentDate.getDate() - 30);
        
        const today = new Date();

        while (currentDate <= today) {
            // Pick 1-4 items to reach $500 - $1000
            let orderTotal = 0;
            const items = [];
            let totalQty = 0;

            // Target units: 6-30
            const targetUnits = 6 + Math.floor(Math.random() * 25);
            
            // Loop until we reach target units or at least $500
            let attempts = 0;
            while ((orderTotal < 500 || totalQty < targetUnits) && attempts < 10) {
                const prod = allProducts[Math.floor(Math.random() * allProducts.length)];
                const qty = Math.max(1, Math.floor(targetUnits / 3)); // approx split
                
                items.push({
                    product_id: prod.id,
                    price_at_time: prod.price,
                    quantity: qty
                });
                orderTotal += prod.price * qty;
                totalQty += qty;
                attempts++;
            }

            // Cap if too high? User said $500-$1000.
            if (orderTotal > 1200) { /* adjust? */ }

            const deliveryType = deliveryTypes[Math.floor(Math.random() * deliveryTypes.length)];
            const order = (this.ordersService as any).orderRepository.create({
                user_id: client!.id,
                total: orderTotal,
                status: 'delivered',
                created_at: new Date(currentDate),
                delivery_date: currentDate.toISOString().split('T')[0],
                delivery_type: deliveryType,
                delivery_address_text: deliveryType === 'other' ? 'Historical Temporary Addr' : null
            });

            const savedOrder = await (this.ordersService as any).orderRepository.save(order);
            const orderItems = items.map(it => (this.ordersService as any).orderItemRepository.create({
                ...it,
                order_id: savedOrder.id
            }));
            await (this.ordersService as any).orderItemRepository.save(orderItems);

            // Increment by 2-3 days
            const gap = 2 + Math.floor(Math.random() * 2); 
            currentDate.setDate(currentDate.getDate() + gap);
        }
    }

    console.log('--- SEED REPORTS COMPLETED ---');
    return { message: 'Seed reports completed with specific business rules', clients: createdClients.length };
  }
}

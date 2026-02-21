import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class OrdersService {
    constructor(private supabaseService: SupabaseService) { }

    async create(orderData: { user_id: string; address_id: number; items: any[] }) {
        const now = new Date();
        const isBefore1PM = now.getHours() < 13;
        const daysToAdd = isBefore1PM ? 3 : 4;

        const deliveryDate = new Date();
        deliveryDate.setDate(now.getDate() + daysToAdd);

        // Calculate total price
        let total = 0;
        for (const item of orderData.items) {
            const { data: product } = await this.supabaseService.getClient()
                .from('products')
                .select('price')
                .eq('id', item.product_id)
                .single();

            if (product) {
                total += product.price * item.quantity;
            }
        }

        // Insert Order
        const { data: order, error: orderError } = await this.supabaseService.getClient()
            .from('orders')
            .insert({
                user_id: orderData.user_id,
                address_id: orderData.address_id,
                total_price: total,
                delivery_date: deliveryDate.toISOString().split('T')[0],
                status: 'Pedido'
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // Insert Order Items
        const orderItems = orderData.items.map(item => ({
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: 0 // In real scenario, fetch current price again
        }));

        const { error: itemsError } = await this.supabaseService.getClient()
            .from('order_items')
            .insert(orderItems);

        if (itemsError) throw itemsError;

        return order;
    }

    async setDelivered(orderId: number) {
        const deliveryDate = new Date();
        const paymentDate = new Date(deliveryDate);
        paymentDate.setDate(deliveryDate.getDate() + 6);

        const { data, error } = await this.supabaseService.getClient()
            .from('orders')
            .update({
                status: 'Entregado',
                payment_date: paymentDate.toISOString().split('T')[0]
            })
            .eq('id', orderId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async findAll() {
        const { data, error } = await this.supabaseService.getClient()
            .from('orders')
            .select('*, users(full_name), addresses(*)');
        if (error) throw error;
        return data;
    }

    async findByUser(userId: string) {
        const { data, error } = await this.supabaseService.getClient()
            .from('orders')
            .select('*')
            .eq('user_id', userId);
        if (error) throw error;
        return data;
    }
}

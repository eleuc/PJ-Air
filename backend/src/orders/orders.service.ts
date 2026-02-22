import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
  ) {}

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({ 
      relations: ['items', 'items.product', 'user', 'user.profile', 'delivery_user', 'delivery_user.profile'],
      order: { created_at: 'DESC' }
    });
  }

  async findByUser(userId: string): Promise<Order[]> {
    return this.orderRepository.find({ 
      where: { user_id: userId },
      relations: ['items', 'items.product', 'address'],
      order: { created_at: 'DESC' }
    });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({ 
      where: { id },
      relations: ['items', 'items.product', 'user', 'user.profile', 'delivery_user', 'delivery_user.profile', 'address']
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async create(userId: string, orderData: any): Promise<Order> {
    const { items, ...rest } = orderData;
    
    const { deliveryDate, paymentDueDate, addressId, ...otherData } = rest;
    
    const orderToCreate = this.orderRepository.create({
      ...otherData,
      delivery_date: deliveryDate,
      payment_due_date: paymentDueDate,
      address_id: addressId,
      user_id: userId,
    });
    
    const savedResult = await this.orderRepository.save(orderToCreate);
    const savedOrder = Array.isArray(savedResult) ? savedResult[0] : savedResult;

    if (items && items.length > 0) {
      const orderItems = items.map((item: any) => 
        this.orderItemRepository.create({
          product_id: item.productId,
          price_at_time: item.price,
          quantity: item.quantity,
          order_id: savedOrder.id,
        })
      );
      await this.orderItemRepository.save(orderItems);
    }

    return this.findOne(savedOrder.id);
  }

  async updateStatus(id: string, status: string): Promise<Order> {
    const order = await this.findOne(id);
    order.status = status;
    return this.orderRepository.save(order);
  }

  async assignDelivery(id: string, deliveryUserId: string): Promise<Order> {
    const order = await this.findOne(id);
    order.delivery_user_id = deliveryUserId;
    if (order.status === 'pending' || order.status === 'Pedido') {
      order.status = 'En Entrega';
    }
    return this.orderRepository.save(order);
  }

  async update(id: string, updateData: any): Promise<Order> {
    const order = await this.findOne(id);
    const { status, total, delivery_date, address_id, motivo, items } = updateData;
    
    // Si hay motivo, registramos el cambio en notas
    if (motivo) {
      const originalLines = (order.items || []).map(item => 
        `${item.quantity} Unidades de ${item.product?.name || 'Producto'}, precio unitario: ${item.price_at_time}, subtotal: ${(item.quantity * item.price_at_time).toFixed(2)}`
      ).join('; ');
      
      const auditLog = `El pedido ha sido modificado por: ${motivo}, pedido original: ${originalLines}, total original: ${Number(order.total || 0).toFixed(2)}. Modificado el ${new Date().toLocaleString('es-ES')}.\n`;
      
      order.notes = auditLog + (order.notes || '');
    }

    if (status) order.status = status;
    if (total !== undefined) order.total = total;
    if (delivery_date) order.delivery_date = delivery_date;
    if (address_id) order.address_id = address_id;
    
    // Si vienen nuevos items, actualizamos la tabla de items
    if (items && Array.isArray(items)) {
      // Importante: Limpiar la relación en memoria para evitar que TypeORM intente actualizar los antiguos
      order.items = [];
      
      // Borramos los items anteriores físicamente
      await this.orderItemRepository.delete({ order_id: id });
      
      // Creamos los nuevos items
      const newItems = items.map((item: any) => 
        this.orderItemRepository.create({
          product_id: item.product_id || item.productId,
          price_at_time: item.price_at_time || item.price,
          quantity: item.quantity,
          order_id: id,
        })
      );
      
      // Los guardamos y los asignamos al objeto order
      order.items = await this.orderItemRepository.save(newItems);
    }
    
    await this.orderRepository.save(order);
    return this.findOne(id);
  }
}

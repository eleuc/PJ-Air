import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Product } from '../products/product.entity';

@Entity('product_discounts')
export class ProductDiscount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  product_id: string;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  discount_percentage: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  special_price: number;

  @ManyToOne(() => User, (user) => user.productDiscounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}

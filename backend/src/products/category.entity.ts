import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Product } from './product.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  name_en: string;

  @Column({ default: 1 })
  min_qty: number;

  @Column({ default: true })
  is_active: boolean;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}

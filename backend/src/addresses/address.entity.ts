import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  alias: string;

  @Column()
  address: string;

  @Column({ nullable: true })
  zone: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  city: string;

  @Column('double precision', { nullable: true })
  lat: number;

  @Column('double precision', { nullable: true })
  lng: number;

  @Column('double precision', { nullable: true })
  refined_lat: number;

  @Column('double precision', { nullable: true })
  refined_lng: number;

  @Column({ default: false })
  is_default: boolean;

  @ManyToOne(() => User, (user) => user.addresses)
  @JoinColumn({ name: 'user_id' })
  user: User;
}

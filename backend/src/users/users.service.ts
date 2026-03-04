import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Profile } from './profile.entity';
import { ProductDiscount } from './product-discount.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    @InjectRepository(ProductDiscount)
    private productDiscountRepository: Repository<ProductDiscount>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find({ relations: ['profile', 'addresses', 'orders'] });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ 
      where: { id },
      relations: ['profile', 'addresses', 'orders', 'orders.items', 'orders.items.product', 'productDiscounts', 'productDiscounts.product'] 
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, profileData: Partial<Profile>): Promise<Profile> {
    const profile = await this.profileRepository.findOne({ where: { id: userId } });
    if (!profile) {
      // If profile doesn't exist, create it
      const newProfile = this.profileRepository.create({ ...profileData, id: userId });
      return this.profileRepository.save(newProfile);
    }
    
    Object.assign(profile, profileData);
    return this.profileRepository.save(profile);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ 
      where: { email },
      select: ['id', 'email', 'password', 'role'],
      relations: ['profile']
    });
  }

  async findByIdentifier(identifier: string): Promise<User | null> {
    // Check email
    const userByEmail = await this.findByEmail(identifier);
    if (userByEmail) return userByEmail;

    // Check username
    return this.userRepository.findOne({
      where: { profile: { username: identifier } },
      select: ['id', 'email', 'password', 'role'],
      relations: ['profile']
    });
  }

  async create(userData: any): Promise<User> {
    const user = this.userRepository.create(userData);
    const result = await this.userRepository.save(user);
    return Array.isArray(result) ? result[0] : result;
  }

  async createProfile(profileData: Partial<Profile>): Promise<Profile> {
    const profile = this.profileRepository.create(profileData);
    const result = await this.profileRepository.save(profile);
    return Array.isArray(result) ? result[0] : result;
  }

  async updateAvatar(userId: string, avatarUrl: string): Promise<Profile> {
    const profile = await this.profileRepository.findOne({ where: { id: userId } });
    if (!profile) {
      const newProfile = this.profileRepository.create({ id: userId, avatar_url: avatarUrl });
      return this.profileRepository.save(newProfile);
    }
    profile.avatar_url = avatarUrl;
    return this.profileRepository.save(profile);
  }

  async updateRole(id: string, role: string): Promise<User> {
    const user = await this.findOne(id);
    user.role = role;
    const result = await this.userRepository.save(user);
    return Array.isArray(result) ? result[0] : result;
  }

  async findByEmailWithRole(email: string): Promise<User | null> {
    return this.userRepository.findOne({ 
      where: { email },
      select: ['id', 'email', 'password', 'role'],
      relations: ['profile']
    });
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    await this.userRepository.update(userId, { password: newPassword });
  }

  async updateGeneralDiscount(userId: string, discount: number): Promise<void> {
    await this.userRepository.update(userId, { general_discount: discount });
  }

  async updateDeliveryFee(userId: string, fee: number): Promise<void> {
    await this.userRepository.update(userId, { delivery_fee: fee });
  }

  async setProductDiscount(userId: string, productId: number, data: { discount_percentage?: number; special_price?: number }): Promise<ProductDiscount> {
    let discount = await this.productDiscountRepository.findOne({ where: { user_id: userId, product_id: productId } });
    if (discount) {
      Object.assign(discount, data);
    } else {
      discount = this.productDiscountRepository.create({ user_id: userId, product_id: productId, ...data });
    }
    return this.productDiscountRepository.save(discount);
  }

  async deleteProductDiscount(discountId: string): Promise<void> {
    await this.productDiscountRepository.delete(discountId);
  }

  async getProductDiscounts(userId: string): Promise<ProductDiscount[]> {
    return this.productDiscountRepository.find({
      where: { user_id: userId },
      relations: ['product']
    });
  }
}

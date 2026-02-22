import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';
import { SEED_PRODUCTS } from './products.seed';

@Injectable()
export class DevtoolsService {
  constructor(
    private productsService: ProductsService,
    private usersService: UsersService,
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
}

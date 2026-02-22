import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { SEED_PRODUCTS } from './products.seed';

@Injectable()
export class DevtoolsService {
  constructor(private productsService: ProductsService) {}

  async seedProducts() {
    return this.productsService.syncLocalProducts(SEED_PRODUCTS as any);
  }
}

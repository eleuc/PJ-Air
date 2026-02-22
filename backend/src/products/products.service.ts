import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { Readable } from 'stream';
const csv = require('csv-parser');

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async processCSV(file: Express.Multer.File) {
    const results: any[] = [];
    const stream = Readable.from(file.buffer);

    return new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on('data', (data: any) => results.push(data))
        .on('end', async () => {
          try {
            await this.productRepository.save(results);
            resolve(results);
          } catch (e) {
            reject(e);
          }
        });
    });
  }

  async findAll() {
    return this.productRepository.find();
  }

  async findByCategory(category: string) {
    return this.productRepository.find({ where: { category } });
  }

  async findOne(id: number) {
    return this.productRepository.findOne({ where: { id } });
  }

  async create(product: Partial<Product>) {
    return this.productRepository.save(product);
  }

  async syncLocalProducts(products: Product[]) {
    return this.productRepository.save(products);
  }
}

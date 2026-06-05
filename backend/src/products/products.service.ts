import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { Readable } from 'stream';
import * as fs from 'fs';
import { join } from 'path';
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
            const savedProducts = [];
            for (const row of results) {
              const productName = row.name || '';
              if (!productName) continue;

              // Mapeo genérico de cabeceras (Inglés o Español)
              const description = row.description || row['descripción corta'] || '';
              const price = parseFloat(row.precio || row.price) || 0;
              const category = row['categoría'] || row.category || 'General';
              const image = row.image || '';

              let existing = await this.productRepository.findOne({ where: { name: productName } });
              if (existing) {
                existing.price = price;
                existing.category = category;
                existing.description = description;
                if (image) {
                  existing.image = image;
                }
                const saved = await this.productRepository.save(existing);
                savedProducts.push(saved);
              } else {
                const newProd = this.productRepository.create({
                  name: productName,
                  price,
                  category,
                  description,
                  image,
                  category_en: row.category_en || category
                });
                const saved = await this.productRepository.save(newProd);
                savedProducts.push(saved);
              }
            }
            resolve(savedProducts);
          } catch (e) {
            reject(e);
          }
        });
    });
  }

  async findAll(visible: boolean = true) {
    const where: any = {};
    if (visible) {
      where.visible = true;
    }
    return this.productRepository.find({ where });
  }

  async findByCategory(category: string, visible: boolean = true) {
    const where: any = { category };
    if (visible) {
      where.visible = true;
    }
    return this.productRepository.find({ where });
  }

  async findOne(id: number, visible: boolean = true) {
    const where: any = { id };
    if (visible) {
      where.visible = true;
    }
    return this.productRepository.findOne({ where });
  }

  async create(product: Partial<Product>) {
    return this.productRepository.save(product);
  }

  async syncLocalProducts(products: Product[]) {
    return this.productRepository.save(products);
  }

  async update(id: number, data: Partial<Product>) {
    await this.productRepository.update(id, data);
    return this.productRepository.findOne({ where: { id } });
  }

  async delete(id: number) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) return null;
    try {
      return await this.productRepository.remove(product);
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT' || (error.message && error.message.includes('FOREIGN KEY'))) {
        throw new ConflictException(
          `Cannot delete product "${product.name}" (ID: ${id}) because it is referenced in existing orders or customer discounts.`,
        );
      }
      throw error;
    }
  }

  /** Update category (ES), category_en (EN), and category_min_qty across all products with matching category name */
  async updateCategory(oldName: string, data: { newName: string; newNameEn: string; minQty?: number }) {
    const products = await this.productRepository.find({ where: { category: oldName } });
    if (products.length === 0) return { updated: 0 };
    
    await Promise.all(
      products.map(p =>
        this.productRepository.update(p.id, { 
          category: data.newName, 
          category_en: data.newNameEn,
          category_min_qty: data.minQty ?? p.category_min_qty
        })
      )
    );
    return { updated: products.length };
  }
}

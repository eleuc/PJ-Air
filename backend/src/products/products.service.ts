import { Injectable, ConflictException, OnModuleInit, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { Category } from './category.entity';
import { Readable } from 'stream';
const csv = require('csv-parser');

@Injectable()
export class ProductsService implements OnModuleInit {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async onModuleInit() {
    await this.migrateLegacyCategories();
  }

  private async migrateLegacyCategories() {
    try {
      const hasLegacyColumn = await this.productRepository.query(
        "PRAGMA table_info(products)"
      ).then((info: any[]) => info.some(col => col.name === 'category'));

      if (hasLegacyColumn) {
        console.log('[MIGRATION] Legacy "category" column found. Migrating to Category entities...');
        
        // 1. Get all products with legacy categories
        const legacyProducts = await this.productRepository.query(
          "SELECT id, category, category_en, category_min_qty FROM products WHERE category IS NOT NULL AND category != '_deleted_'"
        );
        
        for (const row of legacyProducts) {
          if (!row.category) continue;
          
          let cat = await this.categoryRepository.findOne({ where: { name: row.category } });
          if (!cat) {
            cat = this.categoryRepository.create({
              name: row.category,
              name_en: row.category_en || row.category,
              min_qty: Number(row.category_min_qty) || 1,
            });
            cat = await this.categoryRepository.save(cat);
          }
          
          await this.productRepository.query(
            "UPDATE products SET category_id = ? WHERE id = ?",
            [cat.id, row.id]
          );
        }
        
        // 2. Handle soft deleted products
        const deletedLegacyProducts = await this.productRepository.query(
          "SELECT id FROM products WHERE category = '_deleted_'"
        );
        for (const row of deletedLegacyProducts) {
          await this.productRepository.query(
            "UPDATE products SET is_deleted = 1 WHERE id = ?",
            [row.id]
          );
        }

        console.log('[MIGRATION] Legacy categories migration completed successfully.');
      }
    } catch (error) {
      console.error('[MIGRATION] Error migrating legacy categories:', error.message);
    }
  }

  // -------------------------------------------------------------------------
  // Category CRUD
  // -------------------------------------------------------------------------

  async findAllCategories() {
    return this.categoryRepository.find();
  }

  async findCategoryById(id: number) {
    const cat = await this.categoryRepository.findOne({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found');
    return cat;
  }

  async createCategory(data: Partial<Category>) {
    const existing = await this.categoryRepository.findOne({ where: { name: data.name } });
    if (existing) throw new ConflictException('Category name already registered');
    const cat = this.categoryRepository.create(data);
    return this.categoryRepository.save(cat);
  }

  async updateCategoryById(id: number, data: Partial<Category>) {
    await this.categoryRepository.update(id, data);
    return this.findCategoryById(id);
  }

  async deleteCategory(id: number) {
    const cat = await this.findCategoryById(id);
    // Remove references or let it be null.
    // For safety, we set category_id to null on products belonging to this category
    await this.productRepository.update({ category: { id } }, { category: null });
    return this.categoryRepository.remove(cat);
  }

  // -------------------------------------------------------------------------
  // Product CRUD
  // -------------------------------------------------------------------------

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

              const description = row.description || row['descripción corta'] || '';
              const price = parseFloat(row.precio || row.price) || 0;
              const categoryName = row['categoría'] || row.category || 'General';
              const image = row.image || '';

              // Find or create category
              let cat = await this.categoryRepository.findOne({ where: { name: categoryName } });
              if (!cat) {
                cat = this.categoryRepository.create({
                  name: categoryName,
                  name_en: row.category_en || categoryName,
                  min_qty: 1,
                });
                cat = await this.categoryRepository.save(cat);
              }

              let existing = await this.productRepository.findOne({ where: { name: productName } });
              if (existing) {
                existing.price = price;
                existing.category = cat;
                existing.description = description;
                existing.is_deleted = false; // restore if was soft deleted
                if (image) {
                  existing.image = image;
                }
                const saved = await this.productRepository.save(existing);
                savedProducts.push(saved);
              } else {
                const newProd = this.productRepository.create({
                  name: productName,
                  price,
                  category: cat,
                  description,
                  image,
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

  async findAll() {
    const products = await this.productRepository.find({
      where: { is_deleted: false },
      relations: ['category'],
    });
    return products.filter(p => !p.category || p.category.is_active !== false);
  }

  async findByCategory(categoryName: string) {
    const products = await this.productRepository.find({ 
      where: { category: { name: categoryName }, is_deleted: false },
      relations: ['category']
    });
    return products.filter(p => !p.category || p.category.is_active !== false);
  }

  async findOne(id: number) {
    return this.productRepository.findOne({ 
      where: { id, is_deleted: false },
      relations: ['category']
    });
  }

  async create(productData: any) {
    // If category_id is provided, link it
    let cat = null;
    if (productData.category_id) {
      cat = await this.findCategoryById(Number(productData.category_id));
    } else if (productData.category && typeof productData.category === 'object') {
      cat = await this.findCategoryById(Number(productData.category.id));
    }
    
    const product = this.productRepository.create({
      ...productData,
      category: cat,
    });
    return this.productRepository.save(product);
  }

  async syncLocalProducts(products: any[]) {
    const categoryMap: Record<string, any> = {};
    const productsToSave = [];

    for (const p of products) {
      const categoryName = p.category;
      if (typeof categoryName === 'string') {
        let cat = categoryMap[categoryName];
        if (!cat) {
          const found = await this.categoryRepository.findOne({ where: { name: categoryName } });
          if (found) {
            cat = found;
          } else {
            const newCat = this.categoryRepository.create({
              name: categoryName,
              name_en: categoryName === 'Postres' ? 'Desserts' : categoryName === 'Pasteles' ? 'Cakes' : categoryName,
              min_qty: 1,
              is_active: true,
            });
            cat = await this.categoryRepository.save(newCat);
          }
          categoryMap[categoryName] = cat;
        }
        
        const { category, ...rest } = p;
        productsToSave.push({
          ...rest,
          category: cat,
        });
      } else {
        productsToSave.push(p);
      }
    }

    return this.productRepository.save(productsToSave);
  }

  async update(id: number, data: any) {
    const product = await this.findOne(id);
    if (!product) throw new NotFoundException('Product not found');

    const { category_id, ...rest } = data;
    
    if (category_id !== undefined) {
      if (category_id === null) {
        product.category = null;
      } else {
        product.category = await this.findCategoryById(Number(category_id));
      }
    }

    Object.assign(product, rest);
    return this.productRepository.save(product);
  }

  async delete(id: number) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) return null;
    
    product.is_deleted = true;
    return this.productRepository.save(product);
  }

  /** Update category name bulk method (backward compatibility) */
  async updateCategory(oldName: string, data: { newName: string; newNameEn: string; minQty?: number }) {
    const cat = await this.categoryRepository.findOne({ where: { name: oldName } });
    if (!cat) return { updated: 0 };
    
    cat.name = data.newName;
    cat.name_en = data.newNameEn;
    if (data.minQty !== undefined) {
      cat.min_qty = data.minQty;
    }
    await this.categoryRepository.save(cat);
    
    const count = await this.productRepository.count({ where: { category: { id: cat.id } } });
    return { updated: count };
  }
}

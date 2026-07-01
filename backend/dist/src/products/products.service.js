"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("./product.entity");
const category_entity_1 = require("./category.entity");
const stream_1 = require("stream");
const csv = require('csv-parser');
let ProductsService = class ProductsService {
    productRepository;
    categoryRepository;
    constructor(productRepository, categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }
    async onModuleInit() {
        await this.migrateLegacyCategories();
    }
    async migrateLegacyCategories() {
        try {
            const hasLegacyColumn = await this.productRepository.query("PRAGMA table_info(products)").then((info) => info.some(col => col.name === 'category'));
            if (hasLegacyColumn) {
                console.log('[MIGRATION] Legacy "category" column found. Migrating to Category entities...');
                const legacyProducts = await this.productRepository.query("SELECT id, category, category_en, category_min_qty FROM products WHERE category IS NOT NULL AND category != '_deleted_'");
                for (const row of legacyProducts) {
                    if (!row.category)
                        continue;
                    let cat = await this.categoryRepository.findOne({ where: { name: row.category } });
                    if (!cat) {
                        cat = this.categoryRepository.create({
                            name: row.category,
                            name_en: row.category_en || row.category,
                            min_qty: Number(row.category_min_qty) || 1,
                        });
                        cat = await this.categoryRepository.save(cat);
                    }
                    await this.productRepository.query("UPDATE products SET category_id = ? WHERE id = ?", [cat.id, row.id]);
                }
                const deletedLegacyProducts = await this.productRepository.query("SELECT id FROM products WHERE category = '_deleted_'");
                for (const row of deletedLegacyProducts) {
                    await this.productRepository.query("UPDATE products SET is_deleted = 1 WHERE id = ?", [row.id]);
                }
                console.log('[MIGRATION] Legacy categories migration completed successfully.');
            }
        }
        catch (error) {
            console.error('[MIGRATION] Error migrating legacy categories:', error.message);
        }
    }
    async findAllCategories() {
        return this.categoryRepository.find();
    }
    async findCategoryById(id) {
        const cat = await this.categoryRepository.findOne({ where: { id } });
        if (!cat)
            throw new common_1.NotFoundException('Category not found');
        return cat;
    }
    async createCategory(data) {
        const existing = await this.categoryRepository.findOne({ where: { name: data.name } });
        if (existing)
            throw new common_1.ConflictException('Category name already registered');
        const cat = this.categoryRepository.create(data);
        return this.categoryRepository.save(cat);
    }
    async updateCategoryById(id, data) {
        await this.categoryRepository.update(id, data);
        return this.findCategoryById(id);
    }
    async deleteCategory(id) {
        const cat = await this.findCategoryById(id);
        await this.productRepository.update({ category: { id } }, { category: null });
        return this.categoryRepository.remove(cat);
    }
    async processCSV(file) {
        const results = [];
        const stream = stream_1.Readable.from(file.buffer);
        return new Promise((resolve, reject) => {
            stream
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', async () => {
                try {
                    const savedProducts = [];
                    for (const row of results) {
                        const productName = row.name || '';
                        if (!productName)
                            continue;
                        const description = row.description || row['descripción corta'] || '';
                        const price = parseFloat(row.precio || row.price) || 0;
                        const categoryName = row['categoría'] || row.category || 'General';
                        const image = row.image || '';
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
                            existing.is_deleted = false;
                            if (image) {
                                existing.image = image;
                            }
                            const saved = await this.productRepository.save(existing);
                            savedProducts.push(saved);
                        }
                        else {
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
                }
                catch (e) {
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
    async findByCategory(categoryName) {
        const products = await this.productRepository.find({
            where: { category: { name: categoryName }, is_deleted: false },
            relations: ['category']
        });
        return products.filter(p => !p.category || p.category.is_active !== false);
    }
    async findOne(id) {
        return this.productRepository.findOne({
            where: { id, is_deleted: false },
            relations: ['category']
        });
    }
    async create(productData) {
        let cat = null;
        if (productData.category_id) {
            cat = await this.findCategoryById(Number(productData.category_id));
        }
        else if (productData.category && typeof productData.category === 'object') {
            cat = await this.findCategoryById(Number(productData.category.id));
        }
        const product = this.productRepository.create({
            ...productData,
            category: cat,
        });
        return this.productRepository.save(product);
    }
    async syncLocalProducts(products) {
        const categoryMap = {};
        const productsToSave = [];
        for (const p of products) {
            const categoryName = p.category;
            if (typeof categoryName === 'string') {
                let cat = categoryMap[categoryName];
                if (!cat) {
                    const found = await this.categoryRepository.findOne({ where: { name: categoryName } });
                    if (found) {
                        cat = found;
                    }
                    else {
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
            }
            else {
                productsToSave.push(p);
            }
        }
        return this.productRepository.save(productsToSave);
    }
    async update(id, data) {
        const product = await this.findOne(id);
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        const { category_id, ...rest } = data;
        if (category_id !== undefined) {
            if (category_id === null) {
                product.category = null;
            }
            else {
                product.category = await this.findCategoryById(Number(category_id));
            }
        }
        Object.assign(product, rest);
        return this.productRepository.save(product);
    }
    async delete(id) {
        const product = await this.productRepository.findOne({ where: { id } });
        if (!product)
            return null;
        product.is_deleted = true;
        return this.productRepository.save(product);
    }
    async updateCategory(oldName, data) {
        const cat = await this.categoryRepository.findOne({ where: { name: oldName } });
        if (!cat)
            return { updated: 0 };
        cat.name = data.newName;
        cat.name_en = data.newNameEn;
        if (data.minQty !== undefined) {
            cat.min_qty = data.minQty;
        }
        await this.categoryRepository.save(cat);
        const count = await this.productRepository.count({ where: { category: { id: cat.id } } });
        return { updated: count };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(1, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ProductsService);
//# sourceMappingURL=products.service.js.map
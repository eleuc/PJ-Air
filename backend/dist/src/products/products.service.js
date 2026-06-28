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
const stream_1 = require("stream");
const csv = require('csv-parser');
let ProductsService = class ProductsService {
    productRepository;
    constructor(productRepository) {
        this.productRepository = productRepository;
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
                        }
                        else {
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
                }
                catch (e) {
                    reject(e);
                }
            });
        });
    }
    async findAll() {
        const list = await this.productRepository.find();
        return list.filter(p => p.category !== '_deleted_');
    }
    async findByCategory(category) {
        return this.productRepository.find({ where: { category } });
    }
    async findOne(id) {
        return this.productRepository.findOne({ where: { id } });
    }
    async create(product) {
        return this.productRepository.save(product);
    }
    async syncLocalProducts(products) {
        return this.productRepository.save(products);
    }
    async update(id, data) {
        await this.productRepository.update(id, data);
        return this.productRepository.findOne({ where: { id } });
    }
    async delete(id) {
        const product = await this.productRepository.findOne({ where: { id } });
        if (!product)
            return null;
        product.category = '_deleted_';
        product.category_en = '_deleted_';
        return this.productRepository.save(product);
    }
    async updateCategory(oldName, data) {
        const products = await this.productRepository.find({ where: { category: oldName } });
        if (products.length === 0)
            return { updated: 0 };
        await Promise.all(products.map(p => this.productRepository.update(p.id, {
            category: data.newName,
            category_en: data.newNameEn,
            category_min_qty: data.minQty ?? p.category_min_qty
        })));
        return { updated: products.length };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ProductsService);
//# sourceMappingURL=products.service.js.map
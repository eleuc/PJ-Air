import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { Category } from './category.entity';
export declare class ProductsService implements OnModuleInit {
    private productRepository;
    private categoryRepository;
    constructor(productRepository: Repository<Product>, categoryRepository: Repository<Category>);
    onModuleInit(): Promise<void>;
    private migrateLegacyCategories;
    findAllCategories(): Promise<Category[]>;
    findCategoryById(id: number): Promise<Category>;
    createCategory(data: Partial<Category>): Promise<Category>;
    updateCategoryById(id: number, data: Partial<Category>): Promise<Category>;
    deleteCategory(id: number): Promise<Category>;
    processCSV(file: Express.Multer.File): Promise<unknown>;
    findAll(): Promise<Product[]>;
    findByCategory(categoryName: string): Promise<Product[]>;
    findOne(id: number): Promise<Product | null>;
    create(productData: any): Promise<Product[]>;
    syncLocalProducts(products: any[]): Promise<any[]>;
    update(id: number, data: any): Promise<Product>;
    delete(id: number): Promise<Product | null>;
    updateCategory(oldName: string, data: {
        newName: string;
        newNameEn: string;
        minQty?: number;
    }): Promise<{
        updated: number;
    }>;
}

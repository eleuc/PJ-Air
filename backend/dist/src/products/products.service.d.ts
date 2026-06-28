import { Repository } from 'typeorm';
import { Product } from './product.entity';
export declare class ProductsService {
    private productRepository;
    constructor(productRepository: Repository<Product>);
    processCSV(file: Express.Multer.File): Promise<unknown>;
    findAll(): Promise<Product[]>;
    findByCategory(category: string): Promise<Product[]>;
    findOne(id: number): Promise<Product | null>;
    create(product: Partial<Product>): Promise<Partial<Product> & Product>;
    syncLocalProducts(products: Product[]): Promise<Product[]>;
    update(id: number, data: Partial<Product>): Promise<Product | null>;
    delete(id: number): Promise<Product | null>;
    updateCategory(oldName: string, data: {
        newName: string;
        newNameEn: string;
        minQty?: number;
    }): Promise<{
        updated: number;
    }>;
}

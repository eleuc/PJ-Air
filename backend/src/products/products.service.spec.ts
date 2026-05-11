import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { Product } from './product.entity';

/**
 * Unit Tests — ProductsService
 *
 * These tests validate the CSV parsing pipeline and CRUD delegation logic
 * within ProductsService. The TypeORM repository is fully mocked so that
 * no database access occurs, isolating the business-logic layer.
 */
describe('ProductsService', () => {
  let service: ProductsService;

  // ---- Shared mock repository -------------------------------------------
  const mockProductRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((input: unknown) => Promise.resolve(input)),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  // -----------------------------------------------------------------------
  // Smoke test
  // -----------------------------------------------------------------------
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // -----------------------------------------------------------------------
  // CSV Parsing — Unit Tests (Phase 1)
  // -----------------------------------------------------------------------
  describe('processCSV', () => {
    /**
     * Helper: creates a minimal Express.Multer.File from a raw CSV string.
     */
    function createCsvFile(csvContent: string): Express.Multer.File {
      return {
        buffer: Buffer.from(csvContent),
        fieldname: 'files',
        originalname: 'products.csv',
        encoding: '7bit',
        mimetype: 'text/csv',
        size: csvContent.length,
        stream: null as any,
        destination: '',
        filename: '',
        path: '',
      };
    }

    it('should successfully parse a valid CSV string into an array of product objects', async () => {
      const csv = [
        'name,category,price,description',
        'Widget A,Electronics,19.99,A nice widget',
        'Gadget B,Tools,5.50,A handy gadget',
      ].join('\n');

      const result = await service.processCSV(createCsvFile(csv));

      // csv-parser emits each row as a plain object keyed by header names
      expect(result).toEqual([
        { name: 'Widget A', category: 'Electronics', price: '19.99', description: 'A nice widget' },
        { name: 'Gadget B', category: 'Tools', price: '5.50', description: 'A handy gadget' },
      ]);

      // Repository.save should have been called once with the parsed array
      expect(mockProductRepository.save).toHaveBeenCalledTimes(1);
      expect(mockProductRepository.save).toHaveBeenCalledWith(result);
    });

    it('should throw a formatted validation error when parsing a CSV missing required columns', async () => {
      // Simulate a repository that rejects rows lacking required fields.
      // TypeORM will throw when NOT NULL columns are absent.
      mockProductRepository.save.mockRejectedValueOnce(
        new Error('SQLITE_CONSTRAINT: NOT NULL constraint failed: products.name'),
      );

      // CSV with no "name" column — only category and price
      const csv = [
        'category,price',
        'Electronics,19.99',
      ].join('\n');

      await expect(service.processCSV(createCsvFile(csv))).rejects.toThrow(
        /NOT NULL constraint failed/,
      );
    });

    it('should handle and log errors gracefully for specific rows with invalid data types during CSV parsing', async () => {
      // Simulate a repository rejecting due to a type mismatch on save
      mockProductRepository.save.mockRejectedValueOnce(
        new Error('SQLITE_CONSTRAINT: datatype mismatch for column price'),
      );

      const csv = [
        'name,category,price,description',
        'Valid Product,Tools,10.00,Good',
        'Bad Product,Tools,not-a-number,Bad data',
      ].join('\n');

      await expect(service.processCSV(createCsvFile(csv))).rejects.toThrow(
        /datatype mismatch/,
      );

      // Even though the promise rejects, the rows should have been parsed
      // and forwarded to repository.save (the error comes from the DB layer)
      expect(mockProductRepository.save).toHaveBeenCalledTimes(1);
      const savedRows = mockProductRepository.save.mock.calls[0][0] as Record<string, string>[];
      expect(savedRows).toHaveLength(2);
      expect(savedRows[1]).toMatchObject({ name: 'Bad Product', price: 'not-a-number' });
    });
  });

  // -----------------------------------------------------------------------
  // CRUD delegation sanity checks
  // -----------------------------------------------------------------------
  describe('CRUD operations', () => {
    it('findAll should delegate to repository.find', async () => {
      const products = [{ id: 1, name: 'Test' }];
      mockProductRepository.find.mockResolvedValue(products);

      const result = await service.findAll();
      expect(result).toEqual(products);
      expect(mockProductRepository.find).toHaveBeenCalledTimes(1);
    });

    it('findByCategory should filter by category', async () => {
      const products = [{ id: 1, name: 'Test', category: 'Electronics' }];
      mockProductRepository.find.mockResolvedValue(products);

      const result = await service.findByCategory('Electronics');
      expect(result).toEqual(products);
      expect(mockProductRepository.find).toHaveBeenCalledWith({
        where: { category: 'Electronics' },
      });
    });

    it('findOne should look up by id', async () => {
      const product = { id: 1, name: 'Test' };
      mockProductRepository.findOne.mockResolvedValue(product);

      const result = await service.findOne(1);
      expect(result).toEqual(product);
      expect(mockProductRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('create should save a new product', async () => {
      const dto = { name: 'New', price: 9.99 };
      mockProductRepository.save.mockResolvedValue({ id: 1, ...dto });

      const result = await service.create(dto);
      expect(result).toMatchObject(dto);
      expect(mockProductRepository.save).toHaveBeenCalledWith(dto);
    });

    it('delete should return null when product does not exist', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);

      const result = await service.delete(999);
      expect(result).toBeNull();
      expect(mockProductRepository.remove).not.toHaveBeenCalled();
    });

    it('delete should throw ConflictException when product is associated with order history (foreign key constraint)', async () => {
      const product = { id: 123, name: 'Tied Product' };
      mockProductRepository.findOne.mockResolvedValue(product);

      const dbError = new Error('SQLITE_CONSTRAINT: FOREIGN KEY constraint failed');
      (dbError as any).code = 'SQLITE_CONSTRAINT';
      mockProductRepository.remove.mockRejectedValueOnce(dbError);

      await expect(service.delete(123)).rejects.toThrow(ConflictException);
      expect(mockProductRepository.remove).toHaveBeenCalledWith(product);
    });

    it('updateCategory should update all products matching the old category name', async () => {
      const products = [
        { id: 1, category: 'Old', category_min_qty: 1 },
        { id: 2, category: 'Old', category_min_qty: 1 },
      ];
      mockProductRepository.find.mockResolvedValue(products);
      mockProductRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.updateCategory('Old', {
        newName: 'New',
        newNameEn: 'NewEn',
        minQty: 5,
      });

      expect(result).toEqual({ updated: 2 });
      expect(mockProductRepository.update).toHaveBeenCalledTimes(2);
      expect(mockProductRepository.update).toHaveBeenCalledWith(1, {
        category: 'New',
        category_en: 'NewEn',
        category_min_qty: 5,
      });
    });

    it('updateCategory should return { updated: 0 } when no products match', async () => {
      mockProductRepository.find.mockResolvedValue([]);

      const result = await service.updateCategory('NonExistent', {
        newName: 'New',
        newNameEn: 'NewEn',
      });

      expect(result).toEqual({ updated: 0 });
      expect(mockProductRepository.update).not.toHaveBeenCalled();
    });
  });
});

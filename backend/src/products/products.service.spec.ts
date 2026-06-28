import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { Product } from './product.entity';
import { Category } from './category.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;

  const mockProductRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    create: jest.fn().mockImplementation((input: any) => ({ ...input })),
    query: jest.fn().mockResolvedValue([]),
    count: jest.fn(),
  };

  const mockCategoryRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    create: jest.fn().mockImplementation((input: any) => ({ ...input })),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockProductRepository.find.mockReset();
    mockProductRepository.findOne.mockReset();
    mockProductRepository.save.mockReset();
    mockProductRepository.update.mockReset();
    mockProductRepository.create.mockReset();
    mockProductRepository.count.mockReset();
    mockProductRepository.query.mockReset();

    mockCategoryRepository.find.mockReset();
    mockCategoryRepository.findOne.mockReset();
    mockCategoryRepository.save.mockReset();
    mockCategoryRepository.update.mockReset();
    mockCategoryRepository.create.mockReset();
    mockCategoryRepository.remove.mockReset();

    mockProductRepository.create.mockImplementation((input: any) => ({ ...input }));
    mockProductRepository.save.mockImplementation((input: unknown) => Promise.resolve(input));
    mockProductRepository.query.mockResolvedValue([]);

    mockCategoryRepository.create.mockImplementation((input: any) => ({ ...input }));
    mockCategoryRepository.save.mockImplementation((input: unknown) => Promise.resolve(input));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processCSV', () => {
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

    it('should successfully parse a valid CSV and resolve categories', async () => {
      const csv = [
        'name,category,price,description',
        'Widget A,Electronics,19.99,A nice widget',
        'Gadget B,Tools,5.50,A handy gadget',
      ].join('\n');

      mockProductRepository.findOne.mockResolvedValue(null);
      mockCategoryRepository.findOne.mockImplementation(async (opts) => {
        const name = opts.where.name;
        return { id: 9, name };
      });

      const result: any = await service.processCSV(createCsvFile(csv));

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({ name: 'Widget A', price: 19.99, description: 'A nice widget', category: { id: 9, name: 'Electronics' } });
      expect(result[1]).toMatchObject({ name: 'Gadget B', price: 5.50, description: 'A handy gadget', category: { id: 9, name: 'Tools' } });
    });
  });

  describe('CRUD operations', () => {
    it('findAll should query products that are not deleted with category relation', async () => {
      const products = [
        { id: 1, name: 'Test Active', is_deleted: false, category: { id: 1, name: 'Cat1', is_active: true } },
        { id: 2, name: 'Test Inactive', is_deleted: false, category: { id: 2, name: 'Cat2', is_active: false } },
        { id: 3, name: 'Test No Cat', is_deleted: false, category: null }
      ];
      mockProductRepository.find.mockResolvedValue(products);

      const result = await service.findAll();
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Test Active');
      expect(result[1].name).toBe('Test No Cat');
      expect(mockProductRepository.find).toHaveBeenCalledWith({
        where: { is_deleted: false },
        relations: ['category'],
      });
    });

    it('findByCategory should query products by category name relation', async () => {
      const products = [
        { id: 1, name: 'Test Active', is_deleted: false, category: { id: 1, name: 'Cat1', is_active: true } },
        { id: 2, name: 'Test Inactive', is_deleted: false, category: { id: 1, name: 'Cat1', is_active: false } }
      ];
      mockProductRepository.find.mockResolvedValue(products);

      const result = await service.findByCategory('Cat1');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Test Active');
      expect(mockProductRepository.find).toHaveBeenCalledWith({
        where: { category: { name: 'Cat1' }, is_deleted: false },
        relations: ['category'],
      });
    });

    it('findOne should look up by id and load relations', async () => {
      const product = { id: 1, name: 'Test', is_deleted: false };
      mockProductRepository.findOne.mockResolvedValue(product);

      const result = await service.findOne(1);
      expect(result).toEqual(product);
      expect(mockProductRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, is_deleted: false },
        relations: ['category'],
      });
    });

    it('delete should set is_deleted = true', async () => {
      const product = { id: 123, name: 'Product', is_deleted: false };
      mockProductRepository.findOne.mockResolvedValue(product);

      const result = await service.delete(123);
      expect(result).toMatchObject({ id: 123, is_deleted: true });
      expect(mockProductRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        id: 123,
        is_deleted: true,
      }));
    });

    it('updateCategory should update Category name entity and return count', async () => {
      const categoryEntity = { id: 1, name: 'Old', name_en: 'OldEn', min_qty: 1 };
      mockCategoryRepository.findOne.mockResolvedValue(categoryEntity);
      mockProductRepository.count.mockResolvedValue(4);

      const result = await service.updateCategory('Old', {
        newName: 'New',
        newNameEn: 'NewEn',
        minQty: 5,
      });

      expect(result).toEqual({ updated: 4 });
      expect(mockCategoryRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        name: 'New',
        name_en: 'NewEn',
        min_qty: 5,
      }));
    });
  });
});


import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProductsRepository } from './productsRepo';
import { NotFoundError } from '../utils/errors';

vi.mock('../db/sqlite', () => ({
  getDatabase: vi.fn(),
}));

describe('ProductsRepository', () => {
  let repository: ProductsRepository;
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      db: {} as any,
      run: vi.fn(),
      get: vi.fn(),
      all: vi.fn(),
      close: vi.fn(),
    };
    repository = new ProductsRepository(mockDb);
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      mockDb.all.mockResolvedValue([{ product_id: 1, supplier_id: 1, name: 'Widget' }]);
      const result = await repository.findAll();
      expect(result).toHaveLength(1);
      expect(result[0].productId).toBe(1);
    });
  });

  describe('findById', () => {
    it('should return product when found', async () => {
      mockDb.get.mockResolvedValue({ product_id: 1, supplier_id: 1, name: 'Widget' });
      const result = await repository.findById(1);
      expect(result?.productId).toBe(1);
    });

    it('should return null when not found', async () => {
      mockDb.get.mockResolvedValue(undefined);
      const result = await repository.findById(999);
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and return a product', async () => {
      mockDb.run.mockResolvedValue({ lastID: 1, changes: 1 });
      mockDb.get.mockResolvedValue({ product_id: 1, supplier_id: 1, name: 'New Widget', price: 9.99 });
      const result = await repository.create({ supplierId: 1, name: 'New Widget', description: '', price: 9.99, sku: 'W-001', unit: 'piece', imgName: '' });
      expect(result.productId).toBe(1);
    });
  });

  describe('update', () => {
    it('should throw NotFoundError when product does not exist', async () => {
      mockDb.run.mockResolvedValue({ changes: 0 });
      await expect(repository.update(999, { name: 'X' })).rejects.toThrow(NotFoundError);
    });
  });

  describe('delete', () => {
    it('should throw NotFoundError when product does not exist', async () => {
      mockDb.run.mockResolvedValue({ changes: 0 });
      await expect(repository.delete(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('exists', () => {
    it('should return true when product exists', async () => {
      mockDb.get.mockResolvedValue({ count: 1 });
      expect(await repository.exists(1)).toBe(true);
    });

    it('should return false when product does not exist', async () => {
      mockDb.get.mockResolvedValue({ count: 0 });
      expect(await repository.exists(999)).toBe(false);
    });
  });

  describe('findBySupplierId', () => {
    it('should return products for supplier', async () => {
      mockDb.all.mockResolvedValue([{ product_id: 1, supplier_id: 1, name: 'Widget' }]);
      const result = await repository.findBySupplierId(1);
      expect(result).toHaveLength(1);
    });
  });

  describe('findByName', () => {
    it('should return products matching name', async () => {
      mockDb.all.mockResolvedValue([{ product_id: 1, supplier_id: 1, name: 'Test Widget' }]);
      const result = await repository.findByName('Test');
      expect(result).toHaveLength(1);
    });
  });

  describe('error handling', () => {
    it('should throw on findAll database error', async () => {
      mockDb.all.mockRejectedValue(new Error('DB error'));
      await expect(repository.findAll()).rejects.toThrow();
    });

    it('should throw on exists database error', async () => {
      mockDb.get.mockRejectedValue(new Error('DB error'));
      await expect(repository.exists(1)).rejects.toThrow();
    });

    it('should throw on findBySupplierId database error', async () => {
      mockDb.all.mockRejectedValue(new Error('DB error'));
      await expect(repository.findBySupplierId(1)).rejects.toThrow();
    });
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrderDetailsRepository } from './orderDetailsRepo';
import { NotFoundError } from '../utils/errors';

vi.mock('../db/sqlite', () => ({
  getDatabase: vi.fn(),
}));

describe('OrderDetailsRepository', () => {
  let repository: OrderDetailsRepository;
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      db: {} as any,
      run: vi.fn(),
      get: vi.fn(),
      all: vi.fn(),
      close: vi.fn(),
    };
    repository = new OrderDetailsRepository(mockDb);
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all order details', async () => {
      mockDb.all.mockResolvedValue([{ order_detail_id: 1, order_id: 1, product_id: 1 }]);
      const result = await repository.findAll();
      expect(result).toHaveLength(1);
      expect(result[0].orderDetailId).toBe(1);
    });
  });

  describe('findById', () => {
    it('should return order detail when found', async () => {
      mockDb.get.mockResolvedValue({ order_detail_id: 1, order_id: 1, product_id: 1 });
      const result = await repository.findById(1);
      expect(result?.orderDetailId).toBe(1);
    });

    it('should return null when not found', async () => {
      mockDb.get.mockResolvedValue(undefined);
      const result = await repository.findById(999);
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and return an order detail', async () => {
      mockDb.run.mockResolvedValue({ lastID: 1, changes: 1 });
      mockDb.get.mockResolvedValue({ order_detail_id: 1, order_id: 1, product_id: 1, quantity: 5, unit_price: 10 });
      const result = await repository.create({ orderId: 1, productId: 1, quantity: 5, unitPrice: 10, notes: '' });
      expect(result.orderDetailId).toBe(1);
    });
  });

  describe('update', () => {
    it('should throw NotFoundError when order detail does not exist', async () => {
      mockDb.run.mockResolvedValue({ changes: 0 });
      await expect(repository.update(999, { quantity: 1 })).rejects.toThrow(NotFoundError);
    });
  });

  describe('delete', () => {
    it('should throw NotFoundError when order detail does not exist', async () => {
      mockDb.run.mockResolvedValue({ changes: 0 });
      await expect(repository.delete(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('exists', () => {
    it('should return true when order detail exists', async () => {
      mockDb.get.mockResolvedValue({ count: 1 });
      expect(await repository.exists(1)).toBe(true);
    });

    it('should return false when order detail does not exist', async () => {
      mockDb.get.mockResolvedValue({ count: 0 });
      expect(await repository.exists(999)).toBe(false);
    });
  });

  describe('findByOrderId', () => {
    it('should return order details for order', async () => {
      mockDb.all.mockResolvedValue([{ order_detail_id: 1, order_id: 1 }]);
      const result = await repository.findByOrderId(1);
      expect(result).toHaveLength(1);
    });
  });

  describe('findByProductId', () => {
    it('should return order details for product', async () => {
      mockDb.all.mockResolvedValue([{ order_detail_id: 1, product_id: 1 }]);
      const result = await repository.findByProductId(1);
      expect(result).toHaveLength(1);
    });
  });

  describe('getTotalValueByOrderId', () => {
    it('should return total value for order', async () => {
      mockDb.get.mockResolvedValue({ total: 100.5 });
      const result = await repository.getTotalValueByOrderId(1);
      expect(result).toBe(100.5);
    });

    it('should return 0 when no order details found', async () => {
      mockDb.get.mockResolvedValue({ total: null });
      const result = await repository.getTotalValueByOrderId(999);
      expect(result).toBe(0);
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

    it('should throw on findByOrderId database error', async () => {
      mockDb.all.mockRejectedValue(new Error('DB error'));
      await expect(repository.findByOrderId(1)).rejects.toThrow();
    });

    it('should throw on findByProductId database error', async () => {
      mockDb.all.mockRejectedValue(new Error('DB error'));
      await expect(repository.findByProductId(1)).rejects.toThrow();
    });

    it('should throw on getTotalValueByOrderId database error', async () => {
      mockDb.get.mockRejectedValue(new Error('DB error'));
      await expect(repository.getTotalValueByOrderId(1)).rejects.toThrow();
    });
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrderDetailDeliveriesRepository } from './orderDetailDeliveriesRepo';
import { NotFoundError } from '../utils/errors';

vi.mock('../db/sqlite', () => ({
  getDatabase: vi.fn(),
}));

describe('OrderDetailDeliveriesRepository', () => {
  let repository: OrderDetailDeliveriesRepository;
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      db: {} as any,
      run: vi.fn(),
      get: vi.fn(),
      all: vi.fn(),
      close: vi.fn(),
    };
    repository = new OrderDetailDeliveriesRepository(mockDb);
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all order detail deliveries', async () => {
      mockDb.all.mockResolvedValue([{ order_detail_delivery_id: 1, order_detail_id: 1, delivery_id: 1 }]);
      const result = await repository.findAll();
      expect(result).toHaveLength(1);
      expect(result[0].orderDetailDeliveryId).toBe(1);
    });
  });

  describe('findById', () => {
    it('should return order detail delivery when found', async () => {
      mockDb.get.mockResolvedValue({ order_detail_delivery_id: 1, order_detail_id: 1, delivery_id: 1 });
      const result = await repository.findById(1);
      expect(result?.orderDetailDeliveryId).toBe(1);
    });

    it('should return null when not found', async () => {
      mockDb.get.mockResolvedValue(undefined);
      const result = await repository.findById(999);
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and return an order detail delivery', async () => {
      mockDb.run.mockResolvedValue({ lastID: 1, changes: 1 });
      mockDb.get.mockResolvedValue({ order_detail_delivery_id: 1, order_detail_id: 1, delivery_id: 1, quantity: 3 });
      const result = await repository.create({ orderDetailId: 1, deliveryId: 1, quantity: 3, notes: '' });
      expect(result.orderDetailDeliveryId).toBe(1);
    });
  });

  describe('update', () => {
    it('should throw NotFoundError when not found', async () => {
      mockDb.run.mockResolvedValue({ changes: 0 });
      await expect(repository.update(999, { quantity: 1 })).rejects.toThrow(NotFoundError);
    });
  });

  describe('delete', () => {
    it('should throw NotFoundError when not found', async () => {
      mockDb.run.mockResolvedValue({ changes: 0 });
      await expect(repository.delete(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('exists', () => {
    it('should return true when exists', async () => {
      mockDb.get.mockResolvedValue({ count: 1 });
      expect(await repository.exists(1)).toBe(true);
    });

    it('should return false when not found', async () => {
      mockDb.get.mockResolvedValue({ count: 0 });
      expect(await repository.exists(999)).toBe(false);
    });
  });

  describe('findByOrderDetailId', () => {
    it('should return deliveries for order detail', async () => {
      mockDb.all.mockResolvedValue([{ order_detail_delivery_id: 1, order_detail_id: 1 }]);
      const result = await repository.findByOrderDetailId(1);
      expect(result).toHaveLength(1);
    });
  });

  describe('findByDeliveryId', () => {
    it('should return order detail deliveries for delivery', async () => {
      mockDb.all.mockResolvedValue([{ order_detail_delivery_id: 1, delivery_id: 1 }]);
      const result = await repository.findByDeliveryId(1);
      expect(result).toHaveLength(1);
    });
  });

  describe('getTotalQuantityByOrderDetailId', () => {
    it('should return total quantity for order detail', async () => {
      mockDb.get.mockResolvedValue({ total: 15 });
      const result = await repository.getTotalQuantityByOrderDetailId(1);
      expect(result).toBe(15);
    });

    it('should return 0 when no records found', async () => {
      mockDb.get.mockResolvedValue({ total: null });
      const result = await repository.getTotalQuantityByOrderDetailId(999);
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

    it('should throw on findByOrderDetailId database error', async () => {
      mockDb.all.mockRejectedValue(new Error('DB error'));
      await expect(repository.findByOrderDetailId(1)).rejects.toThrow();
    });

    it('should throw on findByDeliveryId database error', async () => {
      mockDb.all.mockRejectedValue(new Error('DB error'));
      await expect(repository.findByDeliveryId(1)).rejects.toThrow();
    });

    it('should throw on getTotalQuantityByOrderDetailId database error', async () => {
      mockDb.get.mockRejectedValue(new Error('DB error'));
      await expect(repository.getTotalQuantityByOrderDetailId(1)).rejects.toThrow();
    });
  });
});

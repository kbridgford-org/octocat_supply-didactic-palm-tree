import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrdersRepository } from './ordersRepo';
import { NotFoundError } from '../utils/errors';

vi.mock('../db/sqlite', () => ({
  getDatabase: vi.fn(),
}));

describe('OrdersRepository', () => {
  let repository: OrdersRepository;
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      db: {} as any,
      run: vi.fn(),
      get: vi.fn(),
      all: vi.fn(),
      close: vi.fn(),
    };
    repository = new OrdersRepository(mockDb);
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all orders', async () => {
      mockDb.all.mockResolvedValue([{ order_id: 1, branch_id: 1, name: 'Order A' }]);
      const result = await repository.findAll();
      expect(result).toHaveLength(1);
      expect(result[0].orderId).toBe(1);
    });
  });

  describe('findById', () => {
    it('should return order when found', async () => {
      mockDb.get.mockResolvedValue({ order_id: 1, branch_id: 1, name: 'Order A' });
      const result = await repository.findById(1);
      expect(result?.orderId).toBe(1);
    });

    it('should return null when not found', async () => {
      mockDb.get.mockResolvedValue(undefined);
      const result = await repository.findById(999);
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and return an order', async () => {
      mockDb.run.mockResolvedValue({ lastID: 1, changes: 1 });
      mockDb.get.mockResolvedValue({ order_id: 1, branch_id: 1, name: 'New Order' });
      const result = await repository.create({ branchId: 1, orderDate: '2025-01-01', name: 'New Order', description: '', status: 'pending' });
      expect(result.orderId).toBe(1);
    });
  });

  describe('update', () => {
    it('should throw NotFoundError when order does not exist', async () => {
      mockDb.run.mockResolvedValue({ changes: 0 });
      await expect(repository.update(999, { name: 'X' })).rejects.toThrow(NotFoundError);
    });
  });

  describe('delete', () => {
    it('should throw NotFoundError when order does not exist', async () => {
      mockDb.run.mockResolvedValue({ changes: 0 });
      await expect(repository.delete(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('exists', () => {
    it('should return true when order exists', async () => {
      mockDb.get.mockResolvedValue({ count: 1 });
      expect(await repository.exists(1)).toBe(true);
    });

    it('should return false when order does not exist', async () => {
      mockDb.get.mockResolvedValue({ count: 0 });
      expect(await repository.exists(999)).toBe(false);
    });
  });

  describe('findByBranchId', () => {
    it('should return orders for branch', async () => {
      mockDb.all.mockResolvedValue([{ order_id: 1, branch_id: 1, name: 'Order A' }]);
      const result = await repository.findByBranchId(1);
      expect(result).toHaveLength(1);
    });
  });

  describe('findByStatus', () => {
    it('should return orders with matching status', async () => {
      mockDb.all.mockResolvedValue([{ order_id: 1, branch_id: 1, name: 'Order A', status: 'pending' }]);
      const result = await repository.findByStatus('pending');
      expect(result).toHaveLength(1);
    });
  });

  describe('findByDateRange', () => {
    it('should return orders in date range', async () => {
      mockDb.all.mockResolvedValue([{ order_id: 1, branch_id: 1, order_date: '2025-06-15' }]);
      const result = await repository.findByDateRange('2025-01-01', '2025-12-31');
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

    it('should throw on findByBranchId database error', async () => {
      mockDb.all.mockRejectedValue(new Error('DB error'));
      await expect(repository.findByBranchId(1)).rejects.toThrow();
    });

    it('should throw on findByStatus database error', async () => {
      mockDb.all.mockRejectedValue(new Error('DB error'));
      await expect(repository.findByStatus('pending')).rejects.toThrow();
    });

    it('should throw on findByDateRange database error', async () => {
      mockDb.all.mockRejectedValue(new Error('DB error'));
      await expect(repository.findByDateRange('2025-01-01', '2025-12-31')).rejects.toThrow();
    });
  });
});

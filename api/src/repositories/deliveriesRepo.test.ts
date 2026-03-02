import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeliveriesRepository } from './deliveriesRepo';
import { NotFoundError } from '../utils/errors';

vi.mock('../db/sqlite', () => ({
  getDatabase: vi.fn(),
}));

describe('DeliveriesRepository', () => {
  let repository: DeliveriesRepository;
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      db: {} as any,
      run: vi.fn(),
      get: vi.fn(),
      all: vi.fn(),
      close: vi.fn(),
    };
    repository = new DeliveriesRepository(mockDb);
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all deliveries', async () => {
      mockDb.all.mockResolvedValue([{ delivery_id: 1, supplier_id: 1, name: 'Del A' }]);
      const result = await repository.findAll();
      expect(result).toHaveLength(1);
      expect(result[0].deliveryId).toBe(1);
    });
  });

  describe('findById', () => {
    it('should return delivery when found', async () => {
      mockDb.get.mockResolvedValue({ delivery_id: 1, supplier_id: 1, name: 'Del A' });
      const result = await repository.findById(1);
      expect(result?.deliveryId).toBe(1);
    });

    it('should return null when not found', async () => {
      mockDb.get.mockResolvedValue(undefined);
      const result = await repository.findById(999);
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and return a delivery', async () => {
      mockDb.run.mockResolvedValue({ lastID: 1, changes: 1 });
      mockDb.get.mockResolvedValue({ delivery_id: 1, supplier_id: 1, name: 'New Del' });
      const result = await repository.create({ supplierId: 1, deliveryDate: '2025-07-01', name: 'New Del', description: '', status: 'pending' });
      expect(result.deliveryId).toBe(1);
    });
  });

  describe('update', () => {
    it('should throw NotFoundError when delivery does not exist', async () => {
      mockDb.run.mockResolvedValue({ changes: 0 });
      await expect(repository.update(999, { name: 'X' })).rejects.toThrow(NotFoundError);
    });
  });

  describe('delete', () => {
    it('should throw NotFoundError when delivery does not exist', async () => {
      mockDb.run.mockResolvedValue({ changes: 0 });
      await expect(repository.delete(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('exists', () => {
    it('should return true when delivery exists', async () => {
      mockDb.get.mockResolvedValue({ count: 1 });
      expect(await repository.exists(1)).toBe(true);
    });

    it('should return false when delivery does not exist', async () => {
      mockDb.get.mockResolvedValue({ count: 0 });
      expect(await repository.exists(999)).toBe(false);
    });
  });

  describe('findBySupplierId', () => {
    it('should return deliveries for supplier', async () => {
      mockDb.all.mockResolvedValue([{ delivery_id: 1, supplier_id: 1, name: 'Del A' }]);
      const result = await repository.findBySupplierId(1);
      expect(result).toHaveLength(1);
    });
  });

  describe('findByStatus', () => {
    it('should return deliveries with matching status', async () => {
      mockDb.all.mockResolvedValue([{ delivery_id: 1, status: 'pending' }]);
      const result = await repository.findByStatus('pending');
      expect(result).toHaveLength(1);
    });
  });

  describe('findByDateRange', () => {
    it('should return deliveries in date range', async () => {
      mockDb.all.mockResolvedValue([{ delivery_id: 1, delivery_date: '2025-07-01' }]);
      const result = await repository.findByDateRange('2025-01-01', '2025-12-31');
      expect(result).toHaveLength(1);
    });
  });

  describe('updateStatus', () => {
    it('should update delivery status', async () => {
      mockDb.run.mockResolvedValue({ changes: 1 });
      mockDb.get.mockResolvedValue({ delivery_id: 1, status: 'in-transit' });
      const result = await repository.updateStatus(1, 'in-transit');
      expect(result.status).toBe('in-transit');
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

    it('should throw on findByStatus database error', async () => {
      mockDb.all.mockRejectedValue(new Error('DB error'));
      await expect(repository.findByStatus('pending')).rejects.toThrow();
    });

    it('should throw on findByDateRange database error', async () => {
      mockDb.all.mockRejectedValue(new Error('DB error'));
      await expect(repository.findByDateRange('2025-01-01', '2025-12-31')).rejects.toThrow();
    });

    it('should throw on updateStatus database error', async () => {
      mockDb.run.mockRejectedValue(new Error('DB error'));
      await expect(repository.updateStatus(1, 'failed')).rejects.toThrow();
    });
  });
});

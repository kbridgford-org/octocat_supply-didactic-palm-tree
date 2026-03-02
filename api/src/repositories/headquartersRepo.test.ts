import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HeadquartersRepository } from './headquartersRepo';
import { NotFoundError } from '../utils/errors';

vi.mock('../db/sqlite', () => ({
  getDatabase: vi.fn(),
}));

describe('HeadquartersRepository', () => {
  let repository: HeadquartersRepository;
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      db: {} as any,
      run: vi.fn(),
      get: vi.fn(),
      all: vi.fn(),
      close: vi.fn(),
    };
    repository = new HeadquartersRepository(mockDb);
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all headquarters', async () => {
      mockDb.all.mockResolvedValue([{ headquarters_id: 1, name: 'HQ A' }]);
      const result = await repository.findAll();
      expect(result).toHaveLength(1);
      expect(result[0].headquartersId).toBe(1);
    });
  });

  describe('findById', () => {
    it('should return headquarters when found', async () => {
      mockDb.get.mockResolvedValue({ headquarters_id: 1, name: 'HQ A' });
      const result = await repository.findById(1);
      expect(result?.headquartersId).toBe(1);
    });

    it('should return null when not found', async () => {
      mockDb.get.mockResolvedValue(undefined);
      const result = await repository.findById(999);
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and return headquarters', async () => {
      mockDb.run.mockResolvedValue({ lastID: 1, changes: 1 });
      mockDb.get.mockResolvedValue({ headquarters_id: 1, name: 'New HQ' });
      const result = await repository.create({ name: 'New HQ', description: '', address: '', contactPerson: '', email: '', phone: '' });
      expect(result.headquartersId).toBe(1);
    });
  });

  describe('update', () => {
    it('should update and return headquarters', async () => {
      mockDb.run.mockResolvedValue({ changes: 1 });
      mockDb.get.mockResolvedValue({ headquarters_id: 1, name: 'Updated' });
      const result = await repository.update(1, { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });

    it('should throw NotFoundError when headquarters does not exist', async () => {
      mockDb.run.mockResolvedValue({ changes: 0 });
      await expect(repository.update(999, { name: 'X' })).rejects.toThrow(NotFoundError);
    });
  });

  describe('delete', () => {
    it('should delete existing headquarters', async () => {
      mockDb.run.mockResolvedValue({ changes: 1 });
      await repository.delete(1);
      expect(mockDb.run).toHaveBeenCalled();
    });

    it('should throw NotFoundError when headquarters does not exist', async () => {
      mockDb.run.mockResolvedValue({ changes: 0 });
      await expect(repository.delete(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('exists', () => {
    it('should return true when headquarters exists', async () => {
      mockDb.get.mockResolvedValue({ count: 1 });
      expect(await repository.exists(1)).toBe(true);
    });

    it('should return false when headquarters does not exist', async () => {
      mockDb.get.mockResolvedValue({ count: 0 });
      expect(await repository.exists(999)).toBe(false);
    });
  });

  describe('findByName', () => {
    it('should return headquarters matching name', async () => {
      mockDb.all.mockResolvedValue([{ headquarters_id: 1, name: 'Test HQ' }]);
      const result = await repository.findByName('Test');
      expect(result).toHaveLength(1);
      expect(mockDb.all).toHaveBeenCalledWith(
        'SELECT * FROM headquarters WHERE name LIKE ? ORDER BY name',
        ['%Test%'],
      );
    });

    it('should throw on database error', async () => {
      mockDb.all.mockRejectedValue(new Error('DB error'));
      await expect(repository.findByName('Test')).rejects.toThrow();
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
  });
});

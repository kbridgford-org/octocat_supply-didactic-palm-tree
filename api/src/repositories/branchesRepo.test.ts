import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BranchesRepository } from './branchesRepo';
import { NotFoundError } from '../utils/errors';

vi.mock('../db/sqlite', () => ({
  getDatabase: vi.fn(),
}));

describe('BranchesRepository', () => {
  let repository: BranchesRepository;
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      db: {} as any,
      run: vi.fn(),
      get: vi.fn(),
      all: vi.fn(),
      close: vi.fn(),
    };
    repository = new BranchesRepository(mockDb);
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all branches', async () => {
      mockDb.all.mockResolvedValue([{ branch_id: 1, headquarters_id: 1, name: 'Branch A' }]);
      const result = await repository.findAll();
      expect(result).toHaveLength(1);
      expect(result[0].branchId).toBe(1);
    });
  });

  describe('findById', () => {
    it('should return branch when found', async () => {
      mockDb.get.mockResolvedValue({ branch_id: 1, headquarters_id: 1, name: 'Branch A' });
      const result = await repository.findById(1);
      expect(result?.branchId).toBe(1);
    });

    it('should return null when not found', async () => {
      mockDb.get.mockResolvedValue(undefined);
      const result = await repository.findById(999);
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and return a branch', async () => {
      mockDb.run.mockResolvedValue({ lastID: 1, changes: 1 });
      mockDb.get.mockResolvedValue({ branch_id: 1, headquarters_id: 1, name: 'New Branch' });
      const result = await repository.create({ headquartersId: 1, name: 'New Branch', description: '', address: '', contactPerson: '', email: '', phone: '' });
      expect(result.branchId).toBe(1);
    });
  });

  describe('update', () => {
    it('should update and return branch', async () => {
      mockDb.run.mockResolvedValue({ changes: 1 });
      mockDb.get.mockResolvedValue({ branch_id: 1, headquarters_id: 1, name: 'Updated' });
      const result = await repository.update(1, { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });

    it('should throw NotFoundError when branch does not exist', async () => {
      mockDb.run.mockResolvedValue({ changes: 0 });
      await expect(repository.update(999, { name: 'X' })).rejects.toThrow(NotFoundError);
    });
  });

  describe('delete', () => {
    it('should delete existing branch', async () => {
      mockDb.run.mockResolvedValue({ changes: 1 });
      await repository.delete(1);
      expect(mockDb.run).toHaveBeenCalled();
    });

    it('should throw NotFoundError when branch does not exist', async () => {
      mockDb.run.mockResolvedValue({ changes: 0 });
      await expect(repository.delete(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('exists', () => {
    it('should return true when branch exists', async () => {
      mockDb.get.mockResolvedValue({ count: 1 });
      expect(await repository.exists(1)).toBe(true);
    });

    it('should return false when branch does not exist', async () => {
      mockDb.get.mockResolvedValue({ count: 0 });
      expect(await repository.exists(999)).toBe(false);
    });
  });

  describe('findByHeadquartersId', () => {
    it('should return branches for headquarters', async () => {
      mockDb.all.mockResolvedValue([{ branch_id: 1, headquarters_id: 1, name: 'Branch A' }]);
      const result = await repository.findByHeadquartersId(1);
      expect(result).toHaveLength(1);
    });
  });

  describe('findByName', () => {
    it('should return branches matching name', async () => {
      mockDb.all.mockResolvedValue([{ branch_id: 1, headquarters_id: 1, name: 'Test Branch' }]);
      const result = await repository.findByName('Test');
      expect(result).toHaveLength(1);
      expect(mockDb.all).toHaveBeenCalledWith(
        'SELECT * FROM branches WHERE name LIKE ? ORDER BY name',
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

    it('should throw on findById database error', async () => {
      mockDb.get.mockRejectedValue(new Error('DB error'));
      await expect(repository.findById(1)).rejects.toThrow();
    });

    it('should throw on exists database error', async () => {
      mockDb.get.mockRejectedValue(new Error('DB error'));
      await expect(repository.exists(1)).rejects.toThrow();
    });

    it('should throw on findByHeadquartersId database error', async () => {
      mockDb.all.mockRejectedValue(new Error('DB error'));
      await expect(repository.findByHeadquartersId(1)).rejects.toThrow();
    });
  });
});

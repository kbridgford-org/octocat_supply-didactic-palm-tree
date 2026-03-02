import { describe, it, expect } from 'vitest';
import { Branch } from './branch';

describe('Branch Model', () => {
  it('should create a valid Branch object', () => {
    const branch: Branch = {
      branchId: 1,
      headquartersId: 1,
      name: 'Eastside Branch',
      description: 'Eastern district branch',
      address: '321 East St',
      contactPerson: 'Emma Davis',
      email: 'edavis@octo.com',
      phone: '555-0203',
    };

    expect(branch.branchId).toBe(1);
    expect(branch.headquartersId).toBe(1);
    expect(branch.name).toBe('Eastside Branch');
    expect(branch.description).toBe('Eastern district branch');
    expect(branch.address).toBe('321 East St');
    expect(branch.contactPerson).toBe('Emma Davis');
    expect(branch.email).toBe('edavis@octo.com');
    expect(branch.phone).toBe('555-0203');
  });

  it('should have correct property types', () => {
    const branch: Branch = {
      branchId: 1,
      headquartersId: 2,
      name: 'Test',
      description: 'Desc',
      address: 'Addr',
      contactPerson: 'Person',
      email: 'e@e.com',
      phone: '555',
    };

    expect(typeof branch.branchId).toBe('number');
    expect(typeof branch.headquartersId).toBe('number');
    expect(typeof branch.name).toBe('string');
    expect(typeof branch.description).toBe('string');
    expect(typeof branch.address).toBe('string');
    expect(typeof branch.contactPerson).toBe('string');
    expect(typeof branch.email).toBe('string');
    expect(typeof branch.phone).toBe('string');
  });

  it('should serialize to JSON correctly', () => {
    const branch: Branch = {
      branchId: 1,
      headquartersId: 1,
      name: 'JSON Branch',
      description: 'Test JSON',
      address: '123 JSON St',
      contactPerson: 'JSON Person',
      email: 'json@test.com',
      phone: '555-JSON',
    };

    const json = JSON.stringify(branch);
    const parsed = JSON.parse(json) as Branch;

    expect(parsed).toEqual(branch);
  });
});

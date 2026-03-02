import { describe, it, expect } from 'vitest';
import { Supplier } from './supplier';

describe('Supplier Model', () => {
  it('should create a valid Supplier object', () => {
    const supplier: Supplier = {
      supplierId: 1,
      name: 'Test Supplier',
      description: 'A test supplier',
      contactPerson: 'Alice Johnson',
      email: 'alice@supplier.com',
      phone: '555-1000',
      active: true,
      verified: false,
    };

    expect(supplier.supplierId).toBe(1);
    expect(supplier.name).toBe('Test Supplier');
    expect(supplier.description).toBe('A test supplier');
    expect(supplier.contactPerson).toBe('Alice Johnson');
    expect(supplier.email).toBe('alice@supplier.com');
    expect(supplier.phone).toBe('555-1000');
    expect(supplier.active).toBe(true);
    expect(supplier.verified).toBe(false);
  });

  it('should have correct property types', () => {
    const supplier: Supplier = {
      supplierId: 1,
      name: 'Test',
      description: 'Desc',
      contactPerson: 'Person',
      email: 'e@e.com',
      phone: '555',
      active: true,
      verified: true,
    };

    expect(typeof supplier.supplierId).toBe('number');
    expect(typeof supplier.name).toBe('string');
    expect(typeof supplier.description).toBe('string');
    expect(typeof supplier.contactPerson).toBe('string');
    expect(typeof supplier.email).toBe('string');
    expect(typeof supplier.phone).toBe('string');
    expect(typeof supplier.active).toBe('boolean');
    expect(typeof supplier.verified).toBe('boolean');
  });

  it('should support active/verified boolean states', () => {
    const activeVerified: Supplier = {
      supplierId: 1,
      name: 'Active Verified',
      description: 'Desc',
      contactPerson: 'Person',
      email: 'e@e.com',
      phone: '555',
      active: true,
      verified: true,
    };

    const inactiveUnverified: Supplier = {
      supplierId: 2,
      name: 'Inactive Unverified',
      description: 'Desc',
      contactPerson: 'Person',
      email: 'e@e.com',
      phone: '555',
      active: false,
      verified: false,
    };

    expect(activeVerified.active).toBe(true);
    expect(activeVerified.verified).toBe(true);
    expect(inactiveUnverified.active).toBe(false);
    expect(inactiveUnverified.verified).toBe(false);
  });

  it('should serialize to JSON correctly', () => {
    const supplier: Supplier = {
      supplierId: 1,
      name: 'JSON Supplier',
      description: 'Test JSON',
      contactPerson: 'JSON Person',
      email: 'json@test.com',
      phone: '555-JSON',
      active: true,
      verified: false,
    };

    const json = JSON.stringify(supplier);
    const parsed = JSON.parse(json) as Supplier;

    expect(parsed).toEqual(supplier);
  });
});

import { describe, it, expect } from 'vitest';
import { Headquarters } from './headquarters';

describe('Headquarters Model', () => {
  it('should create a valid Headquarters object', () => {
    const hq: Headquarters = {
      headquartersId: 1,
      name: 'Main HQ',
      description: 'Main headquarters',
      address: '123 Main St',
      contactPerson: 'John Doe',
      email: 'john@octo.com',
      phone: '555-0100',
    };

    expect(hq.headquartersId).toBe(1);
    expect(hq.name).toBe('Main HQ');
    expect(hq.description).toBe('Main headquarters');
    expect(hq.address).toBe('123 Main St');
    expect(hq.contactPerson).toBe('John Doe');
    expect(hq.email).toBe('john@octo.com');
    expect(hq.phone).toBe('555-0100');
  });

  it('should allow optional properties', () => {
    const hqWithOptional: Headquarters = {
      headquartersId: 1,
      name: 'HQ With Extras',
      description: 'Description',
      address: '456 Test Ave',
      contactPerson: 'Jane Doe',
      email: 'jane@octo.com',
      phone: '555-0200',
      city: 'New York',
      country: 'USA',
      floorCount: 10,
      capacity: 500,
    };

    const hqWithoutOptional: Headquarters = {
      headquartersId: 2,
      name: 'Basic HQ',
      description: 'Basic description',
      address: '789 Basic Blvd',
      contactPerson: 'Bob Smith',
      email: 'bob@octo.com',
      phone: '555-0300',
    };

    expect(hqWithOptional.city).toBe('New York');
    expect(hqWithOptional.country).toBe('USA');
    expect(hqWithOptional.floorCount).toBe(10);
    expect(hqWithOptional.capacity).toBe(500);
    expect(hqWithoutOptional.city).toBeUndefined();
    expect(hqWithoutOptional.country).toBeUndefined();
    expect(hqWithoutOptional.floorCount).toBeUndefined();
    expect(hqWithoutOptional.capacity).toBeUndefined();
  });

  it('should have correct property types', () => {
    const hq: Headquarters = {
      headquartersId: 1,
      name: 'Test',
      description: 'Desc',
      address: 'Addr',
      contactPerson: 'Person',
      email: 'e@e.com',
      phone: '555',
      floorCount: 5,
      capacity: 100,
    };

    expect(typeof hq.headquartersId).toBe('number');
    expect(typeof hq.name).toBe('string');
    expect(typeof hq.floorCount).toBe('number');
    expect(typeof hq.capacity).toBe('number');
  });

  it('should serialize to JSON correctly', () => {
    const hq: Headquarters = {
      headquartersId: 1,
      name: 'JSON HQ',
      description: 'Test JSON',
      address: '123 JSON St',
      contactPerson: 'JSON Person',
      email: 'json@test.com',
      phone: '555-JSON',
      city: 'Seattle',
      country: 'USA',
    };

    const json = JSON.stringify(hq);
    const parsed = JSON.parse(json) as Headquarters;

    expect(parsed).toEqual(hq);
  });
});

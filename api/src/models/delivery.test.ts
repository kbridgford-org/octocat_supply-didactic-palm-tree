import { describe, it, expect } from 'vitest';
import { Delivery } from './delivery';

describe('Delivery Model', () => {
  it('should create a valid Delivery object', () => {
    const delivery: Delivery = {
      deliveryId: 1,
      supplierId: 1,
      deliveryDate: '2025-07-01',
      name: 'Delivery One',
      description: 'First delivery',
      status: 'pending',
    };

    expect(delivery.deliveryId).toBe(1);
    expect(delivery.supplierId).toBe(1);
    expect(delivery.deliveryDate).toBe('2025-07-01');
    expect(delivery.name).toBe('Delivery One');
    expect(delivery.description).toBe('First delivery');
    expect(delivery.status).toBe('pending');
  });

  it('should have correct property types', () => {
    const delivery: Delivery = {
      deliveryId: 1,
      supplierId: 2,
      deliveryDate: '2025-01-01',
      name: 'Test',
      description: 'Desc',
      status: 'pending',
    };

    expect(typeof delivery.deliveryId).toBe('number');
    expect(typeof delivery.supplierId).toBe('number');
    expect(typeof delivery.deliveryDate).toBe('string');
    expect(typeof delivery.name).toBe('string');
    expect(typeof delivery.description).toBe('string');
    expect(typeof delivery.status).toBe('string');
  });

  it('should support various status values', () => {
    const statuses = ['pending', 'in-transit', 'delivered', 'failed'];
    statuses.forEach((status, index) => {
      const delivery: Delivery = {
        deliveryId: index + 1,
        supplierId: 1,
        deliveryDate: '2025-01-01',
        name: `Delivery ${status}`,
        description: 'Status test',
        status,
      };
      expect(delivery.status).toBe(status);
    });
  });

  it('should serialize to JSON correctly', () => {
    const delivery: Delivery = {
      deliveryId: 1,
      supplierId: 1,
      deliveryDate: '2025-07-01',
      name: 'JSON Delivery',
      description: 'Test JSON',
      status: 'pending',
    };

    const json = JSON.stringify(delivery);
    const parsed = JSON.parse(json) as Delivery;

    expect(parsed).toEqual(delivery);
  });
});

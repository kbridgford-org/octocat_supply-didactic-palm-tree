import { describe, it, expect } from 'vitest';
import { Order } from './order';

describe('Order Model', () => {
  it('should create a valid Order object', () => {
    const order: Order = {
      orderId: 1,
      branchId: 1,
      orderDate: '2025-06-15',
      name: 'Order One',
      description: 'First order',
      status: 'pending',
    };

    expect(order.orderId).toBe(1);
    expect(order.branchId).toBe(1);
    expect(order.orderDate).toBe('2025-06-15');
    expect(order.name).toBe('Order One');
    expect(order.description).toBe('First order');
    expect(order.status).toBe('pending');
  });

  it('should have correct property types', () => {
    const order: Order = {
      orderId: 1,
      branchId: 2,
      orderDate: '2025-01-01',
      name: 'Test',
      description: 'Desc',
      status: 'pending',
    };

    expect(typeof order.orderId).toBe('number');
    expect(typeof order.branchId).toBe('number');
    expect(typeof order.orderDate).toBe('string');
    expect(typeof order.name).toBe('string');
    expect(typeof order.description).toBe('string');
    expect(typeof order.status).toBe('string');
  });

  it('should support various status values', () => {
    const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    statuses.forEach((status, index) => {
      const order: Order = {
        orderId: index + 1,
        branchId: 1,
        orderDate: '2025-01-01',
        name: `Order ${status}`,
        description: 'Status test',
        status,
      };
      expect(order.status).toBe(status);
    });
  });

  it('should serialize to JSON correctly', () => {
    const order: Order = {
      orderId: 1,
      branchId: 1,
      orderDate: '2025-06-15',
      name: 'JSON Order',
      description: 'Test JSON',
      status: 'pending',
    };

    const json = JSON.stringify(order);
    const parsed = JSON.parse(json) as Order;

    expect(parsed).toEqual(order);
  });
});

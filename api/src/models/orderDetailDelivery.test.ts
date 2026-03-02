import { describe, it, expect } from 'vitest';
import { OrderDetailDelivery } from './orderDetailDelivery';

describe('OrderDetailDelivery Model', () => {
  it('should create a valid OrderDetailDelivery object', () => {
    const odd: OrderDetailDelivery = {
      orderDetailDeliveryId: 1,
      orderDetailId: 1,
      deliveryId: 1,
      quantity: 3,
      notes: 'Partial shipment',
    };

    expect(odd.orderDetailDeliveryId).toBe(1);
    expect(odd.orderDetailId).toBe(1);
    expect(odd.deliveryId).toBe(1);
    expect(odd.quantity).toBe(3);
    expect(odd.notes).toBe('Partial shipment');
  });

  it('should have correct property types', () => {
    const odd: OrderDetailDelivery = {
      orderDetailDeliveryId: 1,
      orderDetailId: 2,
      deliveryId: 3,
      quantity: 10,
      notes: 'Test',
    };

    expect(typeof odd.orderDetailDeliveryId).toBe('number');
    expect(typeof odd.orderDetailId).toBe('number');
    expect(typeof odd.deliveryId).toBe('number');
    expect(typeof odd.quantity).toBe('number');
    expect(typeof odd.notes).toBe('string');
  });

  it('should represent junction table relationship', () => {
    const odd: OrderDetailDelivery = {
      orderDetailDeliveryId: 1,
      orderDetailId: 5,
      deliveryId: 10,
      quantity: 2,
      notes: 'Links order detail to delivery',
    };

    expect(odd.orderDetailId).toBe(5);
    expect(odd.deliveryId).toBe(10);
  });

  it('should serialize to JSON correctly', () => {
    const odd: OrderDetailDelivery = {
      orderDetailDeliveryId: 1,
      orderDetailId: 1,
      deliveryId: 1,
      quantity: 5,
      notes: 'JSON test',
    };

    const json = JSON.stringify(odd);
    const parsed = JSON.parse(json) as OrderDetailDelivery;

    expect(parsed).toEqual(odd);
  });
});

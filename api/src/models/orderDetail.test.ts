import { describe, it, expect } from 'vitest';
import { OrderDetail } from './orderDetail';

describe('OrderDetail Model', () => {
  it('should create a valid OrderDetail object', () => {
    const orderDetail: OrderDetail = {
      orderDetailId: 1,
      orderId: 1,
      productId: 1,
      quantity: 5,
      unitPrice: 10.0,
      notes: 'Rush order',
    };

    expect(orderDetail.orderDetailId).toBe(1);
    expect(orderDetail.orderId).toBe(1);
    expect(orderDetail.productId).toBe(1);
    expect(orderDetail.quantity).toBe(5);
    expect(orderDetail.unitPrice).toBe(10.0);
    expect(orderDetail.notes).toBe('Rush order');
  });

  it('should have correct property types', () => {
    const orderDetail: OrderDetail = {
      orderDetailId: 1,
      orderId: 2,
      productId: 3,
      quantity: 10,
      unitPrice: 25.5,
      notes: 'Test',
    };

    expect(typeof orderDetail.orderDetailId).toBe('number');
    expect(typeof orderDetail.orderId).toBe('number');
    expect(typeof orderDetail.productId).toBe('number');
    expect(typeof orderDetail.quantity).toBe('number');
    expect(typeof orderDetail.unitPrice).toBe('number');
    expect(typeof orderDetail.notes).toBe('string');
  });

  it('should support numeric calculations', () => {
    const orderDetail: OrderDetail = {
      orderDetailId: 1,
      orderId: 1,
      productId: 1,
      quantity: 3,
      unitPrice: 15.5,
      notes: '',
    };

    const total = orderDetail.quantity * orderDetail.unitPrice;
    expect(total).toBeCloseTo(46.5);
  });

  it('should serialize to JSON correctly', () => {
    const orderDetail: OrderDetail = {
      orderDetailId: 1,
      orderId: 1,
      productId: 1,
      quantity: 5,
      unitPrice: 10.0,
      notes: 'JSON test',
    };

    const json = JSON.stringify(orderDetail);
    const parsed = JSON.parse(json) as OrderDetail;

    expect(parsed).toEqual(orderDetail);
  });
});

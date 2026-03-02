import { describe, it, expect } from 'vitest';
import { Product } from './product';

describe('Product Model', () => {
  it('should create a valid Product object', () => {
    const product: Product = {
      productId: 1,
      supplierId: 1,
      name: 'Widget A',
      description: 'A fine widget',
      price: 9.99,
      sku: 'WID-001',
      unit: 'piece',
      imgName: 'widget-a.png',
    };

    expect(product.productId).toBe(1);
    expect(product.supplierId).toBe(1);
    expect(product.name).toBe('Widget A');
    expect(product.price).toBe(9.99);
    expect(product.sku).toBe('WID-001');
    expect(product.unit).toBe('piece');
    expect(product.imgName).toBe('widget-a.png');
  });

  it('should allow optional discount property', () => {
    const withDiscount: Product = {
      productId: 1,
      supplierId: 1,
      name: 'Discounted Widget',
      description: 'On sale',
      price: 19.99,
      sku: 'WID-002',
      unit: 'box',
      imgName: 'widget-b.png',
      discount: 0.25,
    };

    const withoutDiscount: Product = {
      productId: 2,
      supplierId: 1,
      name: 'Regular Widget',
      description: 'Full price',
      price: 29.99,
      sku: 'WID-003',
      unit: 'piece',
      imgName: 'widget-c.png',
    };

    expect(withDiscount.discount).toBe(0.25);
    expect(withoutDiscount.discount).toBeUndefined();
  });

  it('should have correct property types', () => {
    const product: Product = {
      productId: 1,
      supplierId: 1,
      name: 'Test',
      description: 'Desc',
      price: 5.0,
      sku: 'TST-001',
      unit: 'kg',
      imgName: 'test.png',
    };

    expect(typeof product.productId).toBe('number');
    expect(typeof product.supplierId).toBe('number');
    expect(typeof product.name).toBe('string');
    expect(typeof product.price).toBe('number');
    expect(typeof product.sku).toBe('string');
    expect(typeof product.unit).toBe('string');
  });

  it('should serialize to JSON correctly', () => {
    const product: Product = {
      productId: 1,
      supplierId: 1,
      name: 'JSON Product',
      description: 'Test JSON',
      price: 15.0,
      sku: 'JSON-001',
      unit: 'piece',
      imgName: 'json.png',
      discount: 0.1,
    };

    const json = JSON.stringify(product);
    const parsed = JSON.parse(json) as Product;

    expect(parsed).toEqual(product);
  });
});

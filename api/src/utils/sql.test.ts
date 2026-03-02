import { describe, it, expect } from 'vitest';
import {
  toSnakeCase,
  toCamelCase,
  objectToSnakeCase,
  objectToCamelCase,
  mapDatabaseRows,
  generatePlaceholders,
  buildInsertSQL,
  buildUpdateSQL,
  validateRequiredFields,
  SelectQueryBuilder,
} from './sql';

describe('toSnakeCase', () => {
  it('should convert camelCase to snake_case', () => {
    expect(toSnakeCase('headquartersId')).toBe('headquarters_id');
    expect(toSnakeCase('contactPerson')).toBe('contact_person');
    expect(toSnakeCase('orderDetailDeliveryId')).toBe('order_detail_delivery_id');
  });

  it('should handle already snake_case strings', () => {
    expect(toSnakeCase('name')).toBe('name');
    expect(toSnakeCase('id')).toBe('id');
  });
});

describe('toCamelCase', () => {
  it('should convert snake_case to camelCase', () => {
    expect(toCamelCase('headquarters_id')).toBe('headquartersId');
    expect(toCamelCase('contact_person')).toBe('contactPerson');
    expect(toCamelCase('order_detail_delivery_id')).toBe('orderDetailDeliveryId');
  });

  it('should handle already camelCase strings', () => {
    expect(toCamelCase('name')).toBe('name');
    expect(toCamelCase('id')).toBe('id');
  });
});

describe('objectToSnakeCase', () => {
  it('should convert object keys from camelCase to snake_case', () => {
    const input = { headquartersId: 1, contactPerson: 'John' };
    const result = objectToSnakeCase(input);
    expect(result).toEqual({ headquarters_id: 1, contact_person: 'John' });
  });
});

describe('objectToCamelCase', () => {
  it('should convert object keys from snake_case to camelCase', () => {
    const input = { headquarters_id: 1, contact_person: 'John' };
    const result = objectToCamelCase(input);
    expect(result).toEqual({ headquartersId: 1, contactPerson: 'John' });
  });
});

describe('mapDatabaseRows', () => {
  it('should convert multiple rows', () => {
    const rows = [
      { supplier_id: 1, name: 'A' },
      { supplier_id: 2, name: 'B' },
    ];
    const result = mapDatabaseRows(rows);
    expect(result).toEqual([
      { supplierId: 1, name: 'A' },
      { supplierId: 2, name: 'B' },
    ]);
  });

  it('should return empty array for empty input', () => {
    expect(mapDatabaseRows([])).toEqual([]);
  });
});

describe('generatePlaceholders', () => {
  it('should generate correct number of placeholders', () => {
    expect(generatePlaceholders(1)).toBe('?');
    expect(generatePlaceholders(3)).toBe('?, ?, ?');
    expect(generatePlaceholders(5)).toBe('?, ?, ?, ?, ?');
  });
});

describe('buildInsertSQL', () => {
  it('should build INSERT SQL with correct columns and placeholders', () => {
    const { sql, values } = buildInsertSQL('suppliers', {
      name: 'Test',
      contactPerson: 'John',
    });
    expect(sql).toBe('INSERT INTO suppliers (name, contact_person) VALUES (?, ?)');
    expect(values).toEqual(['Test', 'John']);
  });
});

describe('buildUpdateSQL', () => {
  it('should build UPDATE SQL with correct SET clause', () => {
    const { sql, values } = buildUpdateSQL(
      'suppliers',
      { name: 'Updated', contactPerson: 'Jane' },
      'supplier_id = ?',
    );
    expect(sql).toBe('UPDATE suppliers SET name = ?, contact_person = ? WHERE supplier_id = ?');
    expect(values).toEqual(['Updated', 'Jane']);
  });
});

describe('validateRequiredFields', () => {
  it('should not throw for valid object', () => {
    expect(() => validateRequiredFields({ name: 'Test', email: 'a@b.com' }, ['name', 'email'])).not.toThrow();
  });

  it('should throw for missing field', () => {
    expect(() => validateRequiredFields({ name: 'Test' }, ['name', 'email'])).toThrow("Required field 'email' is missing or empty");
  });

  it('should throw for null field', () => {
    expect(() => validateRequiredFields({ name: null }, ['name'])).toThrow("Required field 'name' is missing or empty");
  });

  it('should throw for empty string field', () => {
    expect(() => validateRequiredFields({ name: '' }, ['name'])).toThrow("Required field 'name' is missing or empty");
  });
});

describe('SelectQueryBuilder', () => {
  it('should build a basic SELECT query', () => {
    const query = new SelectQueryBuilder('suppliers').build();
    expect(query).toBe('SELECT * FROM suppliers');
  });

  it('should build a query with specific columns', () => {
    const query = new SelectQueryBuilder('suppliers').select(['name', 'email']).build();
    expect(query).toBe('SELECT name, email FROM suppliers');
  });

  it('should build a query with WHERE clause', () => {
    const query = new SelectQueryBuilder('suppliers').where('active = 1').build();
    expect(query).toBe('SELECT * FROM suppliers WHERE active = 1');
  });

  it('should build a query with multiple WHERE clauses', () => {
    const query = new SelectQueryBuilder('suppliers')
      .where('active = 1')
      .where('verified = 1')
      .build();
    expect(query).toBe('SELECT * FROM suppliers WHERE active = 1 AND verified = 1');
  });

  it('should build a query with JOIN', () => {
    const query = new SelectQueryBuilder('orders')
      .join('branches', 'orders.branch_id = branches.branch_id')
      .build();
    expect(query).toBe('SELECT * FROM orders INNER JOIN branches ON orders.branch_id = branches.branch_id');
  });

  it('should build a query with LEFT JOIN', () => {
    const query = new SelectQueryBuilder('orders')
      .join('branches', 'orders.branch_id = branches.branch_id', 'LEFT')
      .build();
    expect(query).toBe('SELECT * FROM orders LEFT JOIN branches ON orders.branch_id = branches.branch_id');
  });

  it('should build a query with ORDER BY', () => {
    const query = new SelectQueryBuilder('suppliers').orderBy('name').build();
    expect(query).toBe('SELECT * FROM suppliers ORDER BY name ASC');
  });

  it('should build a query with ORDER BY DESC', () => {
    const query = new SelectQueryBuilder('suppliers').orderBy('name', 'DESC').build();
    expect(query).toBe('SELECT * FROM suppliers ORDER BY name DESC');
  });

  it('should build a query with LIMIT', () => {
    const query = new SelectQueryBuilder('suppliers').limit(10).build();
    expect(query).toBe('SELECT * FROM suppliers LIMIT 10');
  });

  it('should build a query with OFFSET', () => {
    const query = new SelectQueryBuilder('suppliers').limit(10).offset(20).build();
    expect(query).toBe('SELECT * FROM suppliers LIMIT 10 OFFSET 20');
  });

  it('should build a complex query with all clauses', () => {
    const query = new SelectQueryBuilder('orders')
      .select(['orders.order_id', 'branches.name'])
      .join('branches', 'orders.branch_id = branches.branch_id')
      .where('orders.status = ?')
      .orderBy('orders.order_id', 'DESC')
      .limit(10)
      .offset(0)
      .build();
    expect(query).toBe(
      'SELECT orders.order_id, branches.name FROM orders INNER JOIN branches ON orders.branch_id = branches.branch_id WHERE orders.status = ? ORDER BY orders.order_id DESC LIMIT 10 OFFSET 0',
    );
  });
});

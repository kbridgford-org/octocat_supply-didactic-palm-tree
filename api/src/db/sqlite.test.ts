import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getDatabase, closeDatabase, DatabaseConnection } from './sqlite';

describe('SQLite Database', () => {
  afterEach(async () => {
    await closeDatabase();
  });

  it('should create an in-memory database connection', async () => {
    const db = await getDatabase(true);
    expect(db).toBeDefined();
    expect(db.db).toBeDefined();
  });

  it('should return the same connection on repeated calls', async () => {
    const db1 = await getDatabase(true);
    const db2 = await getDatabase(true);
    expect(db1).toBe(db2);
  });

  it('should execute run statements', async () => {
    const db = await getDatabase(true);
    await db.run('CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)');
    const result = await db.run('INSERT INTO test (name) VALUES (?)', ['hello']);
    expect(result.lastID).toBeDefined();
    expect(result.changes).toBe(1);
  });

  it('should execute get queries', async () => {
    const db = await getDatabase(true);
    await db.run('CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)');
    await db.run('INSERT INTO test (name) VALUES (?)', ['hello']);
    const row = await db.get<{ id: number; name: string }>('SELECT * FROM test WHERE id = ?', [1]);
    expect(row).toBeDefined();
    expect(row?.name).toBe('hello');
  });

  it('should execute all queries', async () => {
    const db = await getDatabase(true);
    await db.run('CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)');
    await db.run('INSERT INTO test (name) VALUES (?)', ['a']);
    await db.run('INSERT INTO test (name) VALUES (?)', ['b']);
    const rows = await db.all<{ id: number; name: string }>('SELECT * FROM test');
    expect(rows).toHaveLength(2);
  });

  it('should return undefined for get when no row found', async () => {
    const db = await getDatabase(true);
    await db.run('CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)');
    const row = await db.get<{ id: number }>('SELECT * FROM test WHERE id = ?', [999]);
    expect(row).toBeUndefined();
  });

  it('should close and reopen the database', async () => {
    const db1 = await getDatabase(true);
    await closeDatabase();
    const db2 = await getDatabase(true);
    expect(db2).toBeDefined();
    expect(db2).not.toBe(db1);
  });

  it('should handle closeDatabase when no connection exists', async () => {
    await closeDatabase();
    await closeDatabase(); // should not throw
  });
});

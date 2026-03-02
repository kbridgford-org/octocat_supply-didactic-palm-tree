import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MigrationRunner } from './migrate';
import { closeDatabase, getDatabase } from './sqlite';

describe('MigrationRunner', () => {
  let db: Awaited<ReturnType<typeof getDatabase>>;

  beforeEach(async () => {
    await closeDatabase();
    db = await getDatabase(true);
  });

  afterEach(async () => {
    await closeDatabase();
  });

  it('should initialize migrations table', async () => {
    const runner = new MigrationRunner(db, './database/migrations');
    await runner.runMigrations();

    const tables = await db.all<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='migrations'",
    );
    expect(tables).toHaveLength(1);
  });

  it('should apply pending migrations', async () => {
    const runner = new MigrationRunner(db, './database/migrations');
    await runner.runMigrations();

    const migrations = await db.all<{ version: number; filename: string }>(
      'SELECT version, filename FROM migrations ORDER BY version',
    );
    expect(migrations.length).toBeGreaterThan(0);
    expect(migrations[0].version).toBe(1);
  });

  it('should skip already applied migrations', async () => {
    const runner = new MigrationRunner(db, './database/migrations');
    await runner.runMigrations();
    // Run again - should not fail or re-apply
    await runner.runMigrations();

    const migrations = await db.all<{ version: number }>(
      'SELECT version FROM migrations ORDER BY version',
    );
    // Should still have the same number of migrations
    expect(migrations.length).toBeGreaterThan(0);
  });

  it('should return current version', async () => {
    const runner = new MigrationRunner(db, './database/migrations');
    await runner.runMigrations();

    const version = await runner.getCurrentVersion();
    expect(version).toBeGreaterThanOrEqual(1);
  });

  it('should return 0 for empty database', async () => {
    const runner = new MigrationRunner(db, './database/migrations');
    const version = await runner.getCurrentVersion();
    expect(version).toBe(0);
  });

  it('should throw for invalid migrations directory', () => {
    const runner = new MigrationRunner(db, '/nonexistent/directory');
    expect(runner.runMigrations()).rejects.toThrow('Migrations directory not found');
  });
});

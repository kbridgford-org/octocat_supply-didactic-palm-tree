import { describe, it, expect } from 'vitest';
import {
  DatabaseError,
  NotFoundError,
  ValidationError,
  ConflictError,
  handleDatabaseError,
  errorHandler,
} from './errors';
import type { Request, Response, NextFunction } from 'express';

describe('Error Classes', () => {
  it('should create a DatabaseError with defaults', () => {
    const error = new DatabaseError('test error');
    expect(error.message).toBe('test error');
    expect(error.code).toBe('DATABASE_ERROR');
    expect(error.statusCode).toBe(500);
    expect(error.name).toBe('DatabaseError');
    expect(error instanceof Error).toBe(true);
  });

  it('should create a DatabaseError with custom code and status', () => {
    const error = new DatabaseError('custom', 'CUSTOM_CODE', 503);
    expect(error.code).toBe('CUSTOM_CODE');
    expect(error.statusCode).toBe(503);
  });

  it('should create a NotFoundError', () => {
    const error = new NotFoundError('Product', 42);
    expect(error.message).toBe('Product with ID 42 not found');
    expect(error.code).toBe('NOT_FOUND');
    expect(error.statusCode).toBe(404);
    expect(error.name).toBe('NotFoundError');
    expect(error instanceof DatabaseError).toBe(true);
  });

  it('should create a ValidationError', () => {
    const error = new ValidationError('invalid field');
    expect(error.message).toBe('Validation error: invalid field');
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.statusCode).toBe(400);
    expect(error.name).toBe('ValidationError');
  });

  it('should create a ConflictError', () => {
    const error = new ConflictError('duplicate entry');
    expect(error.message).toBe('Conflict: duplicate entry');
    expect(error.code).toBe('CONFLICT');
    expect(error.statusCode).toBe(409);
    expect(error.name).toBe('ConflictError');
  });
});

describe('handleDatabaseError', () => {
  it('should wrap non-DatabaseError as DatabaseError', () => {
    expect(() => handleDatabaseError(new Error('generic error'))).toThrow(DatabaseError);
    expect(() => handleDatabaseError(new Error('generic error'))).toThrow('Database operation failed: generic error');
  });

  it('should wrap non-Error values as DatabaseError', () => {
    expect(() => handleDatabaseError('string error')).toThrow(DatabaseError);
  });

  it('should rethrow DatabaseError directly', () => {
    const original = new DatabaseError('test', 'SOME_CODE', 500);
    expect(() => handleDatabaseError(original)).toThrow(original);
  });

  it('should convert SQLITE_CONSTRAINT UNIQUE to ConflictError', () => {
    const error = new DatabaseError('UNIQUE constraint failed', 'SQLITE_CONSTRAINT', 500);
    expect(() => handleDatabaseError(error)).toThrow(ConflictError);
  });

  it('should convert SQLITE_CONSTRAINT FOREIGN KEY to ValidationError', () => {
    const error = new DatabaseError('FOREIGN KEY constraint failed', 'SQLITE_CONSTRAINT', 500);
    expect(() => handleDatabaseError(error)).toThrow(ValidationError);
  });

  it('should convert generic SQLITE_CONSTRAINT to ValidationError', () => {
    const error = new DatabaseError('CHECK constraint failed', 'SQLITE_CONSTRAINT', 500);
    expect(() => handleDatabaseError(error)).toThrow(ValidationError);
  });

  it('should convert SQLITE_BUSY to DatabaseError with 503', () => {
    const error = new DatabaseError('database locked', 'SQLITE_BUSY', 500);
    try {
      handleDatabaseError(error);
    } catch (e) {
      expect(e).toBeInstanceOf(DatabaseError);
      expect((e as DatabaseError).statusCode).toBe(503);
      expect((e as DatabaseError).code).toBe('DATABASE_BUSY');
    }
  });

  it('should convert No rows affected to NotFoundError', () => {
    const error = new DatabaseError('No rows affected', 'DATABASE_ERROR', 500);
    expect(() => handleDatabaseError(error, 'Product', 99)).toThrow(NotFoundError);
  });
});

describe('errorHandler middleware', () => {
  const mockRequest = {} as Request;
  const mockNext = (() => {}) as NextFunction;

  function createMockResponse() {
    const res = {
      statusCode: 0,
      body: null as unknown,
      status(code: number) {
        res.statusCode = code;
        return res;
      },
      json(data: unknown) {
        res.body = data;
        return res;
      },
    };
    return res as unknown as Response;
  }

  it('should handle DatabaseError with correct status and body', () => {
    const error = new NotFoundError('Product', 1);
    const res = createMockResponse();

    errorHandler(error, mockRequest, res, mockNext);

    expect((res as any).statusCode).toBe(404);
    expect((res as any).body).toEqual({
      error: {
        code: 'NOT_FOUND',
        message: 'Product with ID 1 not found',
      },
    });
  });

  it('should handle unknown errors with 500', () => {
    const error = new Error('unexpected');
    const res = createMockResponse();

    errorHandler(error, mockRequest, res, mockNext);

    expect((res as any).statusCode).toBe(500);
    expect((res as any).body).toEqual({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    });
  });
});

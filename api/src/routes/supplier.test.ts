import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import supplierRouter from './supplier';
import { runMigrations } from '../db/migrate';
import { closeDatabase, getDatabase } from '../db/sqlite';
import { errorHandler } from '../utils/errors';

let app: express.Express;

describe('Supplier API', () => {
  beforeEach(async () => {
    await closeDatabase();
    await getDatabase(true);
    await runMigrations(true);

    app = express();
    app.use(express.json());
    app.use('/suppliers', supplierRouter);
    app.use(errorHandler);
  });

  afterEach(async () => {
    await closeDatabase();
  });

  it('should create a new supplier', async () => {
    const newSupplier = {
      name: 'Test Supplier',
      description: 'Test supplier description',
      contactPerson: 'Alice Johnson',
      email: 'alice@supplier.com',
      phone: '555-1000',
      active: 1,
      verified: 0,
    };
    const response = await request(app).post('/suppliers').send(newSupplier);
    expect(response.status).toBe(201);
    expect(response.body.name).toBe('Test Supplier');
    expect(response.body.active).toBe(true);
    expect(response.body.verified).toBe(false);
    expect(response.body.supplierId).toBeDefined();
  });

  it('should get all suppliers', async () => {
    const response = await request(app).get('/suppliers');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should get a supplier by ID', async () => {
    const newSupplier = {
      name: 'Fetch Supplier',
      description: 'Supplier to fetch',
      contactPerson: 'Bob Builder',
      email: 'bob@supplier.com',
      phone: '555-2000',
      active: 1,
      verified: 1,
    };
    const createResponse = await request(app).post('/suppliers').send(newSupplier);
    const supplierId = createResponse.body.supplierId;

    const response = await request(app).get(`/suppliers/${supplierId}`);
    expect(response.status).toBe(200);
    expect(response.body.supplierId).toBe(supplierId);
  });

  it('should update a supplier by ID', async () => {
    const newSupplier = {
      name: 'Original Supplier',
      description: 'Original description',
      contactPerson: 'Original Person',
      email: 'original@supplier.com',
      phone: '555-3000',
      active: 1,
      verified: 0,
    };
    const createResponse = await request(app).post('/suppliers').send(newSupplier);
    const supplierId = createResponse.body.supplierId;

    const updatedSupplier = {
      ...newSupplier,
      name: 'Updated Supplier Name',
    };
    const response = await request(app).put(`/suppliers/${supplierId}`).send(updatedSupplier);
    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Updated Supplier Name');
  });

  it('should delete a supplier by ID', async () => {
    const newSupplier = {
      name: 'Delete Supplier',
      description: 'This supplier will be deleted',
      contactPerson: 'Delete Person',
      email: 'delete@supplier.com',
      phone: '555-9999',
      active: 0,
      verified: 0,
    };
    const createResponse = await request(app).post('/suppliers').send(newSupplier);
    const supplierId = createResponse.body.supplierId;

    const response = await request(app).delete(`/suppliers/${supplierId}`);
    expect(response.status).toBe(204);
  });

  it('should return 404 for non-existing supplier', async () => {
    const response = await request(app).get('/suppliers/999');
    expect(response.status).toBe(404);
  });

  it('should return 404 when updating a non-existing supplier', async () => {
    const response = await request(app).put('/suppliers/999').send({
      name: 'Ghost Supplier',
    });
    expect(response.status).toBe(404);
  });

  it('should return 404 when deleting a non-existing supplier', async () => {
    const response = await request(app).delete('/suppliers/999');
    expect(response.status).toBe(404);
  });

  it('should get supplier status by ID', async () => {
    const newSupplier = {
      name: 'Status Supplier',
      description: 'Test status',
      contactPerson: 'Status Person',
      email: 'status@supplier.com',
      phone: '555-5000',
      active: 1,
      verified: 1,
    };
    const createResponse = await request(app).post('/suppliers').send(newSupplier);
    const supplierId = createResponse.body.supplierId;

    const response = await request(app).get(`/suppliers/${supplierId}/status`);
    expect(response.status).toBe(200);
    expect(response.body.status).toBeDefined();
  });

  it('should return 404 for status of non-existing supplier', async () => {
    const response = await request(app).get('/suppliers/999/status');
    expect(response.status).toBe(404);
  });
});

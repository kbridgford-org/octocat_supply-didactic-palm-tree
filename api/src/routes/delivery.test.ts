import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import deliveryRouter from './delivery';
import { runMigrations } from '../db/migrate';
import { closeDatabase, getDatabase } from '../db/sqlite';
import { errorHandler } from '../utils/errors';

let app: express.Express;

describe('Delivery API', () => {
  beforeEach(async () => {
    await closeDatabase();
    await getDatabase(true);
    await runMigrations(true);

    // Seed required foreign key: supplier id 1
    const db = await getDatabase();
    await db.run('INSERT INTO suppliers (supplier_id, name) VALUES (?, ?)', [1, 'Test Supplier']);

    app = express();
    app.use(express.json());
    app.use('/deliveries', deliveryRouter);
    app.use(errorHandler);
  });

  afterEach(async () => {
    await closeDatabase();
  });

  it('should create a new delivery', async () => {
    const newDelivery = {
      supplierId: 1,
      deliveryDate: '2025-06-15',
      name: 'Delivery One',
      description: 'First delivery',
      status: 'pending',
    };
    const response = await request(app).post('/deliveries').send(newDelivery);
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject(newDelivery);
    expect(response.body.deliveryId).toBeDefined();
  });

  it('should get all deliveries', async () => {
    const response = await request(app).get('/deliveries');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should get a delivery by ID', async () => {
    const newDelivery = {
      supplierId: 1,
      deliveryDate: '2025-07-01',
      name: 'Fetch Delivery',
      description: 'Delivery to fetch',
      status: 'pending',
    };
    const createResponse = await request(app).post('/deliveries').send(newDelivery);
    const deliveryId = createResponse.body.deliveryId;

    const response = await request(app).get(`/deliveries/${deliveryId}`);
    expect(response.status).toBe(200);
    expect(response.body.deliveryId).toBe(deliveryId);
  });

  it('should update a delivery by ID', async () => {
    const newDelivery = {
      supplierId: 1,
      deliveryDate: '2025-08-01',
      name: 'Original Delivery',
      description: 'Original description',
      status: 'pending',
    };
    const createResponse = await request(app).post('/deliveries').send(newDelivery);
    const deliveryId = createResponse.body.deliveryId;

    const updatedDelivery = {
      ...newDelivery,
      name: 'Updated Delivery Name',
    };
    const response = await request(app).put(`/deliveries/${deliveryId}`).send(updatedDelivery);
    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Updated Delivery Name');
  });

  it('should delete a delivery by ID', async () => {
    const newDelivery = {
      supplierId: 1,
      deliveryDate: '2025-09-01',
      name: 'Delete Delivery',
      description: 'This delivery will be deleted',
      status: 'pending',
    };
    const createResponse = await request(app).post('/deliveries').send(newDelivery);
    const deliveryId = createResponse.body.deliveryId;

    const response = await request(app).delete(`/deliveries/${deliveryId}`);
    expect(response.status).toBe(204);
  });

  it('should return 404 for non-existing delivery', async () => {
    const response = await request(app).get('/deliveries/999');
    expect(response.status).toBe(404);
  });

  it('should return 404 when updating a non-existing delivery', async () => {
    const response = await request(app).put('/deliveries/999').send({
      name: 'Ghost Delivery',
    });
    expect(response.status).toBe(404);
  });

  it('should return 404 when deleting a non-existing delivery', async () => {
    const response = await request(app).delete('/deliveries/999');
    expect(response.status).toBe(404);
  });

  it('should update delivery status', async () => {
    const newDelivery = {
      supplierId: 1,
      deliveryDate: '2025-10-01',
      name: 'Status Delivery',
      description: 'Test status update',
      status: 'pending',
    };
    const createResponse = await request(app).post('/deliveries').send(newDelivery);
    const deliveryId = createResponse.body.deliveryId;

    const response = await request(app).put(`/deliveries/${deliveryId}/status`).send({
      status: 'in-transit',
    });
    expect(response.status).toBe(200);
  });

  it('should return 404 when updating status of non-existing delivery', async () => {
    const response = await request(app).put('/deliveries/999/status').send({
      status: 'in-transit',
    });
    expect(response.status).toBe(404);
  });
});

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import orderDetailDeliveryRouter from './orderDetailDelivery';
import { runMigrations } from '../db/migrate';
import { closeDatabase, getDatabase } from '../db/sqlite';
import { errorHandler } from '../utils/errors';

let app: express.Express;

describe('OrderDetailDelivery API', () => {
  beforeEach(async () => {
    await closeDatabase();
    await getDatabase(true);
    await runMigrations(true);

    // Seed required foreign keys chain
    const db = await getDatabase();
    await db.run('INSERT INTO suppliers (supplier_id, name) VALUES (?, ?)', [1, 'Test Supplier']);
    await db.run('INSERT INTO products (product_id, supplier_id, name, price, sku, unit) VALUES (?, ?, ?, ?, ?, ?)', [1, 1, 'Widget', 10.0, 'WID-001', 'piece']);
    await db.run('INSERT INTO headquarters (headquarters_id, name) VALUES (?, ?)', [1, 'HQ One']);
    await db.run('INSERT INTO branches (branch_id, headquarters_id, name) VALUES (?, ?, ?)', [1, 1, 'Branch One']);
    await db.run('INSERT INTO orders (order_id, branch_id, order_date, name, status) VALUES (?, ?, ?, ?, ?)', [1, 1, '2025-06-15', 'Order One', 'pending']);
    await db.run('INSERT INTO order_details (order_detail_id, order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?, ?)', [1, 1, 1, 5, 10.0]);
    await db.run('INSERT INTO deliveries (delivery_id, supplier_id, delivery_date, name, status) VALUES (?, ?, ?, ?, ?)', [1, 1, '2025-07-01', 'Delivery One', 'pending']);

    app = express();
    app.use(express.json());
    app.use('/order-detail-deliveries', orderDetailDeliveryRouter);
    app.use(errorHandler);
  });

  afterEach(async () => {
    await closeDatabase();
  });

  it('should create a new order detail delivery', async () => {
    const newODD = {
      orderDetailId: 1,
      deliveryId: 1,
      quantity: 3,
      notes: 'Partial shipment',
    };
    const response = await request(app).post('/order-detail-deliveries').send(newODD);
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject(newODD);
    expect(response.body.orderDetailDeliveryId).toBeDefined();
  });

  it('should get all order detail deliveries', async () => {
    const response = await request(app).get('/order-detail-deliveries');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should get an order detail delivery by ID', async () => {
    const newODD = {
      orderDetailId: 1,
      deliveryId: 1,
      quantity: 2,
      notes: 'Test note',
    };
    const createResponse = await request(app).post('/order-detail-deliveries').send(newODD);
    const oddId = createResponse.body.orderDetailDeliveryId;

    const response = await request(app).get(`/order-detail-deliveries/${oddId}`);
    expect(response.status).toBe(200);
    expect(response.body.orderDetailDeliveryId).toBe(oddId);
  });

  it('should update an order detail delivery by ID', async () => {
    const newODD = {
      orderDetailId: 1,
      deliveryId: 1,
      quantity: 1,
      notes: 'Original note',
    };
    const createResponse = await request(app).post('/order-detail-deliveries').send(newODD);
    const oddId = createResponse.body.orderDetailDeliveryId;

    const updatedODD = {
      ...newODD,
      quantity: 5,
    };
    const response = await request(app).put(`/order-detail-deliveries/${oddId}`).send(updatedODD);
    expect(response.status).toBe(200);
    expect(response.body.quantity).toBe(5);
  });

  it('should delete an order detail delivery by ID', async () => {
    const newODD = {
      orderDetailId: 1,
      deliveryId: 1,
      quantity: 1,
      notes: 'Delete me',
    };
    const createResponse = await request(app).post('/order-detail-deliveries').send(newODD);
    const oddId = createResponse.body.orderDetailDeliveryId;

    const response = await request(app).delete(`/order-detail-deliveries/${oddId}`);
    expect(response.status).toBe(204);
  });

  it('should return 404 for non-existing order detail delivery', async () => {
    const response = await request(app).get('/order-detail-deliveries/999');
    expect(response.status).toBe(404);
  });

  it('should return 404 when updating a non-existing order detail delivery', async () => {
    const response = await request(app).put('/order-detail-deliveries/999').send({
      quantity: 100,
    });
    expect(response.status).toBe(404);
  });

  it('should return 404 when deleting a non-existing order detail delivery', async () => {
    const response = await request(app).delete('/order-detail-deliveries/999');
    expect(response.status).toBe(404);
  });
});

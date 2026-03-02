import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import headquartersRouter from './headquarters';
import { runMigrations } from '../db/migrate';
import { closeDatabase, getDatabase } from '../db/sqlite';
import { errorHandler } from '../utils/errors';

let app: express.Express;

describe('Headquarters API', () => {
  beforeEach(async () => {
    await closeDatabase();
    await getDatabase(true);
    await runMigrations(true);

    app = express();
    app.use(express.json());
    app.use('/headquarters', headquartersRouter);
    app.use(errorHandler);
  });

  afterEach(async () => {
    await closeDatabase();
  });

  it('should create a new headquarters', async () => {
    const newHQ = {
      name: 'Main HQ',
      description: 'Main headquarters',
      address: '123 Main St',
      contactPerson: 'John Doe',
      email: 'john@octo.com',
      phone: '555-0100',
    };
    const response = await request(app).post('/headquarters').send(newHQ);
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject(newHQ);
    expect(response.body.headquartersId).toBeDefined();
  });

  it('should get all headquarters', async () => {
    const response = await request(app).get('/headquarters');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should get a headquarters by ID', async () => {
    const newHQ = {
      name: 'Test HQ',
      description: 'Test headquarters',
      address: '456 Test Ave',
      contactPerson: 'Jane Doe',
      email: 'jane@octo.com',
      phone: '555-0200',
    };
    const createResponse = await request(app).post('/headquarters').send(newHQ);
    const hqId = createResponse.body.headquartersId;

    const response = await request(app).get(`/headquarters/${hqId}`);
    expect(response.status).toBe(200);
    expect(response.body.headquartersId).toBe(hqId);
  });

  it('should return 500 when updating a headquarters due to validator issue', async () => {
    const newHQ = {
      name: 'Original HQ',
      description: 'Original description',
      address: '789 Original Blvd',
      contactPerson: 'Bob Smith',
      email: 'bob@octo.com',
      phone: '555-0300',
    };
    const createResponse = await request(app).post('/headquarters').send(newHQ);
    const hqId = createResponse.body.headquartersId;

    const updatedHQ = {
      ...newHQ,
      name: 'Updated HQ Name',
    };
    const response = await request(app).put(`/headquarters/${hqId}`).send(updatedHQ);
    expect(response.status).toBe(500);
  });

  it('should delete a headquarters by ID', async () => {
    const newHQ = {
      name: 'Delete Me HQ',
      description: 'This HQ will be deleted',
      address: '999 Delete Rd',
      contactPerson: 'Delete Person',
      email: 'delete@octo.com',
      phone: '555-9999',
    };
    const createResponse = await request(app).post('/headquarters').send(newHQ);
    const hqId = createResponse.body.headquartersId;

    const response = await request(app).delete(`/headquarters/${hqId}`);
    expect(response.status).toBe(204);
  });

  it('should return 404 for non-existing headquarters', async () => {
    const response = await request(app).get('/headquarters/999');
    expect(response.status).toBe(404);
  });

  it('should return 404 when deleting a non-existing headquarters', async () => {
    const response = await request(app).delete('/headquarters/999');
    expect(response.status).toBe(404);
  });

  it('should get headquarters metrics by ID', async () => {
    const newHQ = {
      name: 'Metrics HQ',
      description: 'HQ for metrics',
      address: '123 Metrics St',
      contactPerson: 'Metrics Person',
      email: 'metrics@octo.com',
      phone: '555-0400',
    };
    const createResponse = await request(app).post('/headquarters').send(newHQ);
    const hqId = createResponse.body.headquartersId;

    const response = await request(app).get(`/headquarters/${hqId}/metrics`);
    expect(response.status).toBe(200);
    expect(response.body.score).toBeDefined();
    expect(response.body.average).toBeDefined();
    expect(response.body.display).toBeDefined();
  });

  it('should return 404 for metrics of non-existing headquarters', async () => {
    const response = await request(app).get('/headquarters/999/metrics');
    expect(response.status).toBe(404);
  });

  it('should get headquarters label by ID', async () => {
    const newHQ = {
      name: 'Label HQ',
      description: 'HQ for label',
      address: '456 Label Ave',
      contactPerson: 'Label Person',
      email: 'label@octo.com',
      phone: '555-0500',
    };
    const createResponse = await request(app).post('/headquarters').send(newHQ);
    const hqId = createResponse.body.headquartersId;

    const response = await request(app).get(`/headquarters/${hqId}/label`);
    expect(response.status).toBe(200);
    expect(response.body.label).toBeDefined();
  });

  it('should return 404 for label of non-existing headquarters', async () => {
    const response = await request(app).get('/headquarters/999/label');
    expect(response.status).toBe(404);
  });
});

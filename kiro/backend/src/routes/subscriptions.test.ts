import request from 'supertest';
import app from '../app';

describe('GET /subscriptions', () => {
  it('returns all subscriptions as JSON array', async () => {
    const res = await request(app).get('/subscriptions');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(5);
  });

  it('each subscription has required fields', async () => {
    const res = await request(app).get('/subscriptions');
    for (const sub of res.body) {
      expect(sub).toHaveProperty('id');
      expect(sub).toHaveProperty('name');
      expect(sub).toHaveProperty('cost');
      expect(sub).toHaveProperty('billingCycle');
      expect(sub).toHaveProperty('status');
      expect(sub).toHaveProperty('nextRenewalDate');
    }
  });
});

describe('POST /subscriptions', () => {
  const validSubscription = {
    name: 'Test Service',
    cost: 19.99,
    billingCycle: 'MONTHLY',
    status: 'ACTIVE',
    nextRenewalDate: '2025-08-01',
  };

  it('creates a subscription with ADMIN role', async () => {
    const res = await request(app)
      .post('/subscriptions')
      .set('X-User-Role', 'ADMIN')
      .send(validSubscription);
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Test Service');
    expect(res.body.id).toBeDefined();
  });

  it('rejects with 403 without ADMIN role', async () => {
    const res = await request(app)
      .post('/subscriptions')
      .set('X-User-Role', 'VIEWER')
      .send(validSubscription);
    expect(res.status).toBe(403);
  });

  it('rejects with 403 without role header', async () => {
    const res = await request(app)
      .post('/subscriptions')
      .send(validSubscription);
    expect(res.status).toBe(403);
  });

  it('rejects invalid input with 400', async () => {
    const res = await request(app)
      .post('/subscriptions')
      .set('X-User-Role', 'ADMIN')
      .send({ name: '', cost: -5, billingCycle: 'INVALID', status: 'ACTIVE', nextRenewalDate: 'bad' });
    expect(res.status).toBe(400);
  });
});

describe('PUT /subscriptions/:id', () => {
  it('updates an existing subscription', async () => {
    const getRes = await request(app).get('/subscriptions');
    const sub = getRes.body[0];

    const res = await request(app)
      .put(`/subscriptions/${sub.id}`)
      .set('X-User-Role', 'ADMIN')
      .send({ name: 'Updated Name' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Name');
  });

  it('returns 404 for non-existent id', async () => {
    const res = await request(app)
      .put('/subscriptions/non-existent-id-99999')
      .set('X-User-Role', 'ADMIN')
      .send({ name: 'No one' });
    expect(res.status).toBe(404);
  });

  it('rejects with 403 without ADMIN role', async () => {
    const getRes = await request(app).get('/subscriptions');
    const sub = getRes.body[0];
    const res = await request(app)
      .put(`/subscriptions/${sub.id}`)
      .set('X-User-Role', 'VIEWER')
      .send({ name: 'Blocked' });
    expect(res.status).toBe(403);
  });
});

describe('DELETE /subscriptions/:id', () => {
  it('deletes an existing subscription', async () => {
    // First create one to delete
    const createRes = await request(app)
      .post('/subscriptions')
      .set('X-User-Role', 'ADMIN')
      .send({
        name: 'To Delete',
        cost: 5.00,
        billingCycle: 'MONTHLY',
        status: 'PAUSED',
        nextRenewalDate: '2025-12-01',
      });
    const id = createRes.body.id;

    const res = await request(app)
      .delete(`/subscriptions/${id}`)
      .set('X-User-Role', 'ADMIN');
    expect(res.status).toBe(204);
  });

  it('returns 404 for non-existent id', async () => {
    const res = await request(app)
      .delete('/subscriptions/non-existent-id-99999')
      .set('X-User-Role', 'ADMIN');
    expect(res.status).toBe(404);
  });

  it('rejects with 403 without ADMIN role', async () => {
    const getRes = await request(app).get('/subscriptions');
    const sub = getRes.body[0];
    const res = await request(app)
      .delete(`/subscriptions/${sub.id}`)
      .set('X-User-Role', 'VIEWER');
    expect(res.status).toBe(403);
  });
});

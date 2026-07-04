import { Router } from 'express';
import * as store from '../store/subscriptionStore';
import { SubscriptionSchema } from '../models/subscription';
import { requireAdmin } from '../middleware/rbac';

const router = Router();

// GET all subscriptions (public)
router.get('/', (req, res) => {
  res.json(store.getAll());
});

// POST create (admin only)
router.post('/', requireAdmin, (req, res) => {
  const result = SubscriptionSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.issues });
    return;
  }
  const created = store.create(result.data);
  res.status(201).json(created);
});

// PUT update (admin only)
router.put('/:id', requireAdmin, (req, res) => {
  const result = SubscriptionSchema.partial().safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.issues });
    return;
  }
  const updated = store.update(req.params.id, result.data);
  if (!updated) {
    res.status(404).json({ error: 'Subscription not found' });
    return;
  }
  res.json(updated);
});

// DELETE (admin only)
router.delete('/:id', requireAdmin, (req, res) => {
  const deleted = store.remove(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: 'Subscription not found' });
    return;
  }
  res.status(204).send();
});

export default router;

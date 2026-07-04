import { Subscription } from '../types';

const BASE_URL = 'http://localhost:3001';

export const fetchSubscriptions = async (): Promise<Subscription[]> => {
  const res = await fetch(`${BASE_URL}/subscriptions`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

export const createSubscription = async (
  data: Omit<Subscription, 'id'>,
  role: string
): Promise<Subscription> => {
  const res = await fetch(`${BASE_URL}/subscriptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-User-Role': role },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create');
  return res.json();
};

export const updateSubscription = async (
  id: string,
  data: Partial<Omit<Subscription, 'id'>>,
  role: string
): Promise<Subscription> => {
  const res = await fetch(`${BASE_URL}/subscriptions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-User-Role': role },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update');
  return res.json();
};

export const deleteSubscription = async (id: string, role: string): Promise<void> => {
  const res = await fetch(`${BASE_URL}/subscriptions/${id}`, {
    method: 'DELETE',
    headers: { 'X-User-Role': role },
  });
  if (!res.ok) throw new Error('Failed to delete');
};

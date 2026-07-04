import { v4 as uuidv4 } from 'uuid';
import { Subscription } from '../models/subscription';
import { seedData } from '../seed';

let subscriptions: Subscription[] = [...seedData];

export const getAll = (): Subscription[] => [...subscriptions];

export const create = (data: Omit<Subscription, 'id'>): Subscription => {
  const subscription: Subscription = { id: uuidv4(), ...data };
  subscriptions.push(subscription);
  return subscription;
};

export const update = (id: string, data: Partial<Omit<Subscription, 'id'>>): Subscription | null => {
  const index = subscriptions.findIndex(s => s.id === id);
  if (index === -1) return null;
  subscriptions[index] = { ...subscriptions[index], ...data };
  return subscriptions[index];
};

export const remove = (id: string): boolean => {
  const index = subscriptions.findIndex(s => s.id === id);
  if (index === -1) return false;
  subscriptions.splice(index, 1);
  return true;
};

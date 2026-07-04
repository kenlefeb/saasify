import React, { createContext, useState, useEffect, useMemo } from 'react';

export const SubscriptionContext = createContext(null);

const DEFAULT_SUBSCRIPTIONS = [
  { id: '1', name: 'GitHub Enterprise', cost: 240.00, billingCycle: 'ANNUAL', status: 'ACTIVE', nextRenewalDate: '2026-07-08' },
  { id: '2', name: 'Slack', cost: 15.00, billingCycle: 'MONTHLY', status: 'ACTIVE', nextRenewalDate: '2026-07-15' },
  { id: '3', name: 'Zoom', cost: 20.00, billingCycle: 'MONTHLY', status: 'PAUSED', nextRenewalDate: '2026-08-01' }
];

export const SubscriptionProvider = ({ children }) => {
  const [subscriptions, setSubscriptions] = useState(() => {
    const saved = localStorage.getItem('saasify_subscriptions');
    return saved ? JSON.parse(saved) : DEFAULT_SUBSCRIPTIONS;
  });

  const [currentUser, setCurrentUser] = useState('ADMIN');
  const [currentSystemDate, setCurrentSystemDate] = useState('2026-07-03');

  useEffect(() => {
    localStorage.setItem('saasify_subscriptions', JSON.stringify(subscriptions));
  }, [subscriptions]);

  const totalProjectedMonthlySpend = useMemo(() => {
    return subscriptions.reduce((total, sub) => {
      if (sub.status !== 'ACTIVE') return total;
      const cost = parseFloat(sub.cost) || 0;
      if (sub.billingCycle === 'MONTHLY') {
        return total + cost;
      } else if (sub.billingCycle === 'ANNUAL') {
        return total + (cost / 12);
      }
      return total;
    }, 0);
  }, [subscriptions]);

  const activeSubscriptionsCount = useMemo(() => {
    return subscriptions.filter(sub => sub.status === 'ACTIVE').length;
  }, [subscriptions]);

  const addSubscription = (newSub) => {
    if (currentUser !== 'ADMIN') return;
    const item = { ...newSub, id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11) };
    setSubscriptions(prev => [...prev, item]);
  };

  const updateSubscription = (id, updatedFields) => {
    if (currentUser !== 'ADMIN') return;
    setSubscriptions(prev => prev.map(sub => sub.id === id ? { ...sub, ...updatedFields } : sub));
  };

  const deleteSubscription = (id) => {
    if (currentUser !== 'ADMIN') return;
    setSubscriptions(prev => prev.filter(sub => sub.id !== id));
  };

  return (
    <SubscriptionContext.Provider value={{
      subscriptions,
      currentUser,
      setCurrentUser,
      currentSystemDate,
      setCurrentSystemDate,
      totalProjectedMonthlySpend,
      activeSubscriptionsCount,
      addSubscription,
      updateSubscription,
      deleteSubscription
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

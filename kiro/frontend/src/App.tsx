import React, { useEffect, useState } from 'react';
import { Subscription } from './types';
import { RoleProvider } from './context/RoleContext';
import { useRole } from './context/RoleContext';
import Header from './components/Header';
import MetricCards from './components/MetricCards';
import SubscriptionTable from './components/SubscriptionTable';
import {
  fetchSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} from './api/subscriptionApi';

// AppContent is a separate component so it can call useRole() inside RoleProvider
const AppContent: React.FC = () => {
  const { role } = useRole();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptions()
      .then(setSubscriptions)
      .catch(() =>
        setError('Could not load subscription data. Please check your connection.')
      );
  }, []);

  const handleCreate = async (data: Omit<Subscription, 'id'>): Promise<void> => {
    const created = await createSubscription(data, role);
    setSubscriptions(prev => [...prev, created]);
  };

  const handleUpdate = async (subscription: Subscription): Promise<void> => {
    const { id, ...data } = subscription;
    const updated = await updateSubscription(id, data, role);
    setSubscriptions(prev => prev.map(s => (s.id === id ? updated : s)));
  };

  const handleDelete = async (id: string): Promise<void> => {
    await deleteSubscription(id, role);
    setSubscriptions(prev => prev.filter(s => s.id !== id));
  };

  if (error) {
    return <div role="alert">{error}</div>;
  }

  return (
    <>
      <Header />
      <main>
        <MetricCards subscriptions={subscriptions} />
        <SubscriptionTable
          subscriptions={subscriptions}
          onAdd={handleCreate}
          onEdit={handleUpdate}
          onDelete={handleDelete}
        />
      </main>
    </>
  );
};

const App: React.FC = () => {
  return (
    <RoleProvider>
      <AppContent />
    </RoleProvider>
  );
};

export default App;

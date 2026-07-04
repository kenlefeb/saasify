import React, { useState } from 'react';
import { Subscription } from '../types';
import { useRole } from '../context/RoleContext';
import SubscriptionRow from './SubscriptionRow';
import SubscriptionForm from './SubscriptionForm';

interface SubscriptionTableProps {
  subscriptions: Subscription[];
  onAdd: (data: Omit<Subscription, 'id'>) => void;
  onEdit: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
}

const SubscriptionTable: React.FC<SubscriptionTableProps> = ({
  subscriptions,
  onAdd,
  onEdit,
  onDelete,
}) => {
  const { role } = useRole();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

  const handleEditClick = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setShowAddForm(false);
  };

  const handleEditSubmit = (data: Omit<Subscription, 'id'>) => {
    if (editingSubscription) {
      onEdit({ ...data, id: editingSubscription.id });
    }
    setEditingSubscription(null);
  };

  const handleAddSubmit = (data: Omit<Subscription, 'id'>) => {
    onAdd(data);
    setShowAddForm(false);
  };

  const handleCancelForm = () => {
    setShowAddForm(false);
    setEditingSubscription(null);
  };

  return (
    <section aria-label="Subscription Table">
      {role === 'ADMIN' && (
        <button onClick={() => { setShowAddForm(true); setEditingSubscription(null); }}>
          Add Subscription
        </button>
      )}

      {showAddForm && role === 'ADMIN' && (
        <SubscriptionForm
          onSubmit={handleAddSubmit}
          onCancel={handleCancelForm}
        />
      )}

      {editingSubscription && role === 'ADMIN' && (
        <SubscriptionForm
          subscription={editingSubscription}
          onSubmit={handleEditSubmit}
          onCancel={handleCancelForm}
        />
      )}

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Cost</th>
            <th>Billing Cycle</th>
            <th>Status</th>
            <th>Next Renewal Date</th>
            {role === 'ADMIN' && (
              <>
                <th>Edit</th>
                <th>Delete</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {subscriptions.map(subscription => (
            <SubscriptionRow
              key={subscription.id}
              subscription={subscription}
              onEdit={handleEditClick}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default SubscriptionTable;

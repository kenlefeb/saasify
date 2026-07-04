import React from 'react';
import { Subscription } from '../types';
import { useRole } from '../context/RoleContext';
import { isRenewalImminent } from '../utils/renewalAlerts';
import { formatUSD } from '../utils/calculations';

interface SubscriptionRowProps {
  subscription: Subscription;
  onEdit: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
}

const SubscriptionRow: React.FC<SubscriptionRowProps> = ({ subscription, onEdit, onDelete }) => {
  const { role } = useRole();
  const imminent = isRenewalImminent(subscription);
  return (
    <tr>
      <td>{subscription.name}</td>
      <td>{formatUSD(subscription.cost)}</td>
      <td>{subscription.billingCycle}</td>
      <td>{subscription.status}</td>
      <td>
        {subscription.nextRenewalDate}
        {imminent && <span className="badge">Renewal Imminent</span>}
      </td>
      {role === 'ADMIN' && (
        <>
          <td><button onClick={() => onEdit(subscription)}>Edit</button></td>
          <td><button onClick={() => onDelete(subscription.id)}>Delete</button></td>
        </>
      )}
    </tr>
  );
};

export default SubscriptionRow;

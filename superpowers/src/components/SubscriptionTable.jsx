import React, { useContext } from 'react';
import { SubscriptionContext } from '../context/SubscriptionContext';
import AlertBadge from './AlertBadge';

export default function SubscriptionTable({ onOpenModal }) {
  const { subscriptions, currentUser, currentSystemDate, deleteSubscription } = useContext(SubscriptionContext);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(val);
  };

  return (
    <div className="table-container">
      <div className="table-header-row">
        <h2>Subscriptions</h2>
        {currentUser === 'ADMIN' && (
          <button className="btn" onClick={() => onOpenModal(null)}>
            + Add Subscription
          </button>
        )}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Cost</th>
              <th>Billing Cycle</th>
              <th>Status</th>
              <th>Next Renewal</th>
              <th>Alerts</th>
              {currentUser === 'ADMIN' && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {subscriptions.map(sub => (
              <tr key={sub.id}>
                <td style={{ fontWeight: 600 }}>{sub.name}</td>
                <td>{formatCurrency(sub.cost)}</td>
                <td>{sub.billingCycle}</td>
                <td>
                  <span className={`badge ${sub.status === 'ACTIVE' ? 'badge-active' : 'badge-paused'}`}>
                    {sub.status}
                  </span>
                </td>
                <td>{sub.nextRenewalDate}</td>
                <td>
                  {sub.status === 'ACTIVE' && (
                    <AlertBadge renewalDate={sub.nextRenewalDate} systemDate={currentSystemDate} />
                  )}
                </td>
                {currentUser === 'ADMIN' && (
                  <td>
                    <div className="btn-group">
                      <button className="btn btn-secondary" onClick={() => onOpenModal(sub)}>
                        Edit
                      </button>
                      <button className="btn btn-danger" onClick={() => deleteSubscription(sub.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {subscriptions.length === 0 && (
              <tr>
                <td colSpan={currentUser === 'ADMIN' ? 7 : 6} style={{ textAlign: 'center', color: 'hsl(215, 15%, 70%)' }}>
                  No subscriptions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

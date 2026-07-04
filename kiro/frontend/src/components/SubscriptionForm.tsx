import React, { useState } from 'react';
import { Subscription, BillingCycle, Status } from '../types';

interface SubscriptionFormProps {
  subscription?: Subscription;
  onSubmit: (data: Omit<Subscription, 'id'>) => void;
  onCancel: () => void;
}

const SubscriptionForm: React.FC<SubscriptionFormProps> = ({ subscription, onSubmit, onCancel }) => {
  const [name, setName] = useState(subscription?.name ?? '');
  const [cost, setCost] = useState(subscription?.cost.toString() ?? '');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(subscription?.billingCycle ?? 'MONTHLY');
  const [status, setStatus] = useState<Status>(subscription?.status ?? 'ACTIVE');
  const [nextRenewalDate, setNextRenewalDate] = useState(subscription?.nextRenewalDate ?? '');
  const [errors, setErrors] = useState<string[]>([]);

  const validate = (): boolean => {
    const errs: string[] = [];
    if (!name.trim()) errs.push('Name is required');
    const costNum = parseFloat(cost);
    if (isNaN(costNum) || costNum < 0) errs.push('Cost must be a non-negative number');
    if (!nextRenewalDate) errs.push('Next Renewal Date is required');
    setErrors(errs);
    return errs.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      name: name.trim(),
      cost: parseFloat(parseFloat(cost).toFixed(2)),
      billingCycle,
      status,
      nextRenewalDate,
    });
  };

  return (
    <form onSubmit={handleSubmit} aria-label={subscription ? 'Edit subscription' : 'Add subscription'}>
      {errors.length > 0 && (
        <ul role="alert">
          {errors.map((err, i) => <li key={i}>{err}</li>)}
        </ul>
      )}
      <label>
        Name:
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </label>
      <label>
        Cost (USD):
        <input
          type="number"
          step="0.01"
          min="0"
          value={cost}
          onChange={e => setCost(e.target.value)}
          required
        />
      </label>
      <label>
        Billing Cycle:
        <select value={billingCycle} onChange={e => setBillingCycle(e.target.value as BillingCycle)}>
          <option value="MONTHLY">MONTHLY</option>
          <option value="ANNUAL">ANNUAL</option>
        </select>
      </label>
      <label>
        Status:
        <select value={status} onChange={e => setStatus(e.target.value as Status)}>
          <option value="ACTIVE">ACTIVE</option>
          <option value="PAUSED">PAUSED</option>
        </select>
      </label>
      <label>
        Next Renewal Date:
        <input
          type="date"
          value={nextRenewalDate}
          onChange={e => setNextRenewalDate(e.target.value)}
          required
        />
      </label>
      <button type="submit">{subscription ? 'Update' : 'Create'}</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
};

export default SubscriptionForm;

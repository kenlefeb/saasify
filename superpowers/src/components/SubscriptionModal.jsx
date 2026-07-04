import React, { useState, useEffect, useContext } from 'react';
import { SubscriptionContext } from '../context/SubscriptionContext';

export default function SubscriptionModal({ activeSubscription, onClose }) {
  const { addSubscription, updateSubscription, currentUser } = useContext(SubscriptionContext);

  const [name, setName] = useState('');
  const [cost, setCost] = useState(0);
  const [billingCycle, setBillingCycle] = useState('MONTHLY');
  const [status, setStatus] = useState('ACTIVE');
  const [nextRenewalDate, setNextRenewalDate] = useState('');

  useEffect(() => {
    if (activeSubscription) {
      setName(activeSubscription.name);
      setCost(activeSubscription.cost);
      setBillingCycle(activeSubscription.billingCycle);
      setStatus(activeSubscription.status);
      setNextRenewalDate(activeSubscription.nextRenewalDate);
    } else {
      setName('');
      setCost(0);
      setBillingCycle('MONTHLY');
      setStatus('ACTIVE');
      setNextRenewalDate('');
    }
  }, [activeSubscription]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedCost = parseFloat(cost);
    if (!name || isNaN(parsedCost) || parsedCost < 0 || !nextRenewalDate) return;

    const data = {
      name,
      cost: parseFloat(parsedCost.toFixed(2)),
      billingCycle,
      status,
      nextRenewalDate
    };

    if (activeSubscription) {
      updateSubscription(activeSubscription.id, data);
    } else {
      addSubscription(data);
    }
    onClose();
  };

  if (currentUser !== 'ADMIN') return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>{activeSubscription ? 'Edit Subscription' : 'Add Subscription'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="modal-name">Subscription Name</label>
            <input 
              id="modal-name"
              type="text" 
              required 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g. Github Enterprise"
            />
          </div>
          <div className="form-group">
            <label htmlFor="modal-cost">Cost (USD)</label>
            <input 
              id="modal-cost"
              type="number" 
              step="0.01" 
              min="0" 
              required 
              value={cost} 
              onChange={(e) => setCost(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label htmlFor="modal-cycle">Billing Cycle</label>
            <select 
              id="modal-cycle"
              value={billingCycle} 
              onChange={(e) => setBillingCycle(e.target.value)}
            >
              <option value="MONTHLY">MONTHLY</option>
              <option value="ANNUAL">ANNUAL</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="modal-status">Status</label>
            <select 
              id="modal-status"
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="PAUSED">PAUSED</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="modal-date">Next Renewal Date</label>
            <input 
              id="modal-date"
              type="date" 
              required 
              value={nextRenewalDate} 
              onChange={(e) => setNextRenewalDate(e.target.value)} 
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

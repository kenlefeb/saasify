import React, { useContext } from 'react';
import { SubscriptionContext } from '../context/SubscriptionContext';

export default function Header() {
  const {
    currentUser,
    setCurrentUser,
    currentSystemDate,
    setCurrentSystemDate
  } = useContext(SubscriptionContext);

  return (
    <header>
      <h1 className="gradient-text" style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>SaaSify</h1>
      <div className="controls-card">
        <div className="control-group">
          <label htmlFor="role-select">User Role</label>
          <select 
            id="role-select" 
            value={currentUser} 
            onChange={(e) => setCurrentUser(e.target.value)}
          >
            <option value="ADMIN">ADMIN</option>
            <option value="VIEWER">VIEWER</option>
          </select>
        </div>
        <div className="control-group">
          <label htmlFor="date-select">System Date</label>
          <input 
            type="date" 
            id="date-select" 
            value={currentSystemDate} 
            onChange={(e) => setCurrentSystemDate(e.target.value)} 
          />
        </div>
      </div>
    </header>
  );
}

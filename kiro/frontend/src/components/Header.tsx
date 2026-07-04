import React from 'react';
import { useRole } from '../context/RoleContext';
import { Role } from '../types';

const Header: React.FC = () => {
  const { role, setRole } = useRole();
  return (
    <header>
      <h1>SaaSify</h1>
      <label>
        Role:
        <select value={role} onChange={e => setRole(e.target.value as Role)}>
          <option value="VIEWER">VIEWER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </label>
    </header>
  );
};

export default Header;

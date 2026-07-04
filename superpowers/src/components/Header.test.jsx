import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SubscriptionContext } from '../context/SubscriptionContext';
import Header from './Header';

describe('Header Component', () => {
  const mockContext = {
    currentUser: 'ADMIN',
    setCurrentUser: vi.fn(),
    currentSystemDate: '2026-07-03',
    setCurrentSystemDate: vi.fn(),
  };

  it('renders application title and initial settings correctly', () => {
    render(
      <SubscriptionContext.Provider value={mockContext}>
        <Header />
      </SubscriptionContext.Provider>
    );

    expect(screen.getByText('SaaSify')).toBeInTheDocument();
    expect(screen.getByLabelText('User Role')).toHaveValue('ADMIN');
    expect(screen.getByLabelText('System Date')).toHaveValue('2026-07-03');
  });

  it('triggers context state updates on changing role or date', () => {
    render(
      <SubscriptionContext.Provider value={mockContext}>
        <Header />
      </SubscriptionContext.Provider>
    );

    fireEvent.change(screen.getByLabelText('User Role'), { target: { value: 'VIEWER' } });
    expect(mockContext.setCurrentUser).toHaveBeenCalledWith('VIEWER');

    fireEvent.change(screen.getByLabelText('System Date'), { target: { value: '2026-07-10' } });
    expect(mockContext.setCurrentSystemDate).toHaveBeenCalledWith('2026-07-10');
  });
});

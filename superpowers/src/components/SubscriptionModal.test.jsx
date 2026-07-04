import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SubscriptionContext } from '../context/SubscriptionContext';
import SubscriptionModal from './SubscriptionModal';

describe('SubscriptionModal Component', () => {
  const mockContext = {
    addSubscription: vi.fn(),
    updateSubscription: vi.fn(),
    currentUser: 'ADMIN'
  };

  it('renders modal form inputs with empty values for adding', () => {
    render(
      <SubscriptionContext.Provider value={mockContext}>
        <SubscriptionModal activeSubscription={null} onClose={vi.fn()} />
      </SubscriptionContext.Provider>
    );

    expect(screen.getByText('Add Subscription')).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toHaveValue('');
    expect(screen.getByLabelText(/cost/i)).toHaveValue(0);
  });

  it('triggers addSubscription action on submit', () => {
    render(
      <SubscriptionContext.Provider value={mockContext}>
        <SubscriptionModal activeSubscription={null} onClose={vi.fn()} />
      </SubscriptionContext.Provider>
    );

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Disney+' } });
    fireEvent.change(screen.getByLabelText(/cost/i), { target: { value: '14.99' } });
    fireEvent.change(screen.getByLabelText(/next renewal/i), { target: { value: '2026-07-20' } });
    
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(mockContext.addSubscription).toHaveBeenCalledWith({
      name: 'Disney+',
      cost: 14.99,
      billingCycle: 'MONTHLY',
      status: 'ACTIVE',
      nextRenewalDate: '2026-07-20'
    });
  });

  it('renders modal form inputs with pre-populated values for editing', () => {
    const activeSubscription = {
      id: 1,
      name: 'Netflix',
      cost: 15.49,
      billingCycle: 'MONTHLY',
      status: 'ACTIVE',
      nextRenewalDate: '2026-07-15'
    };

    render(
      <SubscriptionContext.Provider value={mockContext}>
        <SubscriptionModal activeSubscription={activeSubscription} onClose={vi.fn()} />
      </SubscriptionContext.Provider>
    );

    expect(screen.getByText('Edit Subscription')).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toHaveValue('Netflix');
    expect(screen.getByLabelText(/cost/i)).toHaveValue(15.49);
    expect(screen.getByLabelText(/billing cycle/i)).toHaveValue('MONTHLY');
    expect(screen.getByLabelText(/status/i)).toHaveValue('ACTIVE');
    expect(screen.getByLabelText(/next renewal/i)).toHaveValue('2026-07-15');
  });

  it('triggers updateSubscription action on submit when editing', () => {
    const activeSubscription = {
      id: 1,
      name: 'Netflix',
      cost: 15.49,
      billingCycle: 'MONTHLY',
      status: 'ACTIVE',
      nextRenewalDate: '2026-07-15'
    };
    const mockOnClose = vi.fn();

    render(
      <SubscriptionContext.Provider value={mockContext}>
        <SubscriptionModal activeSubscription={activeSubscription} onClose={mockOnClose} />
      </SubscriptionContext.Provider>
    );

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Netflix Premium' } });
    fireEvent.change(screen.getByLabelText(/cost/i), { target: { value: '22.99' } });
    
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(mockContext.updateSubscription).toHaveBeenCalledWith(1, {
      name: 'Netflix Premium',
      cost: 22.99,
      billingCycle: 'MONTHLY',
      status: 'ACTIVE',
      nextRenewalDate: '2026-07-15'
    });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when cancel is clicked or overlay is clicked', () => {
    const mockOnClose = vi.fn();
    const { container } = render(
      <SubscriptionContext.Provider value={mockContext}>
        <SubscriptionModal activeSubscription={null} onClose={mockOnClose} />
      </SubscriptionContext.Provider>
    );

    // Click cancel button
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    // Click overlay
    const overlay = container.querySelector('.modal-overlay');
    fireEvent.click(overlay);
    expect(mockOnClose).toHaveBeenCalledTimes(2);

    // Click content (should not trigger onClose due to stopPropagation)
    const content = container.querySelector('.modal-content');
    fireEvent.click(content);
    expect(mockOnClose).toHaveBeenCalledTimes(2);
  });

  it('does not render the modal if currentUser is not ADMIN', () => {
    const viewerContext = { ...mockContext, currentUser: 'VIEWER' };
    const { container } = render(
      <SubscriptionContext.Provider value={viewerContext}>
        <SubscriptionModal activeSubscription={null} onClose={vi.fn()} />
      </SubscriptionContext.Provider>
    );
    expect(container.firstChild).toBeNull();
  });

  it('does not trigger addSubscription if cost is empty or invalid', () => {
    const mockAddSubscription = vi.fn();
    const contextWithAdd = { ...mockContext, addSubscription: mockAddSubscription };
    
    render(
      <SubscriptionContext.Provider value={contextWithAdd}>
        <SubscriptionModal activeSubscription={null} onClose={vi.fn()} />
      </SubscriptionContext.Provider>
    );

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Disney+' } });
    fireEvent.change(screen.getByLabelText(/cost/i), { target: { value: '' } }); // empty value
    fireEvent.change(screen.getByLabelText(/next renewal/i), { target: { value: '2026-07-20' } });
    
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(mockAddSubscription).not.toHaveBeenCalled();
  });
});

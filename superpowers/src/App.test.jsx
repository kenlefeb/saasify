import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Integration', () => {
  it('renders application structure successfully', () => {
    render(<App />);
    expect(screen.getByText('SaaSify')).toBeInTheDocument();
    expect(screen.getByText('Total Projected Monthly Spend')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('opens and closes SubscriptionModal correctly', () => {
    render(<App />);

    // Get all edit buttons and click the first one (GitHub Enterprise)
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);

    // Modal should be open with 'Edit Subscription' and the name 'GitHub Enterprise'
    expect(screen.getByRole('heading', { name: /edit subscription/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toHaveValue('GitHub Enterprise');

    // Click the Cancel button to close the modal
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    // Modal should be closed now
    expect(screen.queryByRole('heading', { name: /edit subscription/i })).not.toBeInTheDocument();
  });
});

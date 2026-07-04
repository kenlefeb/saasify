import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Integration', () => {
  it('renders application structure successfully', () => {
    render(<App />);
    expect(screen.getByText('SaaSify')).toBeInTheDocument();
    expect(screen.getByText('Total Projected Monthly Spend')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});

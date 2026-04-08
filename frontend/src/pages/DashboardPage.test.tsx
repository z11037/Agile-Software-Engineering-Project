import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import DashboardPage from './DashboardPage';
import { getProgressSummary } from '../services/api';
import { useAuth } from '../hooks/useAuth';

vi.mock('../services/api', () => ({
  getProgressSummary: vi.fn(),
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    (useAuth as any).mockReturnValue({
      username: 'alice',
    });
    (getProgressSummary as any).mockReset();
  });

  it('shows a page-level error UI when progress summary fails', async () => {
    (getProgressSummary as any).mockRejectedValue({
      response: { status: 500, data: { detail: 'boom' } },
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Loading your dashboard/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Could not load data')).toBeInTheDocument();
    });
    expect(screen.getByText('boom')).toBeInTheDocument();
    expect(screen.queryByText(/Coverage/i)).not.toBeInTheDocument();
  });
});


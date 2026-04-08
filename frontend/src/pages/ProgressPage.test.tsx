import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import ProgressPage from './ProgressPage';
import {
  getProgressSummary,
  getProgressHistory,
  getQuizHistory,
  getOralPracticeHistory,
} from '../services/api';

vi.mock('../services/api', () => ({
  getProgressSummary: vi.fn(),
  getProgressHistory: vi.fn(),
  getQuizHistory: vi.fn(),
  getOralPracticeHistory: vi.fn(),
}));

describe('ProgressPage', () => {
  it('shows section-level error UI when summary/history fail', async () => {
    (getProgressSummary as any).mockRejectedValue({
      response: { status: 500, data: { detail: 'fail summary' } },
    });
    (getProgressHistory as any).mockRejectedValue({
      response: { status: 500, data: { detail: 'fail history' } },
    });
    (getQuizHistory as any).mockResolvedValue({ data: [] });
    (getOralPracticeHistory as any).mockResolvedValue({ data: [] });

    render(<ProgressPage />);

    await waitFor(() => {
      expect(screen.getByText('fail summary')).toBeInTheDocument();
      expect(screen.getAllByText('fail history').length).toBeGreaterThanOrEqual(1);
      // When any section fails, the page shows a refresh all action.
      expect(screen.getByRole('button', { name: /refresh all/i })).toBeInTheDocument();
    });
  });
});


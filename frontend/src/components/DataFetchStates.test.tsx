import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FetchErrorPanel, LoadingPanel } from './DataFetchStates';

describe('DataFetchStates', () => {
  it('renders loading panel with aria-live', () => {
    render(<LoadingPanel label="Loading test…" />);
    expect(screen.getByText('Loading test…')).toBeInTheDocument();
    const live = screen.getByRole('status');
    expect(live).toHaveAttribute('aria-live', 'polite');
  });

  it('renders fetch error panel and calls onRetry on button click', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(<FetchErrorPanel message="boom" onRetry={onRetry} />);

    expect(screen.getByText('Could not load data')).toBeInTheDocument();
    expect(screen.getByText('boom')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});


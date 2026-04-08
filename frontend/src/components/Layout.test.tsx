import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Layout from './Layout';

const logout = vi.fn();

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    token: 'token',
    username: 'alice',
    isAuthenticated: true,
    login: vi.fn(),
    register: vi.fn(),
    logout,
  }),
}));

describe('Layout navigation', () => {
  it('does not show Oral Practice / Student Life / Mydundee in top navigation', () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<div>content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.queryByText('Oral Practice')).not.toBeInTheDocument();
    expect(screen.queryByText('Student Life')).not.toBeInTheDocument();
    expect(screen.queryByText('Mydundee')).not.toBeInTheDocument();
  });
});


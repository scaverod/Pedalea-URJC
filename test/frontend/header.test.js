import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from '../../public/src/components/Header';

// Mock react-router-dom hooks used by Header
const mockedUsedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}));

// Mock global fetch
global.fetch = jest.fn();

describe('Header component', () => {
  beforeEach(() => {
    fetch.mockClear();
    mockedUsedNavigate.mockClear();
    localStorage.clear();
  });

  it('renders public nav links and login when logged out', async () => {
    // No token in localStorage, so it should not call /api/auth/me
    render(
      <MemoryRouter initialEntries={['/']}>
        <Header />
      </MemoryRouter>
    );

  // Nav links are visible
  expect(screen.getByRole('link', { name: /inicio/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /rutas/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /comunidad/i })).toBeInTheDocument();

    // Login action is available
    await waitFor(() => {
      expect(screen.getAllByRole('link', { name: /accede/i })[0]).toBeInTheDocument();
    });

    // Should not show profile or admin actions
    expect(screen.queryByRole('button', { name: /administración/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /salir/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /perfil/i })).not.toBeInTheDocument();
  });

  it('shows Perfil and Administración for admin user and highlights active admin path', async () => {
    // Seed token and cached user for instant hydrate
    const adminUser = { id: 1, email: 'admin@example.com', username: 'admin', role: 'ROLE_ADMIN' };
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('user', JSON.stringify(adminUser));

    // Validate and refresh cache via /api/auth/me
    fetch.mockResolvedValueOnce({ ok: true, json: async () => adminUser });

    render(
      <MemoryRouter initialEntries={['/admin/users']}>
        <Header />
      </MemoryRouter>
    );

    // Administración button visible and marked active due to /admin/* path
    const adminButton = await screen.findByRole('button', { name: /administración/i });
    expect(adminButton).toBeInTheDocument();
    expect(adminButton.className).toMatch(/active/);

    // Perfil link visible with username or email
    const profileLink = screen.getByRole('link', { name: /perfil/i });
    expect(profileLink).toBeInTheDocument();

    // Open admin dropdown and see submenu items
  fireEvent.click(adminButton);
  const userLinks = await screen.findAllByRole('link', { name: /usuarios/i });
  // One is the mobile submenu (/admin), another is the desktop submenu (/admin/users)
  expect(userLinks.length).toBeGreaterThanOrEqual(1);
  // Ensure at least one points to the users management page
  expect(userLinks.some(a => a.getAttribute('href') === '/admin/users')).toBe(true);
  const adminRutas = screen.getAllByText(/rutas/i).find(el => el.closest('.admin-submenu'));
  const adminBlog = screen.getAllByText(/blog/i).find(el => el.closest('.admin-submenu'));
  expect(adminRutas).toBeTruthy();
  expect(adminBlog).toBeTruthy();
  });

  it('toggles mobile menu open/close via hamburger', async () => {
    // Force a small viewport for aria-hidden logic
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 800 });
    window.dispatchEvent(new Event('resize'));

    render(
      <MemoryRouter initialEntries={['/']}> 
        <Header />
      </MemoryRouter>
    );

    const toggle = screen.getByRole('button', { name: /abrir menú/i });
    expect(toggle).toBeInTheDocument();

    // Initially menu is closed (aria-expanded=false)
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    // Open
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    // Close
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
});

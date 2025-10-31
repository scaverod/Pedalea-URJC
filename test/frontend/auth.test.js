import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Login from '../../public/src/components/Login';
import Register from '../../public/src/components/Register';

// Mock react-router-dom's useNavigate
const mockedUsedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}));

// Mock global fetch
global.fetch = jest.fn();

describe('Login Component', () => {
  beforeEach(() => {
    fetch.mockClear();
    mockedUsedNavigate.mockClear();
    localStorage.clear();
  });

  it('renders login form', () => {
    render(
      <Router>
        <Login />
      </Router>
    );
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /acceder/i })).toBeInTheDocument();
  });

  it('shows error message on failed login', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Credenciales inválidas.' }),
      })
    );

    render(
      <Router>
        <Login />
      </Router>
    );

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: 'wrongpassword' },
    });
    fireEvent.click(screen.getByRole('button', { name: /acceder/i }));

    await waitFor(() => {
      expect(screen.getByText(/credenciales inválidas\./i)).toBeInTheDocument();
    });
  });

  it('navigates to profile on successful login', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ token: 'fake-token', user: { id: 1, email: 'test@example.com', username: 'testuser', role: 'ROLE_USER' } }),
      })
    );

    render(
      <Router>
        <Login />
      </Router>
    );

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: 'correctpassword' },
    });
    fireEvent.click(screen.getByRole('button', { name: /acceder/i }));

    await waitFor(() => {
      expect(localStorage.getItem('token')).toEqual('fake-token');
      expect(localStorage.getItem('user')).toEqual(JSON.stringify({ id: 1, email: 'test@example.com', username: 'testuser', role: 'ROLE_USER' }));
      expect(mockedUsedNavigate).toHaveBeenCalledWith('/profile');
    });
  });
});

describe('Register Component', () => {
  beforeEach(() => {
    fetch.mockClear();
    mockedUsedNavigate.mockClear();
  });

  it('renders registration form', () => {
    render(
      <Router>
        <Register />
      </Router>
    );
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre de usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /registrarse/i })).toBeInTheDocument();
  });

  it('shows error message on failed registration', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'El correo ya está registrado.' }),
      })
    );

    render(
      <Router>
        <Register />
      </Router>
    );

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'existing@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/nombre de usuario/i), {
      target: { value: 'existinguser' },
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /registrarse/i }));

    await waitFor(() => {
      expect(screen.getByText(/el correo ya está registrado\./i)).toBeInTheDocument();
    });
  });

  it('shows verification message and redirects to login after a short delay', async () => {
    jest.useFakeTimers();
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Usuario registrado correctamente. Correo de verificación enviado.' }),
      })
    );

    render(
      <Router>
        <Register />
      </Router>
    );

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'new@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/nombre de usuario/i), {
      target: { value: 'newuser' },
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: 'newpassword123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /registrarse/i }));

    await waitFor(() => {
      // The UI shows a verification notice
      expect(screen.getByText(/Usuario registrado correctamente\./i)).toBeInTheDocument();
      expect(screen.getByText(/valida primero tu correo/i)).toBeInTheDocument();
    });

    // Advance timers to trigger auto-redirect
  jest.advanceTimersByTime(5000);

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith('/login', { replace: true });
    });

    jest.useRealTimers();
  });
});
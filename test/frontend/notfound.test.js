import React from 'react';
import { render, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';
import NotFound from '../../public/src/components/NotFound';

describe('NotFound Component', () => {
  it('muestra el mensaje y cuenta atrás de redirección', () => {
    jest.useFakeTimers();
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );
    expect(screen.getByText(/Ruta no encontrada/i)).toBeInTheDocument();
    expect(screen.getByText(/una ruta más segura/i)).toBeInTheDocument();
    expect(screen.getByText(/Redirigiendo al inicio en 5/i)).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByText(/Redirigiendo al inicio en 4/i)).toBeInTheDocument();

    jest.useRealTimers();
  });
});

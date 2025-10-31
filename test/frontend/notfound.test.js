import React from 'react';
import { render, screen } from '@testing-library/react';
import NotFound from '../../public/src/components/NotFound';

describe('NotFound Component', () => {
  it('muestra el mensaje de ruta no encontrada', () => {
    render(<NotFound />);
    expect(screen.getByText(/Ruta no encontrada/i)).toBeInTheDocument();
    expect(screen.getByText(/una ruta más segura/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ir al inicio/i })).toBeInTheDocument();
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Mindfulness } from './Mindfulness';
import { AppContext } from '../../contexts/AppContext';

const mockState = {
  darkMode: true,
  user: { name: 'Test User', gold: 100 },
};

const renderWithContext = (component: React.ReactNode) => {
  return render(
    <AppContext.Provider value={{ state: mockState, dispatch: vi.fn() }}>
      {component}
    </AppContext.Provider>
  );
};

describe('Mindfulness', () => {
  it('renders the component', () => {
    renderWithContext(<Mindfulness />);
    expect(screen.getByText(/Mindfulness/i)).toBeInTheDocument();
    expect(screen.getByText(/Protocol/i)).toBeInTheDocument();
  });

  it('allows starting a session', () => {
    renderWithContext(<Mindfulness />);
    const startButton = screen.getByText('INITIALIZE SEQUENCE');
    fireEvent.click(startButton);
    expect(screen.getByText(/Session Active/i)).toBeInTheDocument();
  });
});

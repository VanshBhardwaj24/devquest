import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectShowcase } from './ProjectShowcase';
import { AppContext } from '../../contexts/AppContext';

// Mock the AppContext
const mockState = {
  darkMode: true,
  user: { name: 'Test User', gold: 100, level: 1 },
};

const renderWithContext = (component: React.ReactNode) => {
  return render(
    <AppContext.Provider value={{ state: mockState, dispatch: vi.fn() }}>
      {component}
    </AppContext.Provider>
  );
};

describe('ProjectShowcase', () => {
  it('renders the component with dynamic title', () => {
    renderWithContext(<ProjectShowcase />);
    expect(screen.getByText(/Test User's Projects/i)).toBeInTheDocument();
  });

  it('opens the new project form when clicking the add button', () => {
    renderWithContext(<ProjectShowcase />);
    const addButton = screen.getByRole('button', { name: /New Project/i });
    fireEvent.click(addButton);
    expect(screen.getByText(/Initialize/i)).toBeInTheDocument();
  });

  it('allows adding a new project', () => {
    renderWithContext(<ProjectShowcase />);
    
    // Open form
    fireEvent.click(screen.getByRole('button', { name: /New Project/i }));
    
    // Fill form
    const titleInput = screen.getByPlaceholderText('e.g. Neural Network Visualizer');
    const descInput = screen.getByPlaceholderText('Brief overview of the project objectives...');
    
    fireEvent.change(titleInput, { target: { value: 'Test Project' } });
    fireEvent.change(descInput, { target: { value: 'Test Description' } });
    
    // Submit
    const submitButton = screen.getByRole('button', { name: /Create/i });
    fireEvent.click(submitButton);
    
    // Check if added
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });
});

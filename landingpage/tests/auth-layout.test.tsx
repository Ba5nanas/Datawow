import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AuthLayout } from '../components/auth-layout';

describe('AuthLayout', () => {
  const baseProps = {
    children: <div>Form Content</div>,
  };

  it('renders children content', () => {
    render(<AuthLayout {...baseProps} />);
    expect(screen.getByText('Form Content')).toBeInTheDocument();
  });

  it('renders the Brand component', () => {
    const { container } = render(<AuthLayout {...baseProps} />);
    expect(container.querySelector('.font-bold.tracking-tight')).toBeInTheDocument();
  });

  it('renders the motivational heading', () => {
    render(<AuthLayout {...baseProps} />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
  });

  it('renders the descriptive paragraph', () => {
    render(<AuthLayout {...baseProps} />);
    const paragraph = screen.getByText(/Lorem ipsum dolor sit amet/);
    expect(paragraph).toBeInTheDocument();
  });

  it('has the correct layout structure', () => {
    const { container } = render(<AuthLayout {...baseProps} />);
    const main = container.querySelector('main');
    expect(main).toHaveClass('min-h-screen');
    expect(main).toHaveClass('bg-white');
  });

  it('renders aside section with branding', () => {
    const { container } = render(<AuthLayout {...baseProps} />);
    const aside = container.querySelector('aside');
    expect(aside).toHaveClass('bg-[#0878ae]');
    expect(aside).toHaveClass('text-white');
  });

  it('renders section for children', () => {
    const { container } = render(<AuthLayout {...baseProps} />);
    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
  });
});

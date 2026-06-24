import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Brand } from '../components/brand';

describe('Brand', () => {
  it('renders the brand name', () => {
    render(<Brand />);
    expect(screen.getByText('BRAND')).toBeInTheDocument();
  });

  it('renders the brand icon', () => {
    const { container } = render(<Brand />);
    const circle = container.querySelector('span.rounded-full');
    expect(circle).toBeInTheDocument();
  });

  it('applies inverse styling when inverse prop is true', () => {
    const { container } = render(<Brand inverse />);
    const parent = container.firstChild as HTMLElement;
    expect(parent).toHaveClass('text-white');
  });

  it('applies default styling when inverse prop is false', () => {
    const { container } = render(<Brand inverse={false} />);
    const parent = container.firstChild as HTMLElement;
    expect(parent).toHaveClass('text-[#0878ae]');
  });
});

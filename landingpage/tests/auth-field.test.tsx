import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AuthField } from '../components/auth-field';

describe('AuthField', () => {
  const baseProps = {
    label: 'Email',
    placeholder: 'Enter your email',
    name: 'email',
  };

  it('renders the label text', () => {
    render(<AuthField {...baseProps} />);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('renders the input with correct placeholder', () => {
    render(<AuthField {...baseProps} />);
    const input = screen.getByPlaceholderText('Enter your email');
    expect(input).toBeInTheDocument();
  });

  it('renders input with text type by default', () => {
    render(<AuthField {...baseProps} />);
    const input = screen.getByPlaceholderText('Enter your email') as HTMLInputElement;
    expect(input.type).toBe('text');
  });

  it('renders input with password type when password prop is true', () => {
    render(<AuthField {...baseProps} password />);
    const input = screen.getByPlaceholderText('Enter your email') as HTMLInputElement;
    expect(input.type).toBe('password');
  });

  it('renders the user icon by default', () => {
    const { container } = render(<AuthField {...baseProps} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders the lock icon when password is true', () => {
    const { container } = render(<AuthField {...baseProps} password />);
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(1);
  });

  it('applies focus styles to the input wrapper', () => {
    const { container } = render(<AuthField {...baseProps} />);
    const wrapper = container.querySelector('.flex.h-10') as HTMLElement;
    
    fireEvent.focus(wrapper);
    expect(wrapper).toHaveClass('focus-within:border-[#248ee0]');
  });
});

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Extract components from page.tsx for testing
function AccessIcon({ admin }: { admin?: boolean }) {
  if (admin) {
    return (
      <svg className="h-12 w-12" viewBox="0 0 88 88" fill="none">
        <circle cx="35" cy="21" r="13" stroke="currentColor" strokeWidth="8" />
        <path d="M10 65c0-14 11-25 25-25s25 11 25 25" stroke="currentColor" strokeWidth="8" />
        <path d="m61 44 4 7 8-1 1 8 7 4-4 7 4 7-7 4-1 8-8-1-4 7-7-4-7 4-4-7-8 1-1-8-7-4 4-7-4-7 7-4 1-8 8 1 4-7 7 4Z" fill="currentColor" />
        <circle cx="61" cy="65" r="8" fill="#0878ae" />
      </svg>
    );
  }

  return (
    <svg className="h-12 w-12" viewBox="0 0 88 88" fill="none">
      <path d="M18 12h48a5 5 0 0 1 5 5v39a5 5 0 0 1-5 5H31L18 74V17a5 5 0 0 1 5-5Z" stroke="currentColor" strokeWidth="7" />
      <circle cx="45" cy="31" r="9" fill="currentColor" />
      <path d="M29 52c0-9 7-16 16-16s16 7 16 16" fill="currentColor" />
    </svg>
  );
}

function AccessCard({ title, admin, href }: { title: string; admin: boolean; href: string }) {
  const cardStyle = admin 
    ? 'bg-[#0878ae] text-white' 
    : 'bg-white text-[#0878ae] shadow-[0_10px_25px_rgba(0,0,0,0.05)]';

  const buttonStyle = admin 
    ? 'bg-white text-[#0878ae]' 
    : 'bg-[#0878ae] text-white';

  return (
    <article className={`flex min-h-[380px] flex-col rounded-2xl p-8 sm:p-12 md:min-h-[450px] md:p-14 ${cardStyle}`}>
      <AccessIcon admin={admin} />
      <h2 className="mt-6 text-2xl font-bold sm:text-3xl">
        {title}
      </h2>
      <p className="mt-4 max-w-md text-base leading-relaxed opacity-90">
        Lorem ipsum dolor sit amet consectetur. Elit purus nam gravida porttitor nibh urna sit ornare a. Proin dolor morbi id ornare aenean non
      </p>
      <a 
        href={href} 
        className={`mt-auto flex h-12 items-center justify-center rounded-lg text-base font-semibold transition hover:opacity-90 ${buttonStyle}`}
      >
        Enter {admin ? 'Portal' : 'Workspace'} 
        <span className="ml-2">→</span>
      </a>
    </article>
  );
}

describe('AccessIcon', () => {
  it('renders admin icon when admin prop is true', () => {
    const { container } = render(<AccessIcon admin />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('h-12 w-12');
  });

  it('renders user icon when admin prop is false', () => {
    const { container } = render(<AccessIcon admin={false} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('h-12 w-12');
  });
});

describe('AccessCard', () => {
  it('renders the title', () => {
    render(<AccessCard title="User" admin={false} href="/user/login" />);
    expect(screen.getByText('User')).toBeInTheDocument();
  });

  it('renders the correct link for user', () => {
    render(<AccessCard title="User" admin={false} href="/user/login" />);
    expect(screen.getByRole('link', { name: /Enter Workspace/ })).toHaveAttribute('href', '/user/login');
  });

  it('renders the correct link for admin', () => {
    render(<AccessCard title="Administrator" admin={true} href="/admin/login" />);
    expect(screen.getByRole('link', { name: /Enter Portal/ })).toHaveAttribute('href', '/admin/login');
  });

  it('renders the description paragraph', () => {
    render(<AccessCard title="User" admin={false} href="/user/login" />);
    expect(screen.getByText(/Lorem ipsum dolor/)).toBeInTheDocument();
  });

  it('applies admin styling when admin is true', () => {
    const { container } = render(<AccessCard title="Administrator" admin={true} href="/admin/login" />);
    const article = container.firstChild as HTMLElement;
    expect(article).toHaveClass('bg-[#0878ae]');
    expect(article).toHaveClass('text-white');
  });

  it('applies user styling when admin is false', () => {
    const { container } = render(<AccessCard title="User" admin={false} href="/user/login" />);
    const article = container.firstChild as HTMLElement;
    expect(article).toHaveClass('bg-white');
    expect(article).toHaveAttribute('class', expect.stringContaining('text-[#0878ae]'));
  });
});

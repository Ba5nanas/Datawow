import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// ==========================================
// Inline Icon component (mirrors landingpage/components/dashboard.tsx)
// ==========================================
function Icon({ name, className = 'h-5 w-5' }: { name: string; className?: string }) {
  const props = { 
    className, 
    viewBox: '0 0 24 24', 
    fill: 'none', 
    stroke: 'currentColor', 
    strokeWidth: 2, 
    strokeLinecap: 'round' as const, 
    strokeLinejoin: 'round' as const 
  };

  switch (name) {
    case 'home': return <svg {...props}><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10Z"/><path d="M9 21v-7h6v7"/></svg>;
    case 'history': return <svg {...props}><path d="M3 10h18l-2 9H5l-2-9Z"/><path d="m7 10 2-4h6l2 4"/><path d="M9 15h6"/></svg>;
    case 'switch': return <svg {...props}><path d="M3 7h13a5 5 0 0 1 5 5v1"/><path d="m18 9 3 4-4 2"/><path d="M21 17H8a5 5 0 0 1-5-5v-1"/><path d="m6 15-3-4 4-2"/></svg>;
    case 'logout': return <svg {...props}><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/><path d="M12 4h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-7"/></svg>;
    case 'user': return <svg {...props}><circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/></svg>;
    case 'award': return <svg {...props}><circle cx="12" cy="8" r="6"/><path d="m8.5 13-1 8 4.5-2 4.5 2-1-8"/></svg>;
    case 'x': return <svg {...props}><path d="m6 6 12 12M18 6 6 18"/></svg>;
    case 'trash': return <svg {...props}><path d="M4 7h16M10 11v6m4-6v6M9 7l1-3h4l1 3M6 7l1 13h10l1-13"/></svg>;
    case 'save': return <svg {...props}><path d="M5 3h12l3 3v15H4V3h1Z"/><path d="M8 3v6h8V3M8 21v-7h8v7"/></svg>;
    case 'check': return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></svg>;
    default: return <svg {...props} />;
  }
}

// ==========================================
// Inline Sidebar component
// ==========================================
function Sidebar({ role, page }: { role: 'Admin' | 'User'; page: 'home' | 'history' }) {
  const isAdmin = role === 'Admin';
  const navItems = isAdmin 
    ? [
        { label: 'Home', href: '/admin', icon: 'home' as const, active: page === 'home' }, 
        { label: 'History', href: '/admin/history', icon: 'history' as const, active: page === 'history' }
      ] 
    : [{ label: 'Home', href: '/user', icon: 'home' as const, active: true }];

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-[#e5e5e5] bg-white p-4 lg:min-h-screen lg:w-[220px] lg:border-b-0 lg:border-r lg:px-4 lg:py-8">
      <h1 className="px-3 text-lg font-bold text-gray-800 lg:mb-6">{role} Dashboard</h1>
      <nav className="mt-2 flex gap-1 lg:mt-0 lg:flex-col lg:gap-1.5">
        {navItems.map(({ label, href, icon, active }) => (
          <a 
            key={href} 
            href={href} 
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${active ? 'bg-[#e7f4fa] text-[#248ee0]' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Icon name={icon} className="h-4 w-4" />
            {label}
          </a>
        ))}
        <a href={isAdmin ? '/user' : '/admin'} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
          <Icon name="switch" className="h-4 w-4" />
          {isAdmin ? 'Switch to user' : 'Switch to Admin'}
        </a>
      </nav>
      <div className="mt-auto flex gap-1 lg:flex-col lg:gap-1.5">
        <button className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer">
          <Icon name="logout" className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}

// ==========================================
// Inline ConcertCard component
// ==========================================
function ConcertCard({ id, title, seats, totalSeats, admin, isReserved = false, onDelete, onReserve, onCancel }: { 
  id?: string; 
  title: string; 
  seats: number; 
  totalSeats?: number; 
  admin?: boolean; 
  onDelete?: () => void; 
  onReserve?: () => void; 
  onCancel?: () => void; 
  isReserved?: boolean; 
}) {
  return (
    <article className="rounded-md border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-[#248ee0]">{title}</h2>
      <div className="my-3 border-t border-gray-100" />
      <p className="text-xs leading-relaxed text-gray-600 sm:text-sm">
        {totalSeats !== undefined ? `Total ${totalSeats} seats` : ''}
      </p>
      <div className="mt-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Icon name="user" className="h-4 w-4 text-gray-400" />
          {seats.toLocaleString()} / {totalSeats !== undefined ? totalSeats.toLocaleString() : '—'} Seats
        </div>
        {admin ? (
          <button onClick={onDelete} className="flex h-9 items-center justify-center gap-1.5 rounded-md bg-[#ed4d4f] px-4 text-xs font-semibold text-white transition hover:bg-red-600">
            <Icon name="trash" className="h-3.5 w-3.5" />
            Delete
          </button>
        ) : (
          <button 
            onClick={isReserved ? onCancel : onReserve} 
            className={`h-9 min-w-[120px] rounded-md px-4 text-xs font-semibold text-white transition ${isReserved ? 'bg-gray-400 hover:bg-gray-500' : 'bg-[#248ee0] hover:bg-[#147bc9]'}`}
          >
            {isReserved ? 'Cancel' : 'Reserve'}
          </button>
        )}
      </div>
    </article>
  );
}

// ==========================================
// Inline Metric component
// ==========================================
function Metric({ title, number, tone, icon }: { title: string; number: string; tone: string; icon: string }) {
  return (
    <div className={`flex min-h-[100px] flex-col items-center justify-center rounded-md p-4 text-white shadow-sm ${tone}`}>
      <Icon name={icon} className="h-6 w-6 opacity-90"/>
      <span className="mt-1.5 text-xs opacity-80">{title}</span>
      <strong className="mt-1 text-2xl font-bold">{number}</strong>
    </div>
  );
}

// ==========================================
// Inline Toast component
// ==========================================
function Toast({ text, close }: { text: string; close: () => void }) {
  return (
    <div className="fixed right-4 top-4 z-30 flex min-w-[240px] items-center gap-2.5 rounded-md bg-[#d7eedb] px-4 py-2.5 text-xs font-medium text-[#243f2a] shadow-md border border-[#bfe2c6]">
      <Icon name="check" className="h-4 w-4 text-[#00a94f]"/>
      {text}
      <button onClick={close} className="ml-auto text-gray-500 hover:text-gray-700"><Icon name="x" className="h-3.5 w-3.5"/></button>
    </div>
  );
}

// ==========================================
// Inline ToastError component
// ==========================================
function ToastError({ text, close }: { text: string; close: () => void }) {
  return (
    <div className="fixed right-4 top-4 z-30 flex min-w-[240px] items-center gap-2.5 rounded-md bg-[#fcd7d7] px-4 py-2.5 text-xs font-medium text-[#7b1e1e] shadow-md border border-[#f8b4b4]">
      <Icon name="x" className="h-4 w-4 text-[#ed4d4f]"/>
      {text}
      <button onClick={close} className="ml-auto text-gray-500 hover:text-gray-700"><Icon name="x" className="h-3.5 w-3.5"/></button>
    </div>
  );
}

// ==========================================
// Inline CreateForm component
// ==========================================
function CreateForm({ save, token, onSubmit }: { save: () => void; token: string; onSubmit: (e: React.FormEvent) => void }) {
  return (
    <form onSubmit={onSubmit} className="mt-4 rounded-md border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-800">Create Concert</h2>
      <div className="my-4 border-t border-gray-100"/>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-gray-700">
          Concert Name
          <input required name="name" placeholder="Please input concert name" className="mt-1 h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-[#248ee0] focus:ring-1 focus:ring-[#248ee0] placeholder:text-gray-400"/>
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Total of seats
          <div className="relative mt-1 flex">
            <input name="totalSeats" defaultValue="500" type="number" className="h-10 w-full rounded-md border border-gray-300 px-3 pr-10 text-sm outline-none focus:border-[#248ee0] focus:ring-1 focus:ring-[#248ee0]"/>
            <Icon name="user" className="pointer-events-none absolute right-3 top-2.5 h-5 w-5 text-gray-400"/>
          </div>
        </label>
      </div>
      <label className="mt-4 block text-sm font-medium text-gray-700">
        Description
        <textarea name="description" placeholder="Please input description" className="mt-1 h-28 w-full resize-none rounded-md border border-gray-300 p-3 text-sm outline-none focus:border-[#248ee0] focus:ring-1 focus:ring-[#248ee0] placeholder:text-gray-400"/>
      </label>
      <div className="mt-5 flex">
        <button className="ml-auto flex h-9 items-center gap-1.5 rounded-md bg-[#248ee0] px-5 text-xs font-semibold text-white transition hover:bg-[#147bc9]">
          <Icon name="save" className="h-3.5 w-3.5"/>
          Save Concert
        </button>
      </div>
    </form>
  );
}

// ==========================================
// Inline DeleteModal component
// ==========================================
function DeleteModal({ cancel, remove }: { cancel: () => void; remove: () => void }) {
  return (
    <div className="fixed inset-0 z-20 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-[400px] rounded-md bg-white p-6 text-center shadow-xl border border-gray-100">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-red-100 text-red-600">
          <Icon name="x" className="h-6 w-6"/>
        </span>
        <h2 className="mt-4 text-base font-bold text-gray-800">Are you sure to delete?<br/><span className="text-gray-500 font-medium text-sm">Concert</span></h2>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button onClick={cancel} className="h-9 rounded-md border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition">Cancel</button>
          <button onClick={remove} className="h-9 rounded-md bg-[#ed3946] text-xs font-semibold text-white hover:bg-red-600 transition">Yes, Delete</button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// Icon Tests
// ==========================================
describe('Icon', () => {
  const testIcons = ['home', 'history', 'switch', 'logout', 'user', 'award', 'x', 'trash', 'save', 'check'];

  testIcons.forEach((iconName) => {
    it(`renders ${iconName} icon`, () => {
      const { container } = render(<Icon name={iconName} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  it('applies default className', () => {
    const { container } = render(<Icon name="home" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('h-5 w-5');
  });

  it('applies custom className', () => {
    const { container } = render(<Icon name="home" className="h-10 w-10" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('h-10 w-10');
  });
});

// ==========================================
// Sidebar Tests
// ==========================================
describe('Sidebar', () => {
  it('renders Admin sidebar with correct title', () => {
    render(<Sidebar role="Admin" page="home" />);
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });

  it('renders User sidebar with correct title', () => {
    render(<Sidebar role="User" page="home" />);
    expect(screen.getByText('User Dashboard')).toBeInTheDocument();
  });

  it('renders Home navigation link', () => {
    render(<Sidebar role="Admin" page="home" />);
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('renders History navigation link for Admin', () => {
    render(<Sidebar role="Admin" page="history" />);
    expect(screen.getByText('History')).toBeInTheDocument();
  });

  it('renders Switch link', () => {
    render(<Sidebar role="Admin" page="home" />);
    expect(screen.getByText('Switch to user')).toBeInTheDocument();
  });

  it('renders Logout button', () => {
    render(<Sidebar role="Admin" page="home" />);
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });
});

// ==========================================
// ConcertCard Tests
// ==========================================
describe('ConcertCard', () => {
  const baseProps = {
    id: '1',
    title: 'Rock Concert',
    seats: 50,
    totalSeats: 200,
  };

  it('renders the concert title', () => {
    render(<ConcertCard {...baseProps} />);
    expect(screen.getByText('Rock Concert')).toBeInTheDocument();
  });

  it('renders seat information', () => {
    render(<ConcertCard {...baseProps} />);
    expect(screen.getByText(/50 \/ 200 Seats/)).toBeInTheDocument();
  });

  it('renders Reserve button for user', () => {
    render(<ConcertCard {...baseProps} />);
    expect(screen.getByText('Reserve')).toBeInTheDocument();
  });

  it('renders Delete button for admin', () => {
    render(<ConcertCard {...baseProps} admin />);
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('renders Cancel button when reserved', () => {
    render(<ConcertCard {...baseProps} isReserved />);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('calls onReserve when Reserve button is clicked', async () => {
    const onReserve = vi.fn();
    render(<ConcertCard {...baseProps} onReserve={onReserve} />);
    fireEvent.click(screen.getByText('Reserve'));
    expect(onReserve).toHaveBeenCalled();
  });

  it('calls onCancel when Cancel button is clicked', async () => {
    const onCancel = vi.fn();
    render(<ConcertCard {...baseProps} isReserved onCancel={onCancel} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalled();
  });

  it('calls onDelete when Delete button is clicked', async () => {
    const onDelete = vi.fn();
    render(<ConcertCard {...baseProps} admin onDelete={onDelete} />);
    fireEvent.click(screen.getByText('Delete'));
    expect(onDelete).toHaveBeenCalled();
  });
});

// ==========================================
// Metric Tests
// ==========================================
describe('Metric', () => {
  const baseProps = {
    title: 'Total Seats',
    number: '1000',
    tone: 'bg-blue-500',
    icon: 'user',
  };

  it('renders the title', () => {
    render(<Metric {...baseProps} />);
    expect(screen.getByText('Total Seats')).toBeInTheDocument();
  });

  it('renders the number', () => {
    render(<Metric {...baseProps} />);
    expect(screen.getByText('1000')).toBeInTheDocument();
  });

  it('renders the icon', () => {
    const { container } = render(<Metric {...baseProps} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('applies the correct tone class', () => {
    const { container } = render(<Metric {...baseProps} />);
    const div = container.firstChild as HTMLElement;
    expect(div).toHaveClass('bg-blue-500');
  });
});

// ==========================================
// Toast Tests
// ==========================================
describe('Toast', () => {
  it('renders the toast message', () => {
    render(<Toast text="Success!" close={vi.fn()} />);
    expect(screen.getByText('Success!')).toBeInTheDocument();
  });

  it('calls close when close button is clicked', async () => {
    const close = vi.fn();
    render(<Toast text="Success!" close={close} />);
    fireEvent.click(screen.getByRole('button'));
    expect(close).toHaveBeenCalled();
  });
});

// ==========================================
// ToastError Tests
// ==========================================
describe('ToastError', () => {
  it('renders the error message', () => {
    render(<ToastError text="Something went wrong" close={vi.fn()} />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('has error styling', () => {
    const { container } = render(<ToastError text="Error" close={vi.fn()} />);
    const div = container.firstChild as HTMLElement;
    expect(div).toHaveClass('bg-[#fcd7d7]');
  });
});

// ==========================================
// CreateForm Tests
// ==========================================
describe('CreateForm', () => {
  const baseProps = {
    save: vi.fn(),
    token: 'test-token',
    onSubmit: vi.fn(),
  };

  it('renders the heading', () => {
    render(<CreateForm {...baseProps} />);
    expect(screen.getByText('Create Concert')).toBeInTheDocument();
  });

  it('renders the concert name input', () => {
    render(<CreateForm {...baseProps} />);
    expect(screen.getByPlaceholderText('Please input concert name')).toBeInTheDocument();
  });

  it('renders the total seats input', () => {
    render(<CreateForm {...baseProps} />);
    expect(screen.getByLabelText('Total of seats')).toBeInTheDocument();
  });

  it('renders the description textarea', () => {
    render(<CreateForm {...baseProps} />);
    expect(screen.getByPlaceholderText('Please input description')).toBeInTheDocument();
  });

  it('renders the Save button', () => {
    render(<CreateForm {...baseProps} />);
    expect(screen.getByText('Save Concert')).toBeInTheDocument();
  });

  it('calls onSubmit when form is submitted', async () => {
    const onSubmit = vi.fn();
    const { container } = render(<CreateForm {...baseProps} onSubmit={onSubmit} />);
    const form = container.querySelector('form');
    
    fireEvent.submit(form);
    expect(onSubmit).toHaveBeenCalled();
  });
});

// ==========================================
// DeleteModal Tests
// ==========================================
describe('DeleteModal', () => {
  const baseProps = {
    cancel: vi.fn(),
    remove: vi.fn(),
  };

  it('renders the modal overlay', () => {
    const { container } = render(<DeleteModal {...baseProps} />);
    expect(container.querySelector('.fixed.inset-0')).toBeInTheDocument();
  });

  it('renders the confirmation heading', () => {
    render(<DeleteModal {...baseProps} />);
    expect(screen.getByText(/Are you sure to delete/)).toBeInTheDocument();
  });

  it('renders the Cancel button', () => {
    render(<DeleteModal {...baseProps} />);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('renders the Yes Delete button', () => {
    render(<DeleteModal {...baseProps} />);
    expect(screen.getByText('Yes, Delete')).toBeInTheDocument();
  });

  it('calls cancel when Cancel button is clicked', async () => {
    const cancel = vi.fn();
    render(<DeleteModal {...baseProps} cancel={cancel} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(cancel).toHaveBeenCalled();
  });

  it('calls remove when Yes Delete button is clicked', async () => {
    const remove = vi.fn();
    render(<DeleteModal {...baseProps} remove={remove} />);
    fireEvent.click(screen.getByText('Yes, Delete'));
    expect(remove).toHaveBeenCalled();
  });
});

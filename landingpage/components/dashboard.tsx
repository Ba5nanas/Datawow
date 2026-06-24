'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { deleteCookie } from '../utils/cookie';

const LANDINGPAGE_URL = process.env.LANDINGPAGE_URL || 'http://localhost:5001';

function getCookie(name: string) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : '';
}

// ==========================================
// API helpers
// ==========================================
async function apiFetch(endpoint: string, options: RequestInit, token: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(options.headers as Record<string, string>) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${LANDINGPAGE_URL}/api/concert${endpoint}`, { ...options, headers });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    const message = error.error || error.message || `Request failed (${res.status})`;
    throw new Error(message);
  }
  if (res.status === 204) return {};
  return res.json();
}

async function fetchConcerts(token: string) {
  return apiFetch('', { method: 'GET' }, token);
}

async function fetchConcertById(id: string, token: string) {
  return apiFetch(`/${id}`, { method: 'GET' }, token);
}

async function createConcert(token: string, data: { name: string; totalSeats: number; description?: string }) {
  return apiFetch('', { method: 'POST', body: JSON.stringify(data) }, token);
}

async function deleteConcert(id: string, token: string) {
  return apiFetch(`/${id}`, { method: 'DELETE' }, token);
}

async function reserveConcert(id: string, token: string) {
  return apiFetch(`/${id}/reserve`, { method: 'POST', body: '{}' }, token);
}

async function cancelConcert(id: string, token: string) {
  return apiFetch(`/${id}/cancel`, { method: 'POST', body: '{}' }, token);
}

async function getHistory(token: string) {
  return apiFetch('/history', { method: 'GET' }, token);
}

// ==========================================
// 1. COMPONENT: Icon
// ==========================================
interface IconProps {
  name: 'home' | 'history' | 'switch' | 'logout' | 'user' | 'award' | 'x' | 'trash' | 'save' | 'check';
  className?: string;
}

function Icon({ name, className = 'h-5 w-5' }: IconProps) {
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
  }
}

// ==========================================
// 2. COMPONENT: Sidebar
// ==========================================
function Sidebar({ role, page }: { role: 'Admin' | 'User'; page: 'home' | 'history' }) {
  const router = useRouter();
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
          <Link 
            key={href} 
            href={href} 
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${active ? 'bg-[#e7f4fa] text-[#248ee0]' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Icon name={icon} className="h-4 w-4" />
            {label}
          </Link>
        ))}
        <Link href={isAdmin ? '/user' : '/admin'} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
          <Icon name="switch" className="h-4 w-4" />
          {isAdmin ? 'Switch to user' : 'Switch to Admin'}
        </Link>
      </nav>
      
      <div className="mt-auto flex gap-1 lg:flex-col lg:gap-1.5">
        <button 
          onClick={async () => {
            await fetch('/api/logout', { method: 'POST' });
            deleteCookie('token');
            deleteCookie('role');
            router.push('/');
            router.refresh();
          }}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
        >
          <Icon name="logout" className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}

// ==========================================
// 3. COMPONENT: ConcertCard
// ==========================================
function ConcertCard({ id, title, seats, totalSeats, admin, onDelete, onReserve, onCancel, isReserved = false }: { 
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
  const [reserved, setReserved] = useState(isReserved);

  const handleReserve = async () => {
    if (onReserve) {
      await onReserve();
      setReserved(true);
    }
  };

  const handleCancel = async () => {
    if (onCancel) {
      await onCancel();
      setReserved(false);
    }
  };

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
            onClick={reserved ? handleCancel : handleReserve} 
            className={`h-9 min-w-[120px] rounded-md px-4 text-xs font-semibold text-white transition ${reserved ? 'bg-gray-400 hover:bg-gray-500' : 'bg-[#248ee0] hover:bg-[#147bc9]'}`}
          >
            {reserved ? 'Cancel' : 'Reserve'}
          </button>
        )}
      </div>
    </article>
  );
}

// ==========================================
// 4. COMPONENT: Metric
// ==========================================
function Metric({ title, number, tone, icon }: { title: string; number: string; tone: string; icon: 'user' | 'award' | 'x' }) { 
  return (
    <div className={`flex min-h-[100px] flex-col items-center justify-center rounded-md p-4 text-white shadow-sm ${tone}`}>
      <Icon name={icon} className="h-6 w-6 opacity-90"/>
      <span className="mt-1.5 text-xs opacity-80">{title}</span>
      <strong className="mt-1 text-2xl font-bold">{number}</strong>
    </div>
  ); 
}

// ==========================================
// 5. COMPONENT: Toast
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
// 6. MAIN PAGES
// ==========================================
export function UserHome() { 
  const [concerts, setConcerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const token = getCookie('token');

  useEffect(() => {
    if (!token) return;
    fetchConcerts(token)
      .then(setConcerts)
      .finally(() => setLoading(false));
  }, []);

  const handleReserve = async (id: string) => {
    try {
      await reserveConcert(id, token);
      setToast('Reserve successfully');
      setConcerts(prev => prev.map(c => c.id === id ? { ...c, isReserved: true } : c));
    } catch (err: any) {
      setToast(err.message || 'Reserve failed');
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await cancelConcert(id, token);
      setToast('Cancel successfully');
      setConcerts(prev => prev.map(c => c.id === id ? { ...c, isReserved: false } : c));
    } catch (err: any) {
      setToast(err.message || 'Cancel failed');
    }
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <Sidebar role="User" page="home"/>
      <main className="flex-1 space-y-4 bg-[#fafafa] p-4 lg:p-6">
        {toast && <Toast text={toast} close={() => setToast('')}/>}
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : (
          concerts.map(concert => (
            <ConcertCard 
              key={concert.id} 
              id={concert.id}
              title={concert.name} 
              seats={concert.totalSeats - (concert.reservedSeats || 0)}
              totalSeats={concert.totalSeats}
              token={token}
              isReserved={concert.isReserved}
              onReserve={() => handleReserve(concert.id)}
              onCancel={() => handleCancel(concert.id)}
            />
          ))
        )}
      </main>
    </div>
  ); 
}

export function AdminHistory() { 
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = getCookie('token');

  useEffect(() => {
    if (!token) return;
    getHistory(token)
      .then(setHistory)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <Sidebar role="Admin" page="history"/>
      <main className="flex-1 bg-[#fafafa] p-4 lg:p-6">
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : (
          <div className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
            <table className="w-full min-w-[600px] border-collapse text-left text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {['Date time', 'Username', 'Concert name', 'Action'].map(x => (
                    <th key={x} className="p-3 font-semibold text-gray-600">{x}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="p-3 text-gray-600">{row.dateTime || row.date || '—'}</td>
                    <td className="p-3 text-gray-600">{row.username || row.user?.name || '—'}</td>
                    <td className="p-3 text-gray-600">{row.concertName || row.concert?.name || '—'}</td>
                    <td className="p-3 text-gray-600">{row.action || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  ); 
}

export function AdminHome() {
  const [tab, setTab] = useState<'overview' | 'create'>('overview'); 
  const [deleteModal, setDeleteModal] = useState(false); 
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [concerts, setConcerts] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({ totalSeats: '0', reserved: '0', cancelled: '0' });
  const [loading, setLoading] = useState(true);
  const token = getCookie('token');

  useEffect(() => {
    if (!token) return;
    fetchConcerts(token)
      .then(data => {
        setConcerts(data);
        const totalSeats = data.reduce((sum, c) => sum + (c.totalSeats || 0), 0);
        const reserved = data.reduce((sum, c) => sum + (c.reservedSeats || 0), 0);
        setMetrics({ totalSeats: String(totalSeats), reserved: String(reserved), cancelled: '0' });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = (e.target as HTMLFormElement);
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const totalSeats = parseInt((form.elements.namedItem('totalSeats') as HTMLInputElement).value);
    const description = (form.elements.namedItem('description') as HTMLTextAreaElement).value;
    
    try {
      await createConcert(token, { name, totalSeats, description });
      setToast('Create successfully');
      setTab('overview');
      const updated = await fetchConcerts(token);
      setConcerts(updated);
      const totalSeatsSum = updated.reduce((sum, c) => sum + (c.totalSeats || 0), 0);
      const reservedSum = updated.reduce((sum, c) => sum + (c.reservedSeats || 0), 0);
      setMetrics({ totalSeats: String(totalSeatsSum), reserved: String(reservedSum), cancelled: '0' });
    } catch (err: any) {
      setToast(err.message || 'Create failed');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) { setDeleteModal(false); return; }
    try {
      await deleteConcert(deleteId, token);
      setToast('Delete successfully');
      setDeleteModal(false);
      setDeleteId(null);
      const updated = await fetchConcerts(token);
      setConcerts(updated);
      const totalSeatsSum = updated.reduce((sum, c) => sum + (c.totalSeats || 0), 0);
      const reservedSum = updated.reduce((sum, c) => sum + (c.reservedSeats || 0), 0);
      setMetrics({ totalSeats: String(totalSeatsSum), reserved: String(reservedSum), cancelled: '0' });
    } catch (err: any) {
      setToast(err.message || 'Delete failed');
    }
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <Sidebar role="Admin" page="home"/>
      {toast && <Toast text={toast} close={() => setToast('')}/>}
      
      <main className="flex-1 bg-[#fafafa] p-4 lg:p-6">
        <div className="grid gap-4 grid-cols-3">
          <Metric title="Total of seats" number={metrics.totalSeats} tone="bg-[#0878ae]" icon="user"/>
          <Metric title="Reserve" number={metrics.reserved} tone="bg-[#06ab8e]" icon="award"/>
          <Metric title="Cancel" number={metrics.cancelled} tone="bg-[#ed4d4f]" icon="x"/>
        </div>
        
        <div className="mt-8 flex gap-6 border-b border-gray-200 text-base">
          <button onClick={() => setTab('overview')} className={`pb-2 border-b-2 transition font-medium ${tab === 'overview' ? 'border-[#248ee0] text-[#248ee0]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Overview</button>
          <button onClick={() => setTab('create')} className={`pb-2 border-b-2 transition font-medium ${tab === 'create' ? 'border-[#248ee0] text-[#248ee0]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Create</button>
        </div>

        {tab === 'overview' ? (
          loading ? (
            <p className="mt-4 text-center text-gray-500">Loading...</p>
          ) : (
            <div className="mt-4 space-y-4">
              {concerts.map((concert, idx) => (
                <ConcertCard 
                  key={concert.id} 
                  id={concert.id}
                  title={concert.name} 
                  seats={concert.totalSeats - (concert.reservedSeats || 0)}
                  totalSeats={concert.totalSeats}
                  admin 
                  onDelete={() => { setDeleteId(concert.id); setDeleteModal(true); }}
                />
              ))}
            </div>
          )
        ) : (
          <CreateForm save={() => setTab('overview')} token={token} onSubmit={handleCreate}/>
        )}
      </main>
      
      {deleteModal && <DeleteModal cancel={() => { setDeleteModal(false); setDeleteId(null); }} remove={handleDelete}/>}
    </div>
  );
}

// ==========================================
// 7. COMPONENT: CreateForm
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
// 8. COMPONENT: DeleteModal
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

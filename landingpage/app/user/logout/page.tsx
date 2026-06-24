'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { deleteCookie } from '../../../utils/cookie';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    async function handleLogout() {
      try {
        await fetch('/api/logout', { method: 'POST' });
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        deleteCookie('token');
        deleteCookie('role');
        router.push('/');
        router.refresh();
      }
    }
    handleLogout();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
      <p className="text-gray-600">Logging out...</p>
    </div>
  );
}

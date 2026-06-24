'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AuthField } from '../../../components/auth-field';
import { setCookie, deleteCookie } from '../../../utils/cookie';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Reset cookies ก่อน login
    deleteCookie('token');
    deleteCookie('role');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const role = "admin";

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      const data = await res.json();
      setCookie('token', data.token, 7);
      setCookie('role', data.role, 7);
      
      router.push('/admin');
      router.refresh();
    } catch {
      setError('Internal server error');
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="w-full max-w-[450px] px-4">
        <h1 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
          Login
        </h1>

        <div className="mt-8 space-y-4">
          <AuthField label="Email" placeholder="Enter your Email Address" name="email" />
          <AuthField label="Password" placeholder="Enter your Password" password name="password" />
        </div>

        {error && (
          <p className="mt-4 text-center text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 h-11 w-full rounded-lg bg-[#248ee0] text-base font-semibold text-white transition hover:bg-[#147bc9] disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Login as Administrator'}
        </button>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/admin/register" className="font-medium text-[#248ee0] hover:underline">
            Create an account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

import { AuthLayout } from '../../../components/auth-layout';

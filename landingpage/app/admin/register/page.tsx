'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AuthField } from '../../../components/auth-field';
import { setCookie, deleteCookie } from '../../../utils/cookie';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Reset cookies ก่อน register
    deleteCookie('token');
    deleteCookie('role');

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password, role: 'admin' }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      setCookie('role', 'admin', 7);
      
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
          Sign Up
        </h1>

        <div className="mt-8 space-y-4">
          <AuthField label="Full name" placeholder="Enter your Full Name" name="fullName" />
          <AuthField label="Email" placeholder="Enter your Email Address" name="email" />
          <AuthField label="Password" placeholder="Create a Password" password name="password" />
          <AuthField label="Confirm Password" placeholder="Re-enter your Password" password name="confirmPassword" />
        </div>

        {error && (
          <p className="mt-4 text-center text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 h-11 w-full rounded-lg bg-[#248ee0] text-base font-semibold text-white transition hover:bg-[#147bc9] disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create an account'}
        </button>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/admin/login" className="font-medium text-[#248ee0] hover:underline">
            Login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

import { AuthLayout } from '../../../components/auth-layout';

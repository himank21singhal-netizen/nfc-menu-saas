'use client';

import React, { useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import { useRouter } from 'next/navigation';
import { Utensils, ArrowRight } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Helper to generate a random 32-character hex secret key for HMAC table security
  function generateHexSecret(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
  }

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    setSlug(formatted);
  };

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    // 1. Register User in Supabase Auth
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authErr || !authData.user) {
      setErrorMsg(authErr?.message || 'Failed to create user account.');
      setLoading(false);
      return;
    }

    const userId = authData.user.id;

    // 2. Attempt active sign-in
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // 3. Insert Restaurant record
    const secretKey = generateHexSecret();
    const { error: restErr } = await supabase.from('restaurants').insert([
      {
        owner_id: userId,
        name: restaurantName.trim(),
        slug: slug.trim(),
        secret_key: secretKey,
        currency: 'INR',
        subscription_tier: 'starter',
        orders_enabled: false
      }
    ]);

    setLoading(false);

    if (restErr) {
      setErrorMsg(`Account registered, but venue setup failed: ${restErr.message}`);
    } else if (signInErr) {
      alert('Venue registered! Please check your email or log in to access your dashboard.');
      router.push('/login');
    } else {
      router.push('/');
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-md space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
            <Utensils className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">Register Venue</h1>
          <p className="text-xs text-slate-400">Launch your NFC-secured digital menu in minutes</p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-semibold text-center leading-relaxed">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Restaurant Name</label>
            <input
              type="text"
              placeholder="e.g. Royal Spice Bistro"
              value={restaurantName}
              onChange={(e) => {
                setRestaurantName(e.target.value);
                if (!slug) handleSlugChange({ target: { value: e.target.value } } as any);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 text-slate-100"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Venue URL Slug</label>
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400 font-mono">
              <span className="text-slate-600">/m/</span>
              <input
                type="text"
                placeholder="royal-spice"
                value={slug}
                onChange={handleSlugChange}
                className="w-full bg-transparent focus:outline-none text-emerald-400 font-bold px-1"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Owner Email</label>
            <input
              type="email"
              placeholder="owner@restaurant.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 text-slate-100"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 text-slate-100"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Registering Venue...' : 'Create SaaS Account'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800/80 text-center">
          <p className="text-xs text-slate-500">
            Already have an account?{' '}
            <a href="/login" className="text-emerald-400 font-semibold hover:underline">
              Log In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
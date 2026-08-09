import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Lock, Mail, User, Phone, ArrowRight } from 'lucide-react';

interface RegisterPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { setUser, showToast } = useApp();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      alert('Please fill in all required fields');
      return;
    }

    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.slice(1).join(' ') || '';

    const newUser = {
      id: Math.floor(Math.random() * 1000) + 10,
      first_name: firstName,
      last_name: lastName,
      email,
      phone: phone || '01623319639',
      address: 'Dhaka, Bangladesh',
      city: 'Dhaka',
      avatar: (firstName[0] || 'U').toUpperCase(),
      role: 'member' as const
    };

    setUser(newUser);
    showToast(`Account created! Welcome ${fullName}!`);
    onNavigate('account');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#14b8a6] via-[#4f46e5] to-[#ec4899] text-white flex items-center justify-center mx-auto text-xl font-bold shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-[#0f3d44]">Create An Account</h1>
          <p className="text-xs text-slate-500">Join UNEX AURA for order tracking &amp; special offers</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Tanvir Hossain / আপনার পূর্ণ নাম"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#0f3d44] focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#0f3d44] focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01623319639"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#0f3d44] focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Password *</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#0f3d44] focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#14b8a6] via-[#4f46e5] via-[#9333ea] to-[#ec4899] hover:opacity-95 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Register Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <button onClick={() => onNavigate('login')} className="text-[#4f46e5] font-bold hover:underline">
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

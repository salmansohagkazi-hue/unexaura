import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Lock, Mail, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { setUser, showToast } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }

    const mockUser = {
      id: 1,
      first_name: email.includes('admin') ? 'Admin' : 'Tanvir',
      last_name: 'Hossain',
      email,
      phone: '01623319639',
      address: 'Dhaka, Bangladesh',
      city: 'Dhaka',
      avatar: 'TH',
      role: email.includes('admin') ? ('admin' as const) : ('member' as const)
    };

    setUser(mockUser);
    showToast(`Welcome back, ${mockUser.first_name}!`);
    if (mockUser.role === 'admin') {
      onNavigate('admin');
    } else {
      onNavigate('account');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#14b8a6] via-[#4f46e5] to-[#ec4899] text-white flex items-center justify-center mx-auto text-xl font-bold shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-[#0f3d44]">Welcome Back</h1>
          <p className="text-xs text-slate-500">Sign in to your UNEX AURA account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#0f3d44] focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#0f3d44] focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#14b8a6] via-[#4f46e5] via-[#9333ea] to-[#ec4899] hover:opacity-95 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center space-y-2 text-xs">
          <p className="text-slate-500">
            Don&apos;t have an account?{' '}
            <button onClick={() => onNavigate('register')} className="text-[#4f46e5] font-bold hover:underline">
              Create One
            </button>
          </p>

          <p className="text-[11px] text-slate-400 pt-2">
            💡 Demo Admin Email: <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-mono">admin@unexaura.com</code>
          </p>
        </div>
      </div>
    </div>
  );
};

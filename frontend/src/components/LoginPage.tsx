import React, { useEffect, useState } from 'react';
import { ShieldCheck, Building2, MapPin, Phone, Lock, User, KeyRound, Activity, Stethoscope } from 'lucide-react';
import { api, setAuthToken } from '../services/api';
import { UserAccount } from '../types/hms';

interface LoginPageProps {
  onLoginSuccess: (user: UserAccount) => void;
}

interface DemoAccount {
  role: string;
  username: string;
  password: string;
  name: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('owner');
  const [password, setPassword] = useState('Mahalakshmi@2026');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoAccounts, setDemoAccounts] = useState<DemoAccount[]>([]);

  useEffect(() => {
    api.get<DemoAccount[]>('/auth/demo-accounts')
      .then(setDemoAccounts)
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post<{ token: string; user: UserAccount }>('/auth/login', {
        username,
        password,
      });
      setAuthToken(res.token);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (acc: DemoAccount) => {
    setUsername(acc.username);
    setPassword(acc.password);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-950 to-sky-950 flex flex-col justify-center items-center p-4 md:p-8">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl shadow-2xl overflow-hidden border border-teal-500/20">
        
        {/* Left Branding Panel */}
        <div className="lg:col-span-7 bg-gradient-to-br from-teal-800 via-teal-900 to-slate-900 text-white p-8 md:p-10 flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-teal-400/20 border border-teal-300/30 flex items-center justify-center">
                <Stethoscope className="w-7 h-7 text-teal-300" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest text-teal-300 font-semibold block">
                  Centralized Hospital Operations & EMR Platform
                </span>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                  MAHALAKSHMI HOSPITAL
                </h1>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/15 mb-6 space-y-2 text-sm text-teal-50">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-teal-300 shrink-0 mt-0.5" />
                <span>
                  Kasturivari Street (Ramamahal Ladies Gate Street), R.R.Pet Main Road, Eluru, Andhra Pradesh 534002
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-teal-300 shrink-0" />
                <span>24x7 Emergency & Trauma: +91 98481-10800 | Desk: +91 8812-234567</span>
              </div>
            </div>

            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-300 mb-3">
               Specialized Centres of Excellence (15 Clinical Services)
            </h2>
            <div className="flex flex-wrap gap-1.5 mb-8">
              {[
                'Orthopaedics', 'Joint Replacement', 'Fractures', 'Spine Surgeries',
                'Trauma', 'Joint Inflammation', 'Ligament Tears', 'Keyhole Surgeries',
                'General Surgery', 'Anaesthesiology', 'Diagnostic Imaging', 'Emergency Care',
                'General Checkups', 'Outpatient Services', 'Hospice Care'
              ].map((srv) => (
                <span
                  key={srv}
                  className="px-2.5 py-1 rounded-full text-xs font-medium bg-teal-950/70 text-teal-200 border border-teal-700/60"
                >
                  {srv}
                </span>
              ))}
            </div>
          </div>

          {/* Role-Based Quick Login Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5" /> Role-Based Access Accounts (Click to Fill)
              </span>
              <span className="text-[11px] text-teal-200/80">BCrypt + JWT RBAC</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.username}
                  type="button"
                  onClick={() => quickFill(acc)}
                  className={`text-left p-2.5 rounded-xl border transition-all ${
                    username === acc.username
                      ? 'bg-teal-500/30 border-teal-300 text-white shadow-sm'
                      : 'bg-slate-900/50 border-white/10 text-slate-200 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-200">{acc.role}</span>
                    <span className="text-[11px] font-mono bg-black/30 px-1.5 py-0.5 rounded text-teal-300">
                      @{acc.username}
                    </span>
                  </div>
                  <div className="text-xs text-white/90 truncate mt-0.5">{acc.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Login Form Panel */}
        <div className="lg:col-span-5 p-8 md:p-10 flex flex-col justify-center bg-white">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold mb-3 border border-teal-200">
              <ShieldCheck className="w-4 h-4" /> Secure Staff & Owner Portal
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Sign In to HMS</h2>
            <p className="text-sm text-slate-500 mt-1">
              Access real-time hospital operations, patient EMR, lab reports, OT schedules, and billing.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 outline-none text-sm"
                  placeholder="Enter username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 outline-none text-sm"
                  placeholder="Enter password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-sky-700 hover:from-teal-700 hover:to-sky-800 text-white font-semibold text-sm shadow-lg shadow-teal-600/25 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Activity className="w-4 h-4" />
              {loading ? 'Authenticating...' : 'Sign In to Mahalakshmi HMS'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-xs text-slate-500 space-y-1.5">
            <div className="flex items-center gap-2 font-medium text-slate-700">
              <Building2 className="w-4 h-4 text-teal-600" />
              Mahalakshmi Hospital — Eluru, AP 534002
            </div>
            <p>
              All medical records, blood reports, and financial transactions are audit-logged and protected by Role-Based Access Control.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api';
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  Zap,
  CheckCircle2,
  Activity,
  KeyRound,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [passErr, setPassErr] = useState('');

  useEffect(() => {
    if (localStorage.getItem('fraudshield_token')) router.push('/dashboard');
  }, [router]);

  const validate = () => {
    let ok = true;
    if (!email) {
      setEmailErr('Email is required');
      ok = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailErr('Please enter a valid email address');
      ok = false;
    } else {
      setEmailErr('');
    }

    if (!password) {
      setPassErr('Password is required');
      ok = false;
    } else {
      setPassErr('');
    }
    return ok;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await login({ email, password });
      localStorage.setItem('fraudshield_token', res.token);
      localStorage.setItem('fraudshield_user', JSON.stringify(res.user));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setEmailErr('');
    setPassErr('');
    setError('');
  };

  return (
    <div className="min-h-screen flex bg-slate-950 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Left decorative presentation panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-950 text-white border-r border-slate-800/80">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Top */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white">FraudShield</h1>
            <p className="text-[11px] font-mono text-indigo-300">Enterprise AI Risk Platform</p>
          </div>
        </div>

        {/* Main Value Proposition */}
        <div className="max-w-md relative z-10 my-auto py-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Autonomous Risk Adjudication v2.4</span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl leading-tight">
            Protect financial transactions in real-time.
          </h2>
          <p className="text-sm text-slate-300 mt-4 leading-relaxed">
            Sub-millisecond inference across XGBoost and Isolation Forest models. Stop fraudulent account takeovers, card velocity spikes, and laundering rings instantly.
          </p>

          <div className="grid grid-cols-2 gap-3.5 mt-8">
            {[
              { label: 'Latency SLA', value: '<200ms', desc: 'Sync scoring window', icon: Zap },
              { label: 'Detection Rate', value: '>95.4%', desc: 'Validated accuracy', icon: Shield },
              { label: 'False Positives', value: '<0.8%', desc: 'Minimal friction', icon: CheckCircle2 },
              { label: 'Throughput', value: '10,000 TPS', desc: 'Distributed cluster', icon: Activity },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-indigo-400 mb-1">
                    <Icon className="w-4 h-4" />
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{item.label}</span>
                  </div>
                  <p className="text-lg font-bold text-white tracking-tight">{item.value}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Compliance Footer */}
        <div className="text-xs text-slate-400 flex items-center justify-between relative z-10 pt-4 border-t border-slate-800/80">
          <span>PCI-DSS Level 1 · SOC 2 Type II Compliant</span>
          <span className="font-mono">v1.0.0-prod</span>
        </div>
      </div>

      {/* Right sign-in form panel */}
      <div className="w-full lg:w-[480px] xl:w-[520px] flex items-center justify-center p-6 sm:p-10 bg-white">
        <div className="w-full max-w-sm space-y-6">
          {/* Header */}
          <div>
            <div className="lg:hidden flex items-center gap-2.5 mb-6">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-slate-900">FraudShield</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sign in to console</h2>
            <p className="text-xs text-slate-500 mt-1">Enter your credentials to access security operations</p>
          </div>

          {/* Quick Demo Credentials Pill Bar */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-3 h-3 text-indigo-600" />
                <span>Demo Accounts</span>
              </span>
              <span className="text-[10px] text-slate-400">Click to autofill</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDemoCredentials('admin@fraudshield.com', 'admin123')}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-indigo-50 hover:border-indigo-200 text-left transition-colors"
              >
                <p className="text-xs font-semibold text-slate-800">Admin User</p>
                <p className="text-[10px] font-mono text-slate-400">admin@fraudshield.com</p>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('analyst@bank.com', 'analyst123')}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-indigo-50 hover:border-indigo-200 text-left transition-colors"
              >
                <p className="text-xs font-semibold text-slate-800">Analyst User</p>
                <p className="text-[10px] font-mono text-slate-400">analyst@bank.com</p>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-rose-800 animate-slideDown">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="email-input"
                  type="email"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    setEmailErr('');
                  }}
                  placeholder="analyst@bank.com"
                  className={`w-full pl-9 pr-3 py-2.5 text-xs rounded-lg border bg-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                    emailErr
                      ? 'border-rose-300 ring-2 ring-rose-500/10 focus:border-rose-500'
                      : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-500/20'
                  }`}
                />
              </div>
              {emailErr && <p className="text-[11px] text-rose-600 mt-1">{emailErr}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => alert('Please contact your system administrator to reset credentials.')}
                  className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    setPassErr('');
                  }}
                  placeholder="••••••••••••"
                  className={`w-full pl-9 pr-10 py-2.5 text-xs rounded-lg border bg-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                    passErr
                      ? 'border-rose-300 ring-2 ring-rose-500/10 focus:border-rose-500'
                      : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-500/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passErr && <p className="text-[11px] text-rose-600 mt-1">{passErr}</p>}
            </div>

            <button
              id="login-btn"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed pt-3 pb-3"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-[11px] text-slate-400 pt-4">
            Protected by hardware-grade encryption & audit logging.
          </p>
        </div>
      </div>
    </div>
  );
}

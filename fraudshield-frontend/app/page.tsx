'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, RefreshCw } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('fraudshield_token');
    if (token) router.push('/dashboard');
    else router.push('/auth/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shadow-xl shadow-indigo-600/20 animate-pulse">
            <Shield className="w-8 h-8 text-indigo-400" />
          </div>
          <RefreshCw className="w-20 h-20 text-indigo-500/30 animate-spin absolute" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-100 tracking-tight">FraudShield Enterprise</h2>
          <p className="text-xs text-slate-400 mt-1">Initializing secure session...</p>
        </div>
      </div>
    </div>
  );
}

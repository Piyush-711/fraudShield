'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/app/dashboard/layout';
import { Sliders, Users, ShieldAlert, ShieldCheck } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let user: any = null;
    const u = localStorage.getItem('fraudshield_user');
    if (u && u !== 'undefined') {
      try {
        user = JSON.parse(u);
      } catch (e) {
        console.error("Failed to parse user in admin layout:", e);
      }
    }
    if (user?.role !== 'SYSTEM_ADMIN') {
      router.push('/dashboard');
    } else {
      setAuthorized(true);
    }
  }, [router]);

  const tabs = [
    { href: '/admin/settings', label: 'System Settings', icon: Sliders },
    { href: '/admin/users', label: 'User Directory', icon: Users },
  ];

  if (!authorized) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 shadow-sm w-fit mb-6">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
      {children}
    </DashboardLayout>
  );
}

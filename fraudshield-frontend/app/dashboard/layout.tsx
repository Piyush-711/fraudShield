'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  CreditCard,
  Bell,
  FileText,
  Settings,
  Users,
  Shield,
  LogOut,
  Menu,
  ChevronRight,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  Server,
  Cpu,
  Layers,
  Activity,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  badge?: boolean;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/transactions', label: 'Transactions', icon: CreditCard },
  { href: '/dashboard/alerts', label: 'Alerts', icon: Bell, badge: true },
  { href: '/dashboard/reports', label: 'Reports', icon: FileText },
  { href: '/admin/settings', label: 'Settings', icon: Settings, adminOnly: true },
  { href: '/admin/users', label: 'Users', icon: Users, adminOnly: true },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [alertCount] = useState(3);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const token = localStorage.getItem('fraudshield_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    const u = localStorage.getItem('fraudshield_user');
    if (u && u !== 'undefined') {
      try {
        setUser(JSON.parse(u));
      } catch (e) {
        console.error('Failed to parse fraudshield_user:', e);
      }
    }
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('fraudshield_token');
    localStorage.removeItem('fraudshield_user');
    router.push('/auth/login');
  };

  const isAdmin = user?.role === 'SYSTEM_ADMIN';
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-indigo-500 selection:text-white">
      {/* ── Top Navigation Bar ── */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 z-50 flex items-center justify-between px-4 sm:px-6 transition-all duration-200 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Brand Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
              <Shield className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 text-base tracking-tight leading-none flex items-center gap-1.5">
                FraudShield
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60 tracking-wider">
                  Enterprise
                </span>
              </span>
              <span className="text-[11px] text-slate-600 font-medium tracking-tight">
                Real-Time Risk Engine
              </span>
            </div>
          </Link>

          {/* Live Operational Status */}
          <div className="hidden lg:flex items-center gap-2 pl-4 ml-4 border-l border-slate-200 text-xs text-slate-600">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-medium text-slate-700">Systems Operational</span>
          </div>
        </div>

        {/* Global Search Bar (Simulated Command Palette) */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              readOnly
              onClick={() => router.push('/dashboard/transactions')}
              placeholder="Search transactions, users, or alerts... (Press ⌘K)"
              className="w-full pl-9 pr-12 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-lg text-slate-600 placeholder-slate-600 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-600 bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow-2xs">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Live Clock */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 font-medium bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/60">
            <Clock className="w-3.5 h-3.5 text-slate-600" />
            <span>
              {time.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
          </div>

          {/* Notifications Bell */}
          <Link
            href="/dashboard/alerts"
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="Active Alerts"
          >
            <Bell className="w-5 h-5 stroke-[1.8]" />
            {alertCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                {alertCount}
              </span>
            )}
          </Link>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="flex items-center gap-2.5 py-1 px-2 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                {user?.name?.charAt(0) ?? 'U'}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-800 leading-tight">
                  {user?.name ?? 'User'}
                </span>
                <span className="text-[10px] font-medium text-slate-600 leading-tight">
                  {user?.role ? user.role.replace(/_/g, ' ') : 'Operator'}
                </span>
              </div>
            </div>

            {/* Logout Action */}
            <button
              onClick={handleLogout}
              className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Application Body ── */}
      <div className="flex pt-16 flex-1">
        {/* ── Sidebar ── */}
        <aside
          className={`fixed top-16 bottom-0 left-0 bg-white border-r border-slate-200/80 z-40 transition-all duration-300 ease-in-out flex flex-col justify-between overflow-y-auto ${
            sidebarOpen ? 'w-64' : 'w-0 -translate-x-full lg:translate-x-0 lg:w-20'
          }`}
        >
          <div className="p-3 space-y-6">
            <div>
              <p
                className={`text-[11px] font-semibold uppercase tracking-wider text-slate-600 px-3 mb-2 ${
                  !sidebarOpen && 'lg:hidden'
                }`}
              >
                Core Platform
              </p>
              <nav className="space-y-1">
                {navItems
                  .filter((item) => !item.adminOnly || isAdmin)
                  .map((item) => {
                    const active = isActive(item.href, item.exact);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group relative ${
                          active
                            ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                        title={!sidebarOpen ? item.label : undefined}
                      >
                        {/* Active vertical bar indicator */}
                        {active && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-600 rounded-r-full" />
                        )}
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                            active ? 'text-indigo-600 stroke-[2.2]' : 'text-slate-400 group-hover:text-slate-600 stroke-[1.8]'
                          }`}
                        />
                        <span className={`truncate flex-1 ${!sidebarOpen && 'lg:hidden'}`}>
                          {item.label}
                        </span>

                        {item.badge && alertCount > 0 && (
                          <span
                            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                              active
                                ? 'bg-indigo-600 text-white'
                                : 'bg-rose-100 text-rose-700'
                            } ${!sidebarOpen && 'lg:hidden'}`}
                          >
                            {alertCount}
                          </span>
                        )}

                        {active && (
                          <ChevronRight
                            className={`w-3.5 h-3.5 text-indigo-400 shrink-0 ${
                              !sidebarOpen && 'lg:hidden'
                            }`}
                          />
                        )}
                      </Link>
                    );
                  })}
              </nav>
            </div>

            {/* Quick Engine Telemetry */}
            <div className={`${!sidebarOpen && 'lg:hidden'} bg-slate-50/80 rounded-xl p-3 border border-slate-200/60 space-y-2.5`}>
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-indigo-500" />
                  Engine Telemetry
                </span>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                  99.98%
                </span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Server className="w-3 h-3 text-slate-400" /> Database (PostgreSQL)
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="Connected"></span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Cpu className="w-3 h-3 text-slate-400" /> ML Engine (v2.1)
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="Connected"></span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3 h-3 text-slate-400" /> Kafka Pipeline
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active"></span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className={`p-4 border-t border-slate-100 text-[11px] text-slate-400 text-center ${!sidebarOpen && 'lg:hidden'}`}>
            <p className="font-medium text-slate-500">FraudShield Enterprise</p>
            <p className="text-[10px] text-slate-400">Release 2.1.0 · SOC-2 Compliant</p>
          </div>
        </aside>

        {/* ── Main Content Area ── */}
        <main
          className={`flex-1 transition-all duration-300 ease-in-out p-6 sm:p-8 min-h-[calc(100vh-4rem)] ${
            sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
          }`}
        >
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

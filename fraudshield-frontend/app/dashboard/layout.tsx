'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊', exact: true },
  { href: '/dashboard/transactions', label: 'Transactions', icon: '💳' },
  { href: '/dashboard/alerts', label: 'Alerts', icon: '🔔', badge: true },
  { href: '/dashboard/reports', label: 'Reports', icon: '📈' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️', adminOnly: true },
  { href: '/admin/users', label: 'Users', icon: '👥', adminOnly: true },
];

interface Props { children: React.ReactNode; }

export default function DashboardLayout({ children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [alertCount] = useState(3);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const token = localStorage.getItem('fraudshield_token');
    if (!token) { router.push('/auth/login'); return; }
    const u = localStorage.getItem('fraudshield_user');
    if (u && u !== 'undefined') {
      try {
        setUser(JSON.parse(u));
      } catch (e) {
        console.error("Failed to parse fraudshield_user:", e);
      }
    }
    const timer = setInterval(() => setTime(new Date()), 60000);
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
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh', fontFamily:'Inter,sans-serif' }}>
      {/* ── Header ── */}
      <header style={{
        position:'fixed', top:0, left:0, right:0, height:60,
        background:'white', borderBottom:'1px solid #E5E7EB',
        display:'flex', alignItems:'center', padding:'0 20px',
        zIndex:1000, boxShadow:'0 1px 3px rgba(0,0,0,0.05)',
      }}>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{ background:'none', border:'none', cursor:'pointer', fontSize:20, marginRight:16, color:'#6B7280', padding:4, borderRadius:6 }}
          aria-label="Toggle sidebar"
        >☰</button>

        {/* Logo */}
        <Link href="/dashboard" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
          <div style={{ width:34, height:34, borderRadius:10, background:'linear-gradient(135deg,#4F46E5,#7C3AED)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🛡️</div>
          <span style={{ fontSize:17, fontWeight:700, color:'#1F2937' }}>FraudShield</span>
        </Link>

        {/* Status indicator */}
        <div style={{ marginLeft:20, display:'flex', alignItems:'center', gap:6, background:'#D1FAE5', borderRadius:20, padding:'4px 12px' }}>
          <span style={{ width:8, height:8, borderRadius:'50%', background:'#10B981', display:'inline-block', animation:'pulse 2s infinite' }} />
          <span style={{ fontSize:12, fontWeight:500, color:'#065F46' }}>All Systems Operational</span>
        </div>

        <div style={{ flex:1 }} />

        {/* Right side */}
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          {/* Time */}
          <span style={{ fontSize:13, color:'#9CA3AF' }}>
            {time.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' })}
          </span>

          {/* Alerts bell */}
          <Link href="/dashboard/alerts" style={{ position:'relative', textDecoration:'none', padding:8, borderRadius:8, background:'transparent', border:'none', cursor:'pointer', display:'flex', alignItems:'center' }}>
            <span style={{ fontSize:20 }}>🔔</span>
            {alertCount > 0 && (
              <span style={{ position:'absolute', top:2, right:2, width:18, height:18, background:'#EF4444', borderRadius:'50%', fontSize:10, fontWeight:700, color:'white', display:'flex', alignItems:'center', justifyContent:'center' }}>{alertCount}</span>
            )}
          </Link>

          {/* User dropdown */}
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'6px 12px', borderRadius:8, background:'#F9FAFB', border:'1px solid #E5E7EB', cursor:'pointer' }}>
            <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#4F46E5,#7C3AED)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:13, fontWeight:600 }}>
              {user?.name?.charAt(0) ?? 'U'}
            </div>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:'#1F2937', lineHeight:1 }}>{user?.name ?? 'User'}</div>
              <div style={{ fontSize:11, color:'#9CA3AF', lineHeight:1.4 }}>{user?.role?.replace('_',' ') ?? ''}</div>
            </div>
            <button onClick={handleLogout} title="Logout" style={{ background:'none', border:'none', cursor:'pointer', fontSize:16, color:'#9CA3AF', padding:2 }}>↪</button>
          </div>
        </div>
      </header>

      <div style={{ display:'flex', marginTop:60, flex:1 }}>
        {/* ── Sidebar ── */}
        <aside style={{
          width: sidebarOpen ? 260 : 0, minHeight:'calc(100vh - 60px)',
          background:'white', borderRight:'1px solid #E5E7EB',
          overflow:'hidden', transition:'width 0.2s ease',
          position:'fixed', top:60, bottom:0, left:0, zIndex:999,
        }}>
          <div style={{ padding:'20px 12px', width:260 }}>
            <p style={{ fontSize:11, fontWeight:600, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.08em', margin:'0 0 8px 8px' }}>Navigation</p>
            <nav>
              {navItems.filter(item => !item.adminOnly || isAdmin).map(item => {
                const active = isActive(item.href, item.exact);
                return (
                  <Link key={item.href} href={item.href} style={{
                    display:'flex', alignItems:'center', gap:12, padding:'10px 12px',
                    borderRadius:8, marginBottom:2, textDecoration:'none',
                    background: active ? '#EEF2FF' : 'transparent',
                    color: active ? '#4F46E5' : '#374151',
                    fontWeight: active ? 600 : 400, fontSize:14,
                    transition:'all 0.15s',
                  }}>
                    <span style={{ fontSize:18 }}>{item.icon}</span>
                    <span style={{ flex:1 }}>{item.label}</span>
                    {item.badge && alertCount > 0 && (
                      <span style={{ background:'#EF4444', color:'white', borderRadius:10, padding:'2px 7px', fontSize:11, fontWeight:600 }}>{alertCount}</span>
                    )}
                    {active && <span style={{ color:'#4F46E5' }}>›</span>}
                  </Link>
                );
              })}
            </nav>

            <div style={{ margin:'20px 0', borderTop:'1px solid #F3F4F6' }} />

            {/* System health */}
            <div style={{ background:'#F9FAFB', borderRadius:8, padding:12 }}>
              <p style={{ fontSize:11, fontWeight:600, color:'#6B7280', margin:'0 0 8px' }}>SYSTEM HEALTH</p>
              {[
                { name:'Database', status:'UP', color:'#10B981' },
                { name:'Kafka', status:'UP', color:'#10B981' },
                { name:'Redis', status:'UP', color:'#10B981' },
                { name:'ML Service', status:'UP', color:'#10B981' },
              ].map(s => (
                <div key={s.name} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                  <span style={{ fontSize:12, color:'#6B7280' }}>{s.name}</span>
                  <span style={{ fontSize:11, fontWeight:600, color:s.color, background:'#D1FAE5', borderRadius:4, padding:'2px 6px' }}>{s.status}</span>
                </div>
              ))}
            </div>

            <p style={{ fontSize:11, color:'#D1D5DB', textAlign:'center', marginTop:16 }}>FraudShield v1.0.0</p>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main style={{
          flex:1, marginLeft: sidebarOpen ? 260 : 0,
          transition:'margin-left 0.2s ease',
          background:'#F9FAFB', minHeight:'calc(100vh - 60px)',
          padding:'28px',
        }}>
          {children}
        </main>
      </div>

      <style>{`
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        @media (max-width:768px) {
          aside { display:none; }
          main { margin-left:0 !important; padding:16px !important; }
        }
      `}</style>
    </div>
  );
}

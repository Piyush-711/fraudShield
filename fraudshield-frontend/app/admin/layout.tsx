'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

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
    }
  }, [router]);

  const tabs = [
    { href:'/admin/settings', label:'⚙️ System Settings' },
    { href:'/admin/users', label:'👥 User Management' },
  ];

  return (
    <div>
      <div style={{ display:'flex', gap:4, marginBottom:24, background:'white', borderRadius:10, padding:4, border:'1px solid #E5E7EB', width:'fit-content' }}>
        {tabs.map(tab => (
          <Link key={tab.href} href={tab.href} style={{ padding:'8px 18px', borderRadius:8, textDecoration:'none', fontSize:13, fontWeight:600, background: pathname===tab.href?'#4F46E5':'transparent', color: pathname===tab.href?'white':'#6B7280', transition:'all 0.15s' }}>
            {tab.label}
          </Link>
        ))}
      </div>
      {children}
    </div>
  );
}

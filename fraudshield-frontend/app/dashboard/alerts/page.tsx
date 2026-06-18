'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchAlerts, acknowledgeAlert } from '@/lib/api';
import { Alert, AlertSeverity, AlertStatus } from '@/lib/types';
import { timeAgo, formatDate } from '@/lib/mockData';

const severityConfig: Record<AlertSeverity, { color:string; bg:string; icon:string }> = {
  CRITICAL: { color:'#991B1B', bg:'#FEE2E2', icon:'🔴' },
  HIGH:     { color:'#92400E', bg:'#FEF3C7', icon:'🟠' },
  MEDIUM:   { color:'#1E40AF', bg:'#DBEAFE', icon:'🟡' },
  LOW:      { color:'#065F46', bg:'#D1FAE5', icon:'🟢' },
};

const typeIcon: Record<string, string> = {
  FRAUD_DETECTED: '🚨', PERF_DEGRADED: '⚡', SERVICE_DOWN: '🔴',
  INFRA_ALERT: '🔧', SECURITY_ALERT: '🔒', THRESHOLD_EXCEEDED: '⚠️',
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [actionMenu, setActionMenu] = useState<number|null>(null);
  const [toast, setToast] = useState('');

  const load = async () => {
    setLoading(true);
    const data = await fetchAlerts();
    setAlerts(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleAction = async (id: number, action: 'ACKNOWLEDGED'|'RESOLVED'|'ESCALATED') => {
    await acknowledgeAlert(id, action);
    setActionMenu(null);
    showToast(`Alert ${action.toLowerCase()} successfully`);
    load();
  };

  const filtered = alerts.filter(a => {
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
    if (severityFilter !== 'ALL' && a.severity !== severityFilter) return false;
    if (search && !a.title.toLowerCase().includes(search.toLowerCase()) && !a.message.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = { ACTIVE: alerts.filter(a=>a.status==='ACTIVE').length, ACKNOWLEDGED: alerts.filter(a=>a.status==='ACKNOWLEDGED').length, RESOLVED: alerts.filter(a=>a.status==='RESOLVED').length };

  return (
    <div style={{ animation:'fadeIn 0.3s ease' }}>
      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <nav style={{ fontSize:12, color:'#9CA3AF', marginBottom:8 }}>
          <Link href="/dashboard" style={{ color:'#6B7280', textDecoration:'none' }}>Dashboard</Link>
          <span style={{ margin:'0 6px' }}>›</span>
          <span style={{ color:'#1F2937' }}>Alerts</span>
        </nav>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:700, color:'#1F2937', margin:'0 0 4px' }}>🔔 Alerts Dashboard</h1>
            <p style={{ fontSize:13, color:'#9CA3AF', margin:0 }}>Monitor and respond to system alerts in real-time</p>
          </div>
          <button onClick={load} style={{ padding:'8px 16px', borderRadius:8, border:'1px solid #E5E7EB', background:'white', cursor:'pointer', fontSize:13, color:'#374151' }}>🔄 Refresh</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
        {[
          { label:'Active', count:counts.ACTIVE, color:'#EF4444', bg:'#FEE2E2', icon:'🔴', filter:'ACTIVE' },
          { label:'Acknowledged', count:counts.ACKNOWLEDGED, color:'#F59E0B', bg:'#FEF3C7', icon:'👁️', filter:'ACKNOWLEDGED' },
          { label:'Resolved', count:counts.RESOLVED, color:'#10B981', bg:'#D1FAE5', icon:'✅', filter:'RESOLVED' },
        ].map(c => (
          <button key={c.label} onClick={() => setStatusFilter(statusFilter===c.filter?'ALL':c.filter)}
            style={{ background:'white', border:`2px solid ${statusFilter===c.filter?c.color:'#E5E7EB'}`, borderRadius:12, padding:16, cursor:'pointer', textAlign:'left', transition:'all 0.15s' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <p style={{ fontSize:12, color:'#6B7280', margin:'0 0 4px', fontWeight:500 }}>{c.label}</p>
                <p style={{ fontSize:28, fontWeight:700, color:c.color, margin:0 }}>{c.count}</p>
              </div>
              <span style={{ fontSize:32, background:c.bg, borderRadius:10, padding:'6px 10px' }}>{c.icon}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background:'white', borderRadius:12, border:'1px solid #E5E7EB', padding:'12px 16px', marginBottom:16, display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{ padding:'8px 12px', borderRadius:8, border:'1px solid #E5E7EB', fontSize:13, background:'white', cursor:'pointer' }}>
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="ACKNOWLEDGED">Acknowledged</option>
          <option value="RESOLVED">Resolved</option>
          <option value="ESCALATED">Escalated</option>
        </select>
        <select value={severityFilter} onChange={e=>setSeverityFilter(e.target.value)} style={{ padding:'8px 12px', borderRadius:8, border:'1px solid #E5E7EB', fontSize:13, background:'white', cursor:'pointer' }}>
          <option value="ALL">All Severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
        <div style={{ flex:1, minWidth:180, position:'relative' }}>
          <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#9CA3AF' }}>🔍</span>
          <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search alerts..." style={{ width:'100%', padding:'8px 12px 8px 32px', borderRadius:8, border:'1px solid #E5E7EB', fontSize:13, outline:'none', boxSizing:'border-box' }} />
        </div>
      </div>

      {/* Alerts List */}
      <div style={{ background:'white', borderRadius:12, border:'1px solid #E5E7EB', overflow:'hidden' }}>
        {loading ? (
          <div style={{ padding:60, textAlign:'center' }}>
            <div style={{ width:36, height:36, border:'3px solid #E5E7EB', borderTopColor:'#4F46E5', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding:60, textAlign:'center' }}>
            <span style={{ fontSize:40 }}>🎉</span>
            <p style={{ fontSize:16, fontWeight:600, color:'#374151', margin:'12px 0 4px' }}>No alerts found</p>
            <p style={{ fontSize:13, color:'#9CA3AF' }}>Adjust your filters or check back later</p>
          </div>
        ) : (
          filtered.map((alert, i) => {
            const sev = severityConfig[alert.severity];
            const isActive = alert.status === 'ACTIVE';
            return (
              <div key={alert.id} style={{ padding:'16px 20px', borderBottom: i < filtered.length-1 ? '1px solid #F3F4F6' : 'none', display:'flex', gap:16, alignItems:'flex-start', background: isActive ? '#FFFBF5' : 'white', transition:'background 0.15s' }}>
                {/* Icon */}
                <div style={{ width:44, height:44, borderRadius:10, background:sev.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:20 }}>
                  {typeIcon[alert.alertType] ?? '⚠️'}
                </div>

                {/* Content */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8, marginBottom:4 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                      <span style={{ fontSize:14, fontWeight:700, color:'#1F2937' }}>{alert.title}</span>
                      <span style={{ background:sev.bg, color:sev.color, borderRadius:4, padding:'2px 8px', fontSize:11, fontWeight:700 }}>{alert.severity}</span>
                      <span style={{ background: isActive?'#FEE2E2':alert.status==='ACKNOWLEDGED'?'#FEF3C7':'#D1FAE5', color: isActive?'#991B1B':alert.status==='ACKNOWLEDGED'?'#92400E':'#065F46', borderRadius:4, padding:'2px 8px', fontSize:11, fontWeight:600 }}>{alert.status}</span>
                    </div>
                    <span style={{ fontSize:12, color:'#9CA3AF', flexShrink:0 }}>{timeAgo(alert.createdAt)}</span>
                  </div>
                  <p style={{ fontSize:13, color:'#6B7280', margin:'0 0 6px', lineHeight:1.5 }}>{alert.message}</p>
                  <div style={{ display:'flex', gap:16, alignItems:'center', fontSize:12, color:'#9CA3AF' }}>
                    <span>📅 {formatDate(alert.createdAt)}</span>
                    <span>🏷️ {alert.alertType.replace(/_/g,' ')}</span>
                    {alert.transactionId && <Link href={`/dashboard/transactions/${alert.transactionId}`} style={{ color:'#4F46E5', textDecoration:'none', fontWeight:500 }}>🔗 {alert.transactionId}</Link>}
                    {alert.acknowledgedBy && <span>👤 {alert.acknowledgedBy}</span>}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ position:'relative', flexShrink:0 }}>
                  <div style={{ display:'flex', gap:8 }}>
                    {alert.transactionId && (
                      <Link href={`/dashboard/transactions/${alert.transactionId}`} style={{ padding:'6px 12px', borderRadius:6, background:'#EEF2FF', color:'#4F46E5', textDecoration:'none', fontSize:12, fontWeight:600 }}>
                        View
                      </Link>
                    )}
                    {isActive && (
                      <button onClick={() => setActionMenu(actionMenu===alert.id?null:alert.id)} style={{ padding:'6px 12px', borderRadius:6, background:'#F3F4F6', color:'#374151', border:'none', cursor:'pointer', fontSize:12, fontWeight:600 }}>
                        Mark ▾
                      </button>
                    )}
                  </div>
                  {actionMenu === alert.id && (
                    <div style={{ position:'absolute', right:0, top:'100%', marginTop:4, background:'white', border:'1px solid #E5E7EB', borderRadius:8, boxShadow:'0 10px 30px rgba(0,0,0,0.1)', zIndex:100, minWidth:160, overflow:'hidden' }}>
                      {[
                        { action:'ACKNOWLEDGED' as const, label:'👁️ Acknowledge', color:'#374151' },
                        { action:'RESOLVED' as const, label:'✅ Resolve', color:'#065F46' },
                        { action:'ESCALATED' as const, label:'⬆️ Escalate', color:'#92400E' },
                      ].map(opt => (
                        <button key={opt.action} onClick={() => handleAction(alert.id, opt.action)} style={{ display:'block', width:'100%', padding:'10px 16px', background:'white', border:'none', cursor:'pointer', fontSize:13, color:opt.color, textAlign:'left', fontWeight:500 }}
                          onMouseEnter={e=>(e.currentTarget.style.background='#F9FAFB')} onMouseLeave={e=>(e.currentTarget.style.background='white')}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', bottom:24, right:24, background:'#1F2937', color:'white', borderRadius:10, padding:'12px 20px', fontSize:14, fontWeight:500, zIndex:9999, animation:'slideUp 0.3s ease', boxShadow:'0 10px 30px rgba(0,0,0,0.2)' }}>
          ✅ {toast}
        </div>
      )}

      <style>{`
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        @keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
      `}</style>
    </div>
  );
}

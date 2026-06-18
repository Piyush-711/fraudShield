'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchReportSummary } from '@/lib/api';
import { ReportSummary } from '@/lib/types';

const REPORTS = [
  { id:1, name:'Daily Summary - Jun 14', date:'2026-06-14', type:'PDF', status:'READY', size:'2.4 MB' },
  { id:2, name:'Weekly Audit - Jun 08–14', date:'2026-06-14', type:'CSV', status:'READY', size:'8.1 MB' },
  { id:3, name:'Monthly Report - June 2026', date:'2026-06-15', type:'PDF', status:'GENERATING', progress:68, size:null },
  { id:4, name:'Fraud Pattern Analysis - Q2', date:'2026-06-10', type:'JSON', status:'READY', size:'1.2 MB' },
];

function StatCard({ label, value, sub, color, icon }: { label:string; value:string|number; sub?:string; color:string; icon:string }) {
  return (
    <div style={{ background:'white', borderRadius:10, border:'1px solid #E5E7EB', padding:'14px 18px', display:'flex', alignItems:'center', gap:14 }}>
      <span style={{ fontSize:26, background:color+'18', borderRadius:8, padding:'6px 10px' }}>{icon}</span>
      <div>
        <p style={{ fontSize:11, color:'#9CA3AF', margin:'0 0 2px', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.04em' }}>{label}</p>
        <p style={{ fontSize:22, fontWeight:700, color:'#1F2937', margin:0 }}>{value}</p>
        {sub && <p style={{ fontSize:11, color:'#9CA3AF', margin:'2px 0 0' }}>{sub}</p>}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState('DAILY_SUMMARY');
  const [fromDate, setFromDate] = useState('2026-06-01');
  const [toDate, setToDate] = useState('2026-06-15');
  const [format, setFormat] = useState<'PDF'|'CSV'|'JSON'>('PDF');
  const [includes, setIncludes] = useState({ fraud:true, perf:true, transactions:false, audit:false });
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [reports, setReports] = useState(REPORTS);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    setSummaryLoading(true);
    fetchReportSummary(period)
      .then(data => setSummary(data))
      .finally(() => setSummaryLoading(false));
  }, [period]);

  const handleGenerate = async () => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 2000));
    const newReport = {
      id: Date.now(), name:`${reportType.replace(/_/g,' ')} - ${toDate}`,
      date: new Date().toISOString().slice(0,10), type: format, status:'READY', size:'3.2 MB',
    };
    setReports(prev => [newReport, ...prev]);
    setGenerating(false);
    setGenerated(true);
    setTimeout(() => setGenerated(false), 4000);
    // Refresh summary
    fetchReportSummary(period).then(data => setSummary(data));
  };

  const selectStyle = { padding:'10px 12px', borderRadius:8, border:'1px solid #D1D5DB', fontSize:14, background:'white', outline:'none', width:'100%', boxSizing:'border-box' as const };
  const checkStyle = { width:16, height:16, accentColor:'#4F46E5', cursor:'pointer' };

  return (
    <div style={{ animation:'fadeIn 0.3s ease' }}>
      <div style={{ marginBottom:24 }}>
        <nav style={{ fontSize:12, color:'#9CA3AF', marginBottom:8 }}>
          <Link href="/dashboard" style={{ color:'#6B7280', textDecoration:'none' }}>Dashboard</Link>
          <span style={{ margin:'0 6px' }}>›</span>
          <span style={{ color:'#1F2937' }}>Reports</span>
        </nav>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:700, color:'#1F2937', margin:'0 0 4px' }}>📈 Reports</h1>
            <p style={{ fontSize:13, color:'#9CA3AF', margin:0 }}>Generate and download fraud detection reports</p>
          </div>
          {/* Period Selector */}
          <div style={{ display:'flex', gap:6 }}>
            {[7,30,90].map(d => (
              <button key={d} onClick={() => setPeriod(d)}
                style={{ padding:'7px 14px', borderRadius:8, border:`1.5px solid ${period===d?'#4F46E5':'#E5E7EB'}`, background: period===d?'#EEF2FF':'white', color: period===d?'#4F46E5':'#6B7280', fontSize:13, fontWeight: period===d?700:400, cursor:'pointer' }}>
                {d}d
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Stats from Backend */}
      <div style={{ marginBottom:20 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          <h3 style={{ fontSize:14, fontWeight:600, color:'#6B7280', margin:0, textTransform:'uppercase', letterSpacing:'0.05em' }}>
            📊 Live Statistics — {summary?.reportPeriod ?? `Last ${period} days`}
          </h3>
          {summaryLoading && <div style={{ width:18, height:18, border:'2px solid #E5E7EB', borderTopColor:'#4F46E5', borderRadius:'50%', animation:'spin 1s linear infinite' }} />}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:10 }}>
          <StatCard label="Total Transactions" value={summary?.totalTransactions ?? '—'} color="#4F46E5" icon="💳" />
          <StatCard label="Approved" value={summary?.approvedTransactions ?? '—'} color="#10B981" icon="✅" />
          <StatCard label="Rejected (Fraud)" value={summary?.rejectedTransactions ?? '—'} color="#EF4444" icon="🚫" sub={summary ? `${summary.fraudRate}% fraud rate` : undefined} />
          <StatCard label="Pending Review" value={summary?.pendingReviews ?? '—'} color="#F59E0B" icon="📋" />
          <StatCard label="High Risk" value={summary?.highRiskTransactions ?? '—'} color="#7C3AED" icon="⚠️" />
          <StatCard label="Avg Latency" value={summary ? `${summary.avgProcessingTimeMs}ms` : '—'} color="#3B82F6" icon="⚡" />
          <StatCard label="Active Alerts" value={summary?.activeAlerts ?? '—'} color="#DC2626" icon="🔔" />
        </div>
        {summary && (
          <p style={{ fontSize:11, color:'#D1D5DB', marginTop:8, textAlign:'right' }}>
            Generated: {new Date(summary.generatedAt).toLocaleString()}
          </p>
        )}
      </div>

      {generated && (
        <div style={{ background:'#D1FAE5', border:'1px solid #6EE7B7', borderRadius:10, padding:'12px 20px', marginBottom:16, fontSize:14, color:'#065F46', fontWeight:600, display:'flex', alignItems:'center', gap:8, animation:'slideUp 0.3s ease' }}>
          ✅ Report generated successfully! Available in the list below.
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        {/* Generator */}
        <div style={{ background:'white', borderRadius:12, border:'1px solid #E5E7EB', padding:24, boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize:16, fontWeight:700, color:'#1F2937', margin:'0 0 20px' }}>⚙️ Generate New Report</h3>

          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 }}>Report Type</label>
              <select value={reportType} onChange={e=>setReportType(e.target.value)} style={selectStyle}>
                <option value="DAILY_SUMMARY">Daily Summary</option>
                <option value="WEEKLY_AUDIT">Weekly Audit</option>
                <option value="MONTHLY_REPORT">Monthly Report</option>
                <option value="CUSTOM">Custom Report</option>
              </select>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <div>
                <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 }}>From</label>
                <input type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)} style={selectStyle} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 }}>To</label>
                <input type="date" value={toDate} onChange={e=>setToDate(e.target.value)} style={selectStyle} />
              </div>
            </div>

            <div>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:8 }}>Include Sections</label>
              {[
                { key:'fraud', label:'🚨 Fraud Summary' },
                { key:'perf', label:'⚡ System Performance' },
                { key:'transactions', label:'💳 Detailed Transactions' },
                { key:'audit', label:'📜 Audit Log' },
              ].map(item => (
                <label key={item.key} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8, cursor:'pointer' }}>
                  <input type="checkbox" checked={(includes as any)[item.key]} onChange={e=>setIncludes(p=>({...p,[item.key]:e.target.checked}))} style={checkStyle} />
                  <span style={{ fontSize:13, color:'#374151' }}>{item.label}</span>
                </label>
              ))}
            </div>

            <div>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:8 }}>Format</label>
              <div style={{ display:'flex', gap:8 }}>
                {(['PDF','CSV','JSON'] as const).map(f => (
                  <button key={f} onClick={() => setFormat(f)} style={{ flex:1, padding:'10px', borderRadius:8, border:`2px solid ${format===f?'#4F46E5':'#E5E7EB'}`, background: format===f?'#EEF2FF':'white', color: format===f?'#4F46E5':'#374151', cursor:'pointer', fontWeight: format===f?700:400, fontSize:13 }}>
                    {f==='PDF'?'📄':f==='CSV'?'📊':'📦'} {f}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display:'flex', gap:10 }}>
              <button onClick={handleGenerate} disabled={generating} style={{ flex:2, padding:'12px', borderRadius:8, border:'none', background: generating?'#D1D5DB':'linear-gradient(135deg,#4F46E5,#7C3AED)', color:'white', fontSize:14, fontWeight:600, cursor: generating?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                {generating ? <><span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', display:'inline-block', animation:'spin 1s linear infinite' }} />Generating...</> : '📊 Generate Report'}
              </button>
              <button style={{ flex:1, padding:'12px', borderRadius:8, border:'1px solid #4F46E5', background:'#EEF2FF', color:'#4F46E5', fontSize:13, fontWeight:600, cursor:'pointer' }}
                onClick={() => alert('Scheduling coming soon!')}>
                📅 Schedule
              </button>
            </div>
          </div>
        </div>

        {/* Recent Reports */}
        <div>
          <div style={{ background:'white', borderRadius:12, border:'1px solid #E5E7EB', overflow:'hidden', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid #F3F4F6' }}>
              <h3 style={{ fontSize:16, fontWeight:700, color:'#1F2937', margin:0 }}>📂 Recent Reports</h3>
            </div>
            {reports.map((r, i) => (
              <div key={r.id} style={{ padding:'14px 20px', borderBottom: i<reports.length-1?'1px solid #F9FAFB':'none', display:'flex', alignItems:'center', gap:14 }}>
                <div style={{ width:40, height:40, borderRadius:10, background: r.type==='PDF'?'#FEE2E2':r.type==='CSV'?'#D1FAE5':'#DBEAFE', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
                  {r.type==='PDF'?'📄':r.type==='CSV'?'📊':'📦'}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:13, fontWeight:600, color:'#1F2937', margin:'0 0 2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.name}</p>
                  <p style={{ fontSize:11, color:'#9CA3AF', margin:0 }}>{r.date} · {r.type}{r.size ? ` · ${r.size}` : ''}</p>
                  {r.status === 'GENERATING' && (
                    <div style={{ marginTop:6, height:4, background:'#F3F4F6', borderRadius:2 }}>
                      <div style={{ height:'100%', width:`${(r as any).progress}%`, background:'linear-gradient(90deg,#4F46E5,#7C3AED)', borderRadius:2, transition:'width 0.5s' }} />
                    </div>
                  )}
                </div>
                <div>
                  {r.status === 'READY' ? (
                    <button onClick={() => alert(`Downloading ${r.name}...`)} style={{ padding:'6px 14px', borderRadius:6, background:'#4F46E5', color:'white', border:'none', cursor:'pointer', fontSize:12, fontWeight:600 }}>
                      ↓ Download
                    </button>
                  ) : (
                    <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#9CA3AF' }}>
                      <span style={{ width:12, height:12, border:'2px solid #D1D5DB', borderTopColor:'#4F46E5', borderRadius:'50%', display:'inline-block', animation:'spin 1s linear infinite' }} />
                      {(r as any).progress}%
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Report Types Info */}
          <div style={{ background:'#F9FAFB', borderRadius:12, border:'1px solid #E5E7EB', padding:16, marginTop:16 }}>
            <p style={{ fontSize:12, fontWeight:600, color:'#6B7280', textTransform:'uppercase', letterSpacing:'0.05em', margin:'0 0 10px' }}>Available Report Types</p>
            {[
              { name:'Daily Summary', desc:'Transactions, fraud detected, performance' },
              { name:'Weekly Audit', desc:'All decisions, manual reviews, overrides' },
              { name:'Monthly Report', desc:'Trends, statistics, compliance summary' },
              { name:'Custom Report', desc:'User-defined date range and sections' },
            ].map(t => (
              <div key={t.name} style={{ marginBottom:8 }}>
                <p style={{ fontSize:13, fontWeight:600, color:'#374151', margin:'0 0 1px' }}>{t.name}</p>
                <p style={{ fontSize:12, color:'#9CA3AF', margin:0 }}>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        @keyframes slideUp{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}
      `}</style>
    </div>
  );
}

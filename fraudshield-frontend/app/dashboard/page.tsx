'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { fetchMetrics, fetchChartData, fetchTransactions } from '@/lib/api';
import { DashboardMetrics, ChartDataPoint, Transaction } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/mockData';

function MetricCard({ title, value, subtitle, trend, icon, color }: {
  title: string; value: string; subtitle?: string;
  trend?: number; icon: string; color: string;
}) {
  const trendUp = trend !== undefined && trend > 0;
  const trendNeutral = trend === undefined;
  return (
    <div style={{ background:'white', borderRadius:12, border:'1px solid #E5E7EB', padding:20, boxShadow:'0 1px 3px rgba(0,0,0,0.05)', transition:'box-shadow 0.2s', cursor:'default' }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow='0 1px 3px rgba(0,0,0,0.05)')}
    >
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
        <p style={{ fontSize:12, fontWeight:600, color:'#6B7280', textTransform:'uppercase', letterSpacing:'0.05em', margin:0 }}>{title}</p>
        <span style={{ fontSize:24, background:color+'20', borderRadius:8, padding:'4px 8px' }}>{icon}</span>
      </div>
      <p style={{ fontSize:32, fontWeight:700, color:'#1F2937', margin:'0 0 6px' }}>{value}</p>
      {subtitle && <p style={{ fontSize:12, color:'#9CA3AF', margin:0 }}>{subtitle}</p>}
      {!trendNeutral && (
        <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:8 }}>
          <span style={{ fontSize:12, fontWeight:600, color: trendUp ? '#10B981' : '#EF4444' }}>
            {trendUp ? '↑' : '↓'} {Math.abs(trend!).toFixed(1)}%
          </span>
          <span style={{ fontSize:12, color:'#9CA3AF' }}>vs yesterday</span>
        </div>
      )}
    </div>
  );
}

function SimpleLineChart({ data, field, color, label }: {
  data: ChartDataPoint[]; field: 'transactions' | 'fraudRate'; color: string; label: string;
}) {
  const values = data.map(d => d[field] as number);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const w = 100, h = 60;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');
  const areaBottom = `${w},${h} 0,${h}`;

  return (
    <div style={{ background:'white', borderRadius:12, border:'1px solid #E5E7EB', padding:20, boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div>
          <h4 style={{ fontSize:14, fontWeight:600, color:'#1F2937', margin:'0 0 2px' }}>{label}</h4>
          <p style={{ fontSize:12, color:'#9CA3AF', margin:0 }}>Last 24 hours</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ width:12, height:3, borderRadius:2, background:color, display:'inline-block' }} />
          <span style={{ fontSize:12, color:'#6B7280' }}>{field === 'transactions' ? 'Volume' : 'Fraud Rate %'}</span>
        </div>
      </div>
      <div style={{ position:'relative', height:80, padding:'8px 0' }}>
        <svg viewBox={`0 0 ${w} ${h}`} style={{ width:'100%', height:'100%', overflow:'visible' }} preserveAspectRatio="none">
          <defs>
            <linearGradient id={`grad-${field}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.2" />
              <stop offset="100%" stopColor={color} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <polyline fill="none" stroke={color} strokeWidth="2" points={pts} />
          <polygon fill={`url(#grad-${field})`} points={`${pts} ${areaBottom}`} />
        </svg>
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', marginTop:8 }}>
        {['00:00','06:00','12:00','18:00','24:00'].map(t => (
          <span key={t} style={{ fontSize:10, color:'#D1D5DB' }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

function RiskBadge({ score }: { score: number }) {
  const level = score >= 70 ? 'HIGH' : score >= 40 ? 'MEDIUM' : 'LOW';
  const styles = {
    HIGH: { bg:'#FEE2E2', color:'#991B1B' },
    MEDIUM: { bg:'#FEF3C7', color:'#92400E' },
    LOW: { bg:'#D1FAE5', color:'#065F46' },
  }[level];
  return (
    <span style={{ background:styles.bg, color:styles.color, borderRadius:4, padding:'2px 8px', fontSize:12, fontWeight:600 }}>
      {score}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg:string; color:string }> = {
    APPROVED:      { bg:'#D1FAE5', color:'#065F46' },
    REJECTED:      { bg:'#FEE2E2', color:'#991B1B' },
    MANUAL_REVIEW: { bg:'#DBEAFE', color:'#1E40AF' },
    PENDING:       { bg:'#FEF3C7', color:'#92400E' },
  };
  const s = map[status] ?? { bg:'#F3F4F6', color:'#6B7280' };
  return (
    <span style={{ background:s.bg, color:s.color, borderRadius:4, padding:'2px 8px', fontSize:12, fontWeight:600 }}>
      {status.replace('_',' ')}
    </span>
  );
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [recentTxns, setRecentTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const load = useCallback(async () => {
    try {
      const [m, c, t] = await Promise.all([
        fetchMetrics(),
        fetchChartData(),
        fetchTransactions({ size: 5, sortBy: 'fraudScore', sortDir: 'desc' }),
      ]);
      setMetrics(m);
      setChartData(c);
      setRecentTxns(t.content.filter(tx => tx.fraudScore >= 70).slice(0, 5));
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:400 }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:40, height:40, border:'3px solid #E5E7EB', borderTopColor:'#4F46E5', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto 12px' }} />
        <p style={{ color:'#6B7280', fontSize:14 }}>Loading dashboard...</p>
      </div>
    </div>
  );

  return (
    <div style={{ animation:'fadeIn 0.3s ease' }}>
      {/* Page header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:700, color:'#1F2937', margin:'0 0 4px' }}>Dashboard Overview</h1>
          <p style={{ fontSize:13, color:'#9CA3AF', margin:0 }}>
            Last updated: {lastUpdated.toLocaleTimeString()} · Auto-refreshes every 10s
          </p>
        </div>
        <button onClick={load} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 16px', borderRadius:8, border:'1px solid #E5E7EB', background:'white', cursor:'pointer', fontSize:13, fontWeight:500, color:'#374151' }}>
          🔄 Refresh
        </button>
      </div>

      {/* Metric Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:16, marginBottom:24 }}>
        <MetricCard title="Total Transactions" value={metrics!.totalTransactions.toLocaleString()} icon="💳" color="#4F46E5" trend={metrics!.totalTransactionsChange} subtitle="Today" />
        <MetricCard title="Fraud Rate" value={`${metrics!.fraudRate}%`} icon="⚠️" color="#EF4444" trend={metrics!.fraudRateChange} subtitle="Detection accuracy >95%" />
        <MetricCard title="P95 Latency" value={`${metrics!.p95LatencyMs}ms`} icon="⚡" color="#10B981" subtitle={metrics!.latencyStatus === 'GOOD' ? '✓ Within 200ms SLA' : '⚠ Above threshold'} />
        <MetricCard title="False Positive Rate" value={`${metrics!.falsePositiveRate}%`} icon="🎯" color="#F59E0B" trend={metrics!.falsePositiveChange} subtitle="Target: <1%" />
      </div>

      {/* Sub-metrics row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:24 }}>
        <div style={{ background:'linear-gradient(135deg,#4F46E5,#7C3AED)', borderRadius:12, padding:20, color:'white' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <p style={{ fontSize:12, opacity:0.8, margin:'0 0 4px' }}>PENDING REVIEWS</p>
              <p style={{ fontSize:36, fontWeight:700, margin:0 }}>{metrics!.pendingReviews}</p>
              <p style={{ fontSize:12, opacity:0.7, margin:'4px 0 0' }}>Require analyst attention</p>
            </div>
            <span style={{ fontSize:48, opacity:0.6 }}>📋</span>
          </div>
          <Link href="/dashboard/transactions?status=MANUAL_REVIEW" style={{ display:'inline-block', marginTop:16, background:'rgba(255,255,255,0.2)', borderRadius:6, padding:'6px 14px', fontSize:12, fontWeight:600, color:'white', textDecoration:'none' }}>
            Review Now →
          </Link>
        </div>
        <div style={{ background:'linear-gradient(135deg,#DC2626,#B91C1C)', borderRadius:12, padding:20, color:'white' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <p style={{ fontSize:12, opacity:0.8, margin:'0 0 4px' }}>ACTIVE ALERTS</p>
              <p style={{ fontSize:36, fontWeight:700, margin:0 }}>{metrics!.activeAlerts}</p>
              <p style={{ fontSize:12, opacity:0.7, margin:'4px 0 0' }}>Require immediate action</p>
            </div>
            <span style={{ fontSize:48, opacity:0.6 }}>🚨</span>
          </div>
          <Link href="/dashboard/alerts" style={{ display:'inline-block', marginTop:16, background:'rgba(255,255,255,0.2)', borderRadius:6, padding:'6px 14px', fontSize:12, fontWeight:600, color:'white', textDecoration:'none' }}>
            View Alerts →
          </Link>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:24 }}>
        <SimpleLineChart data={chartData} field="transactions" color="#4F46E5" label="Transaction Volume" />
        <SimpleLineChart data={chartData} field="fraudRate" color="#EF4444" label="Fraud Detection Rate" />
      </div>

      {/* Recent High-Risk Transactions */}
      <div style={{ background:'white', borderRadius:12, border:'1px solid #E5E7EB', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 20px', borderBottom:'1px solid #F3F4F6' }}>
          <div>
            <h3 style={{ fontSize:16, fontWeight:600, color:'#1F2937', margin:'0 0 2px' }}>🚨 Recent High-Risk Transactions</h3>
            <p style={{ fontSize:12, color:'#9CA3AF', margin:0 }}>Fraud score ≥ 70 — requires review</p>
          </div>
          <Link href="/dashboard/transactions?riskLevel=HIGH" style={{ fontSize:13, fontWeight:500, color:'#4F46E5', textDecoration:'none', background:'#EEF2FF', padding:'6px 14px', borderRadius:8 }}>
            View All →
          </Link>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table className="data-table" style={{ width:'100%' }}>
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Amount</th>
                <th>Merchant</th>
                <th>Risk Score</th>
                <th>Status</th>
                <th>Time</th>
                <th style={{ textAlign:'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentTxns.map(tx => (
                <tr key={tx.id} onClick={() => window.location.href=`/dashboard/transactions/${tx.transactionId}`} style={{ cursor:'pointer' }}>
                  <td style={{ fontFamily:'monospace', fontSize:13, color:'#4F46E5', fontWeight:600 }}>{tx.transactionId}</td>
                  <td className="number" style={{ fontWeight:600 }}>{formatCurrency(tx.amount)}</td>
                  <td style={{ color:'#374151' }}>{tx.merchantName}</td>
                  <td><RiskBadge score={tx.fraudScore} /></td>
                  <td><StatusBadge status={tx.transactionStatus} /></td>
                  <td style={{ color:'#9CA3AF', fontSize:12 }}>{formatDate(tx.createdAt)}</td>
                  <td className="action">
                    <Link href={`/dashboard/transactions/${tx.transactionId}`}
                      onClick={e => e.stopPropagation()}
                      style={{ background:'#4F46E5', color:'white', borderRadius:6, padding:'5px 12px', fontSize:12, fontWeight:600, textDecoration:'none', display:'inline-block' }}>
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentTxns.length === 0 && (
            <div style={{ padding:40, textAlign:'center', color:'#9CA3AF' }}>
              <span style={{ fontSize:32 }}>✅</span>
              <p style={{ margin:'8px 0 0', fontSize:14 }}>No high-risk transactions — great work!</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
      `}</style>
    </div>
  );
}

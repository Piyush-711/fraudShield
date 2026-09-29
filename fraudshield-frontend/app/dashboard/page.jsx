'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { CreditCard, AlertTriangle, Zap, Target, ArrowUpRight, ArrowDownRight, RefreshCw, Clock, ShieldAlert, ChevronRight, CheckCircle2, FileCheck2, Eye, } from 'lucide-react';
import { fetchMetrics, fetchChartData, fetchTransactions } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/mockData';
function MetricCard({ title, value, subtitle, trend, icon: Icon, iconBg, iconColor, }) {
    const trendUp = trend !== undefined && trend > 0;
    const trendDown = trend !== undefined && trend < 0;
    return (<div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300/80 transition-all duration-200 flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {title}
          </span>
          <div className={`w-9 h-9 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center transition-transform group-hover:scale-105`}>
            <Icon className="w-4 h-4 stroke-[2]"/>
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        {trend !== undefined && trend !== 0 ? (<div className="flex items-center gap-1 font-semibold">
            {trendUp ? (<span className="inline-flex items-center text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]">
                <ArrowUpRight className="w-3 h-3 stroke-[2.5]"/>
                {Math.abs(trend).toFixed(1)}%
              </span>) : (<span className="inline-flex items-center text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded text-[11px]">
                <ArrowDownRight className="w-3 h-3 stroke-[2.5]"/>
                {Math.abs(trend).toFixed(1)}%
              </span>)}
            <span className="text-slate-400 font-normal">vs prev 24h</span>
          </div>) : (<span className="text-slate-400 text-[11px] font-normal">Real-time telemetry</span>)}

        {subtitle && (<span className="text-slate-500 text-[11px] font-medium truncate max-w-[120px]">
            {subtitle}
          </span>)}
      </div>
    </div>);
}
function SimpleLineChart({ data, field, color, label, sublabel, valueSuffix = '', }) {
    const [hoveredIdx, setHoveredIdx] = useState(null);
    const values = data.map((d) => d[field]);
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const range = max - min || 1;
    const w = 500;
    const h = 160;
    const points = values
        .map((v, i) => {
        const x = (i / (values.length - 1 || 1)) * w;
        const y = h - ((v - min) / range) * (h - 20) - 10;
        return `${x},${y}`;
    })
        .join(' ');
    const areaBottom = `${w},${h} 0,${h}`;
    return (<div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">{label}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{sublabel}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60 font-medium">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}/>
          <span>{field === 'transactions' ? 'Hourly Volume' : 'Detection %'}</span>
        </div>
      </div>

      {/* SVG Chart Graphic */}
      <div className="relative h-44 w-full pt-2">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full overflow-visible" preserveAspectRatio="none" onMouseLeave={() => setHoveredIdx(null)}>
          <defs>
            <linearGradient id={`grad-${field}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.18"/>
              <stop offset="100%" stopColor={color} stopOpacity="0.0"/>
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="0" y1={h * 0.25} x2={w} y2={h * 0.25} stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3"/>
          <line x1="0" y1={h * 0.5} x2={w} y2={h * 0.5} stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3"/>
          <line x1="0" y1={h * 0.75} x2={w} y2={h * 0.75} stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3"/>

          {/* Area fill */}
          <polygon fill={`url(#grad-${field})`} points={`${points} ${areaBottom}`}/>

          {/* Polyline */}
          <polyline fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={points}/>

          {/* Points */}
          {values.map((v, i) => {
            const x = (i / (values.length - 1 || 1)) * w;
            const y = h - ((v - min) / range) * (h - 20) - 10;
            const isHovered = hoveredIdx === i;
            return (<g key={i} onMouseEnter={() => setHoveredIdx(i)} className="cursor-pointer">
                <circle cx={x} cy={y} r={isHovered ? 5 : 2.5} fill="white" stroke={color} strokeWidth={isHovered ? 2.5 : 1.5}/>
              </g>);
        })}
        </svg>

        {/* Floating tooltip */}
        {hoveredIdx !== null && data[hoveredIdx] && (<div className="absolute top-1 bg-slate-900 text-white text-[11px] rounded-lg px-2.5 py-1.5 shadow-lg pointer-events-none -translate-x-1/2 flex flex-col items-center gap-0.5 z-10 font-sans" style={{
                left: `${(hoveredIdx / (data.length - 1 || 1)) * 100}%`,
            }}>
            <span className="font-semibold text-slate-200">
              {data[hoveredIdx].label}
            </span>
            <span className="font-bold" style={{ color }}>
              {data[hoveredIdx][field]}
              {valueSuffix}
            </span>
          </div>)}
      </div>

      {/* Time Axis Labels */}
      <div className="flex justify-between items-center text-[10px] font-medium text-slate-400 mt-2 px-1 border-t border-slate-100 pt-2">
        <span>24h ago</span>
        <span>18h ago</span>
        <span>12h ago</span>
        <span>6h ago</span>
        <span className="font-semibold text-slate-600">Now</span>
      </div>
    </div>);
}
function RiskScorePill({ score }) {
    let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    let barColor = 'bg-emerald-500';
    if (score >= 70) {
        badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
        barColor = 'bg-rose-500';
    }
    else if (score >= 40) {
        badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
        barColor = 'bg-amber-500';
    }
    return (<div className="inline-flex items-center gap-2">
      <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(score, 100)}%` }}/>
      </div>
      <span className={`px-2 py-0.5 text-xs font-bold rounded-md border ${badgeColor}`}>
        {score}
      </span>
    </div>);
}
function StatusChip({ status }) {
    const configs = {
        APPROVED: {
            bg: 'bg-emerald-50 border-emerald-200/80',
            text: 'text-emerald-700',
            dot: 'bg-emerald-500',
            label: 'Approved',
        },
        REJECTED: {
            bg: 'bg-rose-50 border-rose-200/80',
            text: 'text-rose-700',
            dot: 'bg-rose-500',
            label: 'Rejected',
        },
        MANUAL_REVIEW: {
            bg: 'bg-amber-50 border-amber-200/80',
            text: 'text-amber-700',
            dot: 'bg-amber-500',
            label: 'In Review',
        },
    };
    const c = configs[status] || {
        bg: 'bg-slate-50 border-slate-200',
        text: 'text-slate-600',
        dot: 'bg-slate-400',
        label: status.replace(/_/g, ' '),
    };
    return (<span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`}/>
      {c.label}
    </span>);
}
export default function DashboardPage() {
    const [metrics, setMetrics] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [recentTxns, setRecentTxns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const load = useCallback(async () => {
        try {
            setRefreshing(true);
            const [m, c, t] = await Promise.all([
                fetchMetrics(),
                fetchChartData(),
                fetchTransactions({ size: 6, sortBy: 'fraudScore', sortDir: 'desc' }),
            ]);
            setMetrics(m);
            setChartData(c);
            setRecentTxns(t.content.filter((tx) => tx.fraudScore >= 70).slice(0, 6));
            setLastUpdated(new Date());
        }
        finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);
    useEffect(() => {
        load();
        const interval = setInterval(load, 10000);
        return () => clearInterval(interval);
    }, [load]);
    if (loading) {
        return (<div className="space-y-6 animate-pulse py-6">
        <div className="h-8 bg-slate-200 rounded-lg w-64 mb-6"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (<div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200 rounded-2xl"></div>
          <div className="h-64 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>);
    }
    return (<div className="space-y-8 animate-fadeIn">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Security Intelligence Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400"/>
            <span>Last synced at </span>
            <span suppressHydrationWarning>{lastUpdated.toLocaleTimeString()}</span>
            <span> · Auto-refreshes every 10 seconds</span>
          </p>
        </div>

        <button onClick={load} disabled={refreshing} className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs hover:shadow-xs transition-all disabled:opacity-60 cursor-pointer self-start sm:self-auto">
          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${refreshing && 'animate-spin'}`}/>
          <span>Refresh Data</span>
        </button>
      </div>

      {/* ── KPI Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard title="Total Transactions" value={metrics?.totalTransactions ? metrics.totalTransactions.toLocaleString() : '0'} trend={metrics?.totalTransactionsChange} subtitle="Processed in 24h" icon={CreditCard} iconBg="bg-indigo-50" iconColor="text-indigo-600"/>

        <MetricCard title="Fraud Risk Rate" value={`${metrics?.fraudRate ?? 0}%`} trend={metrics?.fraudRateChange} subtitle="Target < 2.0%" icon={AlertTriangle} iconBg="bg-rose-50" iconColor="text-rose-600"/>

        <MetricCard title="P95 Latency" value={`${metrics?.p95LatencyMs ?? 0}ms`} subtitle={metrics?.latencyStatus === 'GOOD' ? 'SLA Passed (<200ms)' : 'Latency Elevated'} icon={Zap} iconBg="bg-emerald-50" iconColor="text-emerald-600"/>

        <MetricCard title="False Positive Rate" value={`${metrics?.falsePositiveRate ?? 0}%`} trend={metrics?.falsePositiveChange} subtitle="Benchmark < 1.0%" icon={Target} iconBg="bg-amber-50" iconColor="text-amber-600"/>
      </div>

      {/* ── Operational Queue Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Pending Reviews Queue */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-sm flex flex-col justify-between group">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-200/80">
                Manual Review Queue
              </span>
              <p className="text-4xl font-extrabold tracking-tight">
                {metrics?.pendingReviews ?? 0}
              </p>
              <p className="text-xs text-indigo-200/70 pt-1 font-medium">
                High-confidence transactions pending analyst decision
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-200">
              <FileCheck2 className="w-6 h-6 stroke-[1.8]"/>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-indigo-700/50 flex items-center justify-between">
            <span className="text-xs text-indigo-200/70">Estimated SLA: &lt;15 mins</span>
            <Link href="/dashboard/transactions?status=MANUAL_REVIEW" className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white text-indigo-950 px-3.5 py-1.5 rounded-lg shadow-sm hover:bg-indigo-50 transition-colors">
              Open Queue
              <ArrowUpRight className="w-3.5 h-3.5"/>
            </Link>
          </div>
        </div>

        {/* Active Threat Alerts */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-rose-950 rounded-2xl p-6 text-white shadow-sm flex flex-col justify-between group">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-200/80">
                Active System Alerts
              </span>
              <p className="text-4xl font-extrabold tracking-tight text-white">
                {metrics?.activeAlerts ?? 0}
              </p>
              <p className="text-xs text-rose-200/70 pt-1 font-medium">
                Abnormal traffic anomalies or threshold deviations detected
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-200">
              <ShieldAlert className="w-6 h-6 stroke-[1.8]"/>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-700/50 flex items-center justify-between">
            <span className="text-xs text-rose-200/70">Requires operator review</span>
            <Link href="/dashboard/alerts" className="inline-flex items-center gap-1.5 text-xs font-semibold bg-rose-600 text-white px-3.5 py-1.5 rounded-lg shadow-sm hover:bg-rose-500 transition-colors">
              Inspect Alerts
              <ArrowUpRight className="w-3.5 h-3.5"/>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Interactive Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleLineChart data={chartData} field="transactions" color="#4F46E5" label="Transaction Ingestion Volume" sublabel="Real-time transactions per hour"/>
        <SimpleLineChart data={chartData} field="fraudRate" color="#EF4444" label="Fraud Threat Rate %" sublabel="Flagged transactions against total volume" valueSuffix="%"/>
      </div>

      {/* ── Recent High-Risk Transactions Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500"/>
              Recent High-Risk Transactions
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Transactions flagged with risk score ≥ 70 requiring attention
            </p>
          </div>

          <Link href="/dashboard/transactions" className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
            <span>Explore All</span>
            <ChevronRight className="w-4 h-4"/>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-6">Transaction ID</th>
                <th className="py-3 px-6">User / Account</th>
                <th className="py-3 px-6">Amount</th>
                <th className="py-3 px-6">Merchant</th>
                <th className="py-3 px-6">Risk Score</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Timestamp</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {recentTxns.map((tx) => (<tr key={tx.id} className="hover:bg-slate-50/80 transition-colors group cursor-pointer" onClick={() => (window.location.href = `/dashboard/transactions/${tx.transactionId}`)}>
                  <td className="py-3.5 px-6 font-mono font-bold text-indigo-600">
                    {tx.transactionId}
                  </td>
                  <td className="py-3.5 px-6">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-800">{tx.userId}</span>
                      <span className="text-[11px] text-slate-400">{tx.userEmail}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-6 font-bold text-slate-900">
                    {formatCurrency(tx.amount)}
                  </td>
                  <td className="py-3.5 px-6">
                    <div className="flex flex-col">
                      <span className="text-slate-800 font-medium">{tx.merchantName}</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                        {tx.merchantCategory}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-6">
                    <RiskScorePill score={tx.fraudScore}/>
                  </td>
                  <td className="py-3.5 px-6">
                    <StatusChip status={tx.transactionStatus}/>
                  </td>
                  <td className="py-3.5 px-6 text-slate-500 text-[11px]">
                    {formatDate(tx.createdAt)}
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <Link href={`/dashboard/transactions/${tx.transactionId}`} onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-indigo-600 hover:text-white rounded-lg transition-all">
                      <Eye className="w-3.5 h-3.5"/>
                      <span>Details</span>
                    </Link>
                  </td>
                </tr>))}
            </tbody>
          </table>

          {recentTxns.length === 0 && (<div className="py-12 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto"/>
              <p className="text-sm font-medium text-slate-600">No high-risk transactions detected</p>
              <p className="text-xs text-slate-400">All recent transactions fall within safe risk parameters</p>
            </div>)}
        </div>
      </div>
    </div>);
}

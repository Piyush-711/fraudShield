'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchAlerts, acknowledgeAlert } from '@/lib/api';
import { timeAgo, formatDate } from '@/lib/mockData';
import { AlertOctagon, AlertTriangle, Info, CheckCircle2, RefreshCw, Clock, ArrowUpRight, Search, User as UserIcon, ExternalLink, ChevronRight, ChevronDown, ShieldAlert, Zap, ServerCrash, Wrench, Lock, Calendar, Tag } from 'lucide-react';
const severityConfig = {
    CRITICAL: {
        color: 'text-red-700',
        bg: 'bg-red-50 border-red-200',
        badgeBg: 'bg-red-100 text-red-800 border-red-200',
        badgeText: 'text-red-700',
        borderLeft: 'border-l-rose-600',
        Icon: AlertOctagon,
    },
    HIGH: {
        color: 'text-amber-700',
        bg: 'bg-amber-50 border-amber-200',
        badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
        badgeText: 'text-amber-700',
        borderLeft: 'border-l-amber-500',
        Icon: AlertTriangle,
    },
    MEDIUM: {
        color: 'text-blue-700',
        bg: 'bg-blue-50 border-blue-200',
        badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
        badgeText: 'text-blue-700',
        borderLeft: 'border-l-blue-500',
        Icon: Info,
    },
    LOW: {
        color: 'text-emerald-700',
        bg: 'bg-emerald-50 border-emerald-200',
        badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        badgeText: 'text-emerald-700',
        borderLeft: 'border-l-emerald-500',
        Icon: CheckCircle2,
    },
};
function getAlertTypeIcon(type) {
    switch (type) {
        case 'FRAUD_DETECTED': return ShieldAlert;
        case 'PERF_DEGRADED': return Zap;
        case 'SERVICE_DOWN': return ServerCrash;
        case 'INFRA_ALERT': return Wrench;
        case 'SECURITY_ALERT': return Lock;
        case 'THRESHOLD_EXCEEDED': return AlertTriangle;
        default: return AlertTriangle;
    }
}
export default function AlertsPage() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [severityFilter, setSeverityFilter] = useState('ALL');
    const [search, setSearch] = useState('');
    const [actionMenu, setActionMenu] = useState(null);
    const [toast, setToast] = useState(null);
    const load = async (isManual = false) => {
        if (isManual)
            setRefreshing(true);
        else
            setLoading(true);
        try {
            const data = await fetchAlerts();
            setAlerts(data);
        }
        catch (e) {
            console.error("Failed to load alerts:", e);
        }
        finally {
            setLoading(false);
            setRefreshing(false);
        }
    };
    useEffect(() => {
        load();
    }, []);
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };
    const handleAction = async (id, action) => {
        await acknowledgeAlert(id, action);
        setActionMenu(null);
        showToast(`Alert marked as ${action.toLowerCase()}`);
        load();
    };
    const filtered = alerts.filter(a => {
        if (statusFilter !== 'ALL' && a.status !== statusFilter)
            return false;
        if (severityFilter !== 'ALL' && a.severity !== severityFilter)
            return false;
        if (search &&
            !a.title.toLowerCase().includes(search.toLowerCase()) &&
            !a.message.toLowerCase().includes(search.toLowerCase()) &&
            !(a.transactionId && a.transactionId.toLowerCase().includes(search.toLowerCase())))
            return false;
        return true;
    });
    const counts = {
        ACTIVE: alerts.filter(a => a.status === 'ACTIVE').length,
        ACKNOWLEDGED: alerts.filter(a => a.status === 'ACKNOWLEDGED').length,
        RESOLVED: alerts.filter(a => a.status === 'RESOLVED').length,
    };
    return (<div className="space-y-6 animate-fadeIn pb-12">
      {/* Header & Breadcrumb */}
      <div>
        <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-2">
          <Link href="/dashboard" className="text-slate-500 hover:text-indigo-600 transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400"/>
          <span className="text-slate-800 font-semibold">Incident Alerts</span>
        </nav>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>Security & Operational Alerts</span>
              {counts.ACTIVE > 0 && (<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                  {counts.ACTIVE} Active
                </span>)}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Real-time threat feeds, system anomalies, and rule trigger alerts
            </p>
          </div>
          <button onClick={() => load(true)} disabled={refreshing} className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all">
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-indigo-600' : 'text-slate-500'}`}/>
            <span>Refresh Feed</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
            {
                label: 'Active Incidents',
                count: counts.ACTIVE,
                filter: 'ACTIVE',
                icon: AlertOctagon,
                iconColor: 'text-rose-600',
                iconBg: 'bg-rose-50',
                activeRing: 'border-rose-500 ring-2 ring-rose-500/20',
            },
            {
                label: 'Acknowledged',
                count: counts.ACKNOWLEDGED,
                filter: 'ACKNOWLEDGED',
                icon: Clock,
                iconColor: 'text-amber-600',
                iconBg: 'bg-amber-50',
                activeRing: 'border-amber-500 ring-2 ring-amber-500/20',
            },
            {
                label: 'Resolved',
                count: counts.RESOLVED,
                filter: 'RESOLVED',
                icon: CheckCircle2,
                iconColor: 'text-emerald-600',
                iconBg: 'bg-emerald-50',
                activeRing: 'border-emerald-500 ring-2 ring-emerald-500/20',
            },
        ].map(item => {
            const ItemIcon = item.icon;
            const isSelected = statusFilter === item.filter;
            return (<button key={item.label} onClick={() => setStatusFilter(statusFilter === item.filter ? 'ALL' : item.filter)} className={`text-left bg-white p-4 rounded-xl border transition-all shadow-sm ${isSelected
                    ? `${item.activeRing} bg-slate-50/50`
                    : 'border-slate-200 hover:border-slate-300'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{item.label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{item.count}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.iconBg}`}>
                  <ItemIcon className={`w-5 h-5 ${item.iconColor}`}/>
                </div>
              </div>
            </button>);
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="appearance-none bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium px-3 py-2 pr-8 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer transition-colors">
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
              <option value="RESOLVED">Resolved</option>
              <option value="ESCALATED">Escalated</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"/>
          </div>

          <div className="relative">
            <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} className="appearance-none bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium px-3 py-2 pr-8 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer transition-colors">
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"/>
          </div>

          {(statusFilter !== 'ALL' || severityFilter !== 'ALL' || search) && (<button onClick={() => {
                setStatusFilter('ALL');
                setSeverityFilter('ALL');
                setSearch('');
            }} className="text-xs font-medium text-indigo-600 hover:text-indigo-800 px-2 py-1">
              Reset filters
            </button>)}
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"/>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search alerts, messages, transactions..." className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"/>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (<div className="p-16 flex flex-col items-center justify-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-3"/>
            <p className="text-xs font-medium">Fetching real-time incident feed...</p>
          </div>) : filtered.length === 0 ? (<div className="p-16 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <CheckCircle2 className="w-6 h-6 text-emerald-500"/>
            </div>
            <p className="text-sm font-semibold text-slate-800">No alerts found</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              There are no incident alerts matching your current filter criteria.
            </p>
          </div>) : (<div className="divide-y divide-slate-100">
            {filtered.map(alert => {
                const sev = severityConfig[alert.severity];
                const SeverityIcon = sev.Icon;
                const TypeIcon = getAlertTypeIcon(alert.alertType);
                const isActive = alert.status === 'ACTIVE';
                return (<div key={alert.id} className={`p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start transition-colors border-l-4 ${sev.borderLeft} ${isActive ? 'bg-amber-50/20 hover:bg-amber-50/30' : 'bg-white hover:bg-slate-50/60'}`}>
                  {/* Leading Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-rose-50 border border-rose-100' : 'bg-slate-100 border border-slate-200'}`}>
                    <TypeIcon className={`w-5 h-5 ${isActive ? 'text-rose-600' : 'text-slate-600'}`}/>
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-slate-900">{alert.title}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${sev.badgeBg}`}>
                          <SeverityIcon className="w-3 h-3"/>
                          <span>{alert.severity}</span>
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${alert.status === 'ACTIVE'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : alert.status === 'ACKNOWLEDGED'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                          {alert.status}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="w-3.5 h-3.5"/>
                        <span>{timeAgo(alert.createdAt)}</span>
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed mb-3">{alert.message}</p>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-slate-400"/>
                        <span>{formatDate(alert.createdAt)}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-slate-500 font-mono text-[11px]">
                        <Tag className="w-3 h-3 text-slate-400"/>
                        <span>{alert.alertType.replace(/_/g, ' ')}</span>
                      </span>
                      {alert.transactionId && (<Link href={`/dashboard/transactions/${alert.transactionId}`} className="inline-flex items-center gap-1 font-mono text-indigo-600 hover:text-indigo-800 font-medium">
                          <ExternalLink className="w-3.5 h-3.5"/>
                          <span>{alert.transactionId}</span>
                        </Link>)}
                      {alert.acknowledgedBy && (<span className="inline-flex items-center gap-1 text-slate-500">
                          <UserIcon className="w-3.5 h-3.5 text-slate-400"/>
                          <span>{alert.acknowledgedBy}</span>
                        </span>)}
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex sm:flex-col items-center gap-2 self-end sm:self-center relative flex-shrink-0">
                    {alert.transactionId && (<Link href={`/dashboard/transactions/${alert.transactionId}`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors">
                        <span>Investigate</span>
                        <ArrowUpRight className="w-3.5 h-3.5"/>
                      </Link>)}

                    {isActive && (<div className="relative">
                        <button onClick={() => setActionMenu(actionMenu === alert.id ? null : alert.id)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-all">
                          <span>Action</span>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400"/>
                        </button>

                        {actionMenu === alert.id && (<div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-30 animate-fadeIn">
                            <button onClick={() => handleAction(alert.id, 'ACKNOWLEDGED')} className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-amber-500"/>
                              <span>Acknowledge</span>
                            </button>
                            <button onClick={() => handleAction(alert.id, 'RESOLVED')} className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500"/>
                              <span>Resolve Incident</span>
                            </button>
                            <button onClick={() => handleAction(alert.id, 'ESCALATED')} className="w-full px-3 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2">
                              <ArrowUpRight className="w-3.5 h-3.5 text-rose-500"/>
                              <span>Escalate to Lead</span>
                            </button>
                          </div>)}
                      </div>)}
                  </div>
                </div>);
            })}
          </div>)}
      </div>

      {/* Floating Toast Notification */}
      {toast && (<div className="fixed bottom-6 right-6 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-xl text-xs font-medium z-50 animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0"/>
          <span>{toast.message}</span>
        </div>)}
    </div>);
}

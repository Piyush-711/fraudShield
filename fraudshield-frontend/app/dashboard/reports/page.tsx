'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchReportSummary } from '@/lib/api';
import { ReportSummary } from '@/lib/types';
import {
  FileText,
  Download,
  Calendar,
  CreditCard,
  CheckCircle2,
  Ban,
  Clock,
  AlertTriangle,
  Zap,
  Bell,
  RefreshCw,
  ChevronRight,
  FileSpreadsheet,
  Code2,
  SlidersHorizontal,
  Sparkles,
  ShieldCheck,
  Activity,
  ArrowUpRight
} from 'lucide-react';

interface ReportItem {
  id: number;
  name: string;
  date: string;
  type: 'PDF' | 'CSV' | 'JSON';
  status: 'READY' | 'GENERATING';
  size: string | null;
  progress?: number;
}

const INITIAL_REPORTS: ReportItem[] = [
  { id: 1, name: 'Daily Fraud Summary - Today', date: '2026-06-14', type: 'PDF', status: 'READY', size: '2.4 MB' },
  { id: 2, name: 'Weekly Adjudication Audit', date: '2026-06-14', type: 'CSV', status: 'READY', size: '8.1 MB' },
  { id: 3, name: 'Monthly ML Model Drift Assessment', date: '2026-06-15', type: 'PDF', status: 'GENERATING', progress: 68, size: null },
  { id: 4, name: 'High Velocity Attack Vector Analysis - Q2', date: '2026-06-10', type: 'JSON', status: 'READY', size: '1.2 MB' },
];

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  colorClass,
  bgClass
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: any;
  colorClass: string;
  bgClass: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-3.5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bgClass}`}>
        <Icon className={`w-5 h-5 ${colorClass}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider truncate">{label}</p>
        <p className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight">{value}</p>
        {sub && <p className="text-[11px] text-slate-400 mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState('DAILY_SUMMARY');
  const [fromDate, setFromDate] = useState('2026-06-01');
  const [toDate, setToDate] = useState('2026-06-15');
  const [format, setFormat] = useState<'PDF' | 'CSV' | 'JSON'>('PDF');
  const [includes, setIncludes] = useState({ fraud: true, perf: true, transactions: false, audit: false });
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [reports, setReports] = useState<ReportItem[]>(INITIAL_REPORTS);
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
    await new Promise(r => setTimeout(r, 1800));
    const newReport: ReportItem = {
      id: Date.now(),
      name: `${reportType.replace(/_/g, ' ')} - ${toDate}`,
      date: new Date().toISOString().slice(0, 10),
      type: format,
      status: 'READY',
      size: '3.2 MB',
    };
    setReports(prev => [newReport, ...prev]);
    setGenerating(false);
    setGenerated(true);
    setTimeout(() => setGenerated(false), 4000);
    fetchReportSummary(period).then(data => setSummary(data));
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div>
        <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-2">
          <Link href="/dashboard" className="text-slate-500 hover:text-indigo-600 transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 font-semibold">Reports & Analytics</span>
        </nav>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Executive Compliance & Risk Reports</h1>
            <p className="text-xs text-slate-500 mt-1">Generate, schedule, and export comprehensive fraud audit documentation</p>
          </div>
          {/* Period selector */}
          <div className="flex items-center gap-1 p-1 bg-white rounded-lg border border-slate-200 shadow-sm">
            {[7, 30, 90].map(d => (
              <button
                key={d}
                onClick={() => setPeriod(d)}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                  period === d
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Last {d}d
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Telemetry Summary */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Live Audit Metrics — {summary?.reportPeriod ?? `Last ${period} days`}
            </h3>
          </div>
          {summaryLoading && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              <span>Updating telemetry...</span>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          <StatCard
            label="Total Vol."
            value={summary?.totalTransactions ?? '—'}
            icon={CreditCard}
            colorClass="text-indigo-600"
            bgClass="bg-indigo-50"
          />
          <StatCard
            label="Approved"
            value={summary?.approvedTransactions ?? '—'}
            icon={CheckCircle2}
            colorClass="text-emerald-600"
            bgClass="bg-emerald-50"
          />
          <StatCard
            label="Rejected"
            value={summary?.rejectedTransactions ?? '—'}
            icon={Ban}
            colorClass="text-rose-600"
            bgClass="bg-rose-50"
            sub={summary ? `${summary.fraudRate}% fraud rate` : undefined}
          />
          <StatCard
            label="In Review"
            value={summary?.pendingReviews ?? '—'}
            icon={Clock}
            colorClass="text-amber-600"
            bgClass="bg-amber-50"
          />
          <StatCard
            label="High Risk"
            value={summary?.highRiskTransactions ?? '—'}
            icon={AlertTriangle}
            colorClass="text-purple-600"
            bgClass="bg-purple-50"
          />
          <StatCard
            label="Avg Latency"
            value={summary ? `${summary.avgProcessingTimeMs}ms` : '—'}
            icon={Zap}
            colorClass="text-blue-600"
            bgClass="bg-blue-50"
          />
          <StatCard
            label="Active Alerts"
            value={summary?.activeAlerts ?? '—'}
            icon={Bell}
            colorClass="text-rose-600"
            bgClass="bg-rose-50"
          />
        </div>
      </div>

      {generated && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 text-emerald-800 text-xs font-semibold animate-slideUp">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>Report compiled and generated successfully! It has been added to the ready downloads below.</span>
        </div>
      )}

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Generator Form */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Compile New Audit Report</h3>
              <p className="text-xs text-slate-400">Select parameters, included telemetry modules, and format</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Report Scope</label>
              <select
                value={reportType}
                onChange={e => setReportType(e.target.value)}
                className="w-full text-xs font-medium px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                <option value="DAILY_SUMMARY">Executive Daily Summary</option>
                <option value="WEEKLY_AUDIT">Weekly Compliance & Adjudication Audit</option>
                <option value="MONTHLY_REPORT">Monthly Threat Spectrum & Model Drift</option>
                <option value="CUSTOM">Custom Targeted Investigation</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Date Range: From</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Date Range: To</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Sections to Include</label>
              <div className="space-y-2">
                {[
                  { key: 'fraud', label: 'Fraud Breakdown & Vector Distribution', desc: 'SHAP factors and high-risk triggers' },
                  { key: 'perf', label: 'System Throughput & Engine Latency', desc: 'ML scoring speed and pipeline benchmarks' },
                  { key: 'transactions', label: 'Itemized High-Risk Ledger', desc: 'Detailed transaction identifiers' },
                  { key: 'audit', label: 'Analyst Adjudication Audit Log', desc: 'Human-in-the-loop overrides & notes' },
                ].map(item => (
                  <label
                    key={item.key}
                    className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 cursor-pointer transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={(includes as any)[item.key]}
                      onChange={e => setIncludes(p => ({ ...p, [item.key]: e.target.checked }))}
                      className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <p className="text-xs font-semibold text-slate-800 leading-none">{item.label}</p>
                      <p className="text-[11px] text-slate-400 mt-1">{item.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Export Format</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { format: 'PDF', icon: FileText, desc: 'Presentation Ready' },
                  { format: 'CSV', icon: FileSpreadsheet, desc: 'Tabular Data' },
                  { format: 'JSON', icon: Code2, desc: 'API Payload' },
                ].map(item => {
                  const Icon = item.icon;
                  const isSelected = format === item.format;
                  return (
                    <button
                      key={item.format}
                      type="button"
                      onClick={() => setFormat(item.format as any)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 text-indigo-900'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <span className="text-xs font-bold">{item.format}</span>
                      </div>
                      <p className="text-[10px] text-slate-400">{item.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating}
                className="flex-1 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Compiling Report...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-indigo-200" />
                    <span>Generate Report</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => alert('Automated schedule configurator will be enabled in next minor release.')}
                className="py-2.5 px-4 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Schedule</span>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Reports & Documentation */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Generated Archive</h3>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">{reports.length} files available</span>
            </div>

            <div className="divide-y divide-slate-100">
              {reports.map(r => (
                <div key={r.id} className="p-4 flex items-center gap-3.5 hover:bg-slate-50/70 transition-colors">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      r.type === 'PDF'
                        ? 'bg-rose-50 text-rose-600'
                        : r.type === 'CSV'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-blue-50 text-blue-600'
                    }`}
                  >
                    {r.type === 'PDF' ? (
                      <FileText className="w-4 h-4" />
                    ) : r.type === 'CSV' ? (
                      <FileSpreadsheet className="w-4 h-4" />
                    ) : (
                      <Code2 className="w-4 h-4" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">{r.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {r.date} · <span className="font-mono font-medium">{r.type}</span>
                      {r.size ? ` · ${r.size}` : ''}
                    </p>

                    {r.status === 'GENERATING' && (
                      <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${r.progress}%` }}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    {r.status === 'READY' ? (
                      <button
                        onClick={() => alert(`Initiating export for ${r.name}...`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-white bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-all"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-500" />
                        <span>Export</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>{r.progress}%</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Standard compliance templates info card */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Compliance Report Templates</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { name: 'Daily Executive Digest', desc: 'High-level KPI changes, detected threats & approval rates' },
                { name: 'Weekly Adjudication Audit', desc: 'Manual review queues, analyst overturns & decisions' },
                { name: 'Monthly Risk Horizon', desc: '30-day vector evolution, model confidence & drift' },
                { name: 'Custom Regulatory Export', desc: 'Standardized format conforming to audit directives' },
              ].map(tpl => (
                <div key={tpl.name} className="p-3 bg-white rounded-lg border border-slate-200/80">
                  <p className="text-xs font-bold text-slate-800">{tpl.name}</p>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">{tpl.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

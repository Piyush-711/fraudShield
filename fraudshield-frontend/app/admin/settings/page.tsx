'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchSettings, saveSettings } from '@/lib/api';
import { SystemSettings } from '@/lib/types';
import {
  Sliders,
  Shield,
  Gauge,
  Server,
  Bell,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Cpu,
  Mail,
  MessageSquare,
  RefreshCw,
  Zap,
  Info
} from 'lucide-react';

function Section({
  title,
  subtitle,
  icon: Icon,
  children
}: {
  title: string;
  subtitle?: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
      <div className="flex items-start gap-3 pb-4 mb-5 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0 mt-0.5">
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function SliderField({
  label,
  desc,
  value,
  min,
  max,
  step = 1,
  onChange,
  colorClass = 'bg-indigo-600',
  badgeClass = 'bg-indigo-50 text-indigo-700 border-indigo-200',
  unit = ''
}: {
  label: string;
  desc?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  colorClass?: string;
  badgeClass?: string;
  unit?: string;
}) {
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <div className="mb-6 last:mb-0">
      <div className="flex justify-between items-center mb-1.5">
        <div>
          <label className="text-xs font-semibold text-slate-700">{label}</label>
          {desc && <p className="text-[11px] text-slate-400 mt-0.5">{desc}</p>}
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-md border font-mono ${badgeClass}`}>
          {value}
          {unit}
        </span>
      </div>

      <div className="relative h-6 flex items-center">
        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden relative">
          <div
            className={`h-full rounded-full transition-all duration-150 ${colorClass}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-indigo-600 shadow-md pointer-events-none transition-all duration-150"
          style={{ left: `calc(${pct}% - 8px)` }}
        />
      </div>

      <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
        <span>
          {min}
          {unit}
        </span>
        <span>
          {max}
          {unit}
        </span>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
        checked ? 'bg-indigo-600' : 'bg-slate-300'
      }`}
    >
      <div
        className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [original, setOriginal] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchSettings().then(s => {
      setSettings(s);
      setOriginal(JSON.parse(JSON.stringify(s)));
      setLoading(false);
    });
  }, []);

  const update = <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) => {
    setSettings(s => (s ? { ...s, [key]: value } : s));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setShowConfirm(false);
    await saveSettings(settings);
    setOriginal(JSON.parse(JSON.stringify(settings)));
    setSaving(false);
    setSaved(true);
    setHasChanges(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    if (original) {
      setSettings(JSON.parse(JSON.stringify(original)));
      setHasChanges(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-xs font-medium">Loading system configurations...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6 animate-fadeIn pb-16">
      {/* Header */}
      <div>
        <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-2">
          <Link href="/dashboard" className="text-slate-500 hover:text-indigo-600 transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500">Admin</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 font-semibold">System Settings</span>
        </nav>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Detection Engine & System Settings</h1>
        <p className="text-xs text-slate-500 mt-1">Configure ML inference thresholds, rate limiting, and alert telemetry</p>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 text-emerald-800 text-xs font-semibold animate-slideDown">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>System configuration parameters saved and propagated across active nodes successfully!</span>
        </div>
      )}

      {hasChanges && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-800 text-xs font-medium">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>You have modified system parameters that have not been saved.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-slate-700 hover:bg-amber-100/50 font-semibold transition-colors"
            >
              Reset
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold shadow-sm transition-colors"
            >
              Save Now
            </button>
          </div>
        </div>
      )}

      {/* Fraud Detection Thresholds */}
      <Section
        title="ML Scoring & Decision Boundaries"
        subtitle="Calibrate risk spectrum cutoffs for automatic approval, analyst triage, and instant blocking"
        icon={Shield}
      >
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-6 text-xs text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-800">Auto-Approve:</span>
            <span className="font-mono text-emerald-700 font-bold">0 – {settings.autoApprovalThreshold}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="font-semibold text-slate-800">Manual Queue:</span>
            <span className="font-mono text-amber-700 font-bold">
              {settings.autoApprovalThreshold} – {settings.manualReviewThreshold}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="font-semibold text-slate-800">High Risk Queue:</span>
            <span className="font-mono text-rose-700 font-bold">
              {settings.manualReviewThreshold} – {settings.autoRejectionThreshold}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-800" />
            <span className="font-semibold text-slate-800">Auto-Reject:</span>
            <span className="font-mono text-red-900 font-bold">{settings.autoRejectionThreshold} – 100</span>
          </div>
        </div>

        <SliderField
          label="Auto-Approval Cutoff Score"
          desc="Transactions with risk score below this threshold are cleared automatically"
          value={settings.autoApprovalThreshold}
          min={5}
          max={40}
          onChange={v => update('autoApprovalThreshold', v)}
          colorClass="bg-emerald-600"
          badgeClass="bg-emerald-50 text-emerald-700 border-emerald-200"
        />

        <SliderField
          label="Manual Review Threshold"
          desc="Transactions scoring above this limit are routed to analyst adjudication"
          value={settings.manualReviewThreshold}
          min={40}
          max={90}
          onChange={v => update('manualReviewThreshold', v)}
          colorClass="bg-amber-500"
          badgeClass="bg-amber-50 text-amber-700 border-amber-200"
        />

        <SliderField
          label="Auto-Rejection Threshold"
          desc="Transactions scoring above this limit trigger immediate hard denial"
          value={settings.autoRejectionThreshold}
          min={70}
          max={99}
          onChange={v => update('autoRejectionThreshold', v)}
          colorClass="bg-rose-600"
          badgeClass="bg-rose-50 text-rose-700 border-rose-200"
        />
      </Section>

      {/* Rate Limiting & Throughput */}
      <Section
        title="Throughput & Rate Limiting"
        subtitle="Configure incoming traffic throttle caps, per-account velocity buffers, and timeouts"
        icon={Gauge}
      >
        <SliderField
          label="Global Peak Throughput Cap"
          desc="Maximum transactions permitted per minute across all gateway listeners"
          value={settings.maxTransactionsPerMinute}
          min={1000}
          max={20000}
          step={500}
          onChange={v => update('maxTransactionsPerMinute', v)}
          colorClass="bg-indigo-600"
          unit=" tx/min"
        />

        <SliderField
          label="Per-User Velocity Threshold"
          desc="Maximum transactions permitted per unique account in a rolling 1-hour window"
          value={settings.maxTransactionsPerUserHour}
          min={100}
          max={5000}
          step={100}
          onChange={v => update('maxTransactionsPerUserHour', v)}
          colorClass="bg-indigo-600"
          unit=" tx/hr"
        />

        <SliderField
          label="Inference Latency SLA Timeout"
          desc="Upper threshold for synchronous ML scoring before falling back to rules engine"
          value={settings.transactionTimeoutMs}
          min={100}
          max={1000}
          step={50}
          onChange={v => update('transactionTimeoutMs', v)}
          colorClass="bg-amber-500"
          badgeClass="bg-amber-50 text-amber-700 border-amber-200"
          unit=" ms"
        />
      </Section>

      {/* Cluster & Infrastructure */}
      <Section
        title="Engine Infrastructure & Cache"
        subtitle="Manage distributed Kafka partition consumers and Redis session cache lifetimes"
        icon={Server}
      >
        <SliderField
          label="Kafka Consumer Worker Threads"
          desc="Concurrent worker routines draining incoming transaction ingest queues"
          value={settings.kafkaConsumerThreads}
          min={1}
          max={10}
          onChange={v => update('kafkaConsumerThreads', v)}
          colorClass="bg-purple-600"
          badgeClass="bg-purple-50 text-purple-700 border-purple-200"
          unit=" workers"
        />

        <SliderField
          label="Redis Feature Cache Retention"
          desc="TTL duration for customer behavioral velocity aggregates stored in memory"
          value={settings.redisCacheTtlHours}
          min={1}
          max={24}
          onChange={v => update('redisCacheTtlHours', v)}
          colorClass="bg-purple-600"
          badgeClass="bg-purple-50 text-purple-700 border-purple-200"
          unit=" hours"
        />
      </Section>

      {/* Alert Notifications */}
      <Section
        title="Alert Dispatch & Webhooks"
        subtitle="Broadcast notifications to security operation center feeds and communications channels"
        icon={Bell}
      >
        <div className="divide-y divide-slate-100">
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Email Broadcasts</p>
                <p className="text-[11px] text-slate-400">Send high severity incident reports to designated security group</p>
              </div>
            </div>
            <Toggle
              checked={settings.emailNotificationsEnabled}
              onChange={v => update('emailNotificationsEnabled', v)}
            />
          </div>

          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Slack SOC Channel Integration</p>
                <p className="text-[11px] text-slate-400">Dispatch instant notifications into #soc-alerts webhook</p>
              </div>
            </div>
            <Toggle
              checked={settings.slackNotificationsEnabled}
              onChange={v => update('slackNotificationsEnabled', v)}
            />
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Minimum Trigger Severity for External Notification
          </label>
          <select
            value={settings.alertSeverityThreshold}
            onChange={e => update('alertSeverityThreshold', e.target.value)}
            className="w-full sm:w-64 text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="LOW">Low & above (All notifications)</option>
            <option value="MEDIUM">Medium & above (Recommended)</option>
            <option value="HIGH">High & Critical only</option>
            <option value="CRITICAL">Critical only (Urgent escalations)</option>
          </select>
        </div>
      </Section>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => setShowConfirm(true)}
          disabled={saving || !hasChanges}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save System Settings</span>
            </>
          )}
        </button>
        <button
          onClick={handleReset}
          disabled={!hasChanges}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw className="w-4 h-4 text-slate-400" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-slideDown">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 text-center">Save System Configuration?</h3>
            <p className="text-xs text-slate-500 text-center mt-1.5 leading-relaxed">
              Modifying these thresholds will alter live transaction classification and automated rejection logic across the production pipeline immediately.
            </p>
            <div className="flex gap-2.5 mt-6">
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
              >
                Confirm & Apply
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 px-4 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

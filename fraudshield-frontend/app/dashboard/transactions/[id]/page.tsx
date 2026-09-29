'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  CreditCard,
  Globe,
  Smartphone,
  Laptop,
  Clock,
  Cpu,
  Zap,
  Copy,
  Check,
  MapPin,
  Calendar,
  User,
  History,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { fetchTransactionById } from '@/lib/api';
import { TransactionDetail } from '@/lib/types';
import { formatCurrency, formatDate, getRiskLevel } from '@/lib/mockData';

function RiskBadge({ score }: { score: number }) {
  const level = getRiskLevel(score);
  const cfg = {
    HIGH: { bg: 'bg-rose-50 text-rose-700 border-rose-200', label: 'CRITICAL THREAT' },
    MEDIUM: { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'SUSPICIOUS' },
    LOW: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'LOW RISK' },
  }[level];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${cfg.bg}`}>
      {level === 'HIGH' ? (
        <ShieldAlert className="w-3.5 h-3.5" />
      ) : (
        <ShieldCheck className="w-3.5 h-3.5" />
      )}
      <span>
        {cfg.label} · {score} / 100
      </span>
    </span>
  );
}

function StatusChip({ status }: { status: string }) {
  const configs: Record<string, { bg: string; text: string; dot: string; label: string }> = {
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
      label: 'Under Manual Review',
    },
    PENDING: {
      bg: 'bg-sky-50 border-sky-200/80',
      text: 'text-sky-700',
      dot: 'bg-sky-500',
      label: 'Pending Ingestion',
    },
  };

  const c = configs[status] || {
    bg: 'bg-slate-50 border-slate-200',
    text: 'text-slate-600',
    dot: 'bg-slate-400',
    label: status.replace(/_/g, ' '),
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [tx, setTx] = useState<TransactionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchTransactionById(id).then((data) => {
      setTx(data);
      setLoading(false);
    });
  }, [id]);

  const handleCopyId = () => {
    if (!tx) return;
    navigator.clipboard.writeText(tx.transactionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse py-8 max-w-4xl mx-auto">
        <div className="h-6 bg-slate-200 rounded w-48 mb-4"></div>
        <div className="h-36 bg-slate-200 rounded-2xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200 rounded-2xl"></div>
          <div className="h-64 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!tx) {
    return (
      <div className="text-center py-24 max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <AlertTriangle className="w-8 h-8 text-rose-500" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Transaction Not Found</h2>
        <p className="text-xs text-slate-500">
          No records found matching Transaction ID: <code className="font-mono">{id}</code>
        </p>
        <Link
          href="/dashboard/transactions"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 pt-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Transaction Explorer</span>
        </Link>
      </div>
    );
  }

  const canReview = tx.transactionStatus === 'MANUAL_REVIEW' || tx.transactionStatus === 'PENDING';

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* ── Breadcrumb & Back Bar ── */}
      <div className="flex items-center justify-between">
        <nav className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <Link href="/dashboard" className="hover:text-indigo-600 transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <Link href="/dashboard/transactions" className="hover:text-indigo-600 transition-colors">
            Transactions
          </Link>
          <span>/</span>
          <span className="font-mono text-slate-700">{tx.transactionId}</span>
        </nav>

        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
      </div>

      {/* ── Transaction Headline Card ── */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
                {tx.transactionId}
              </h1>
              <button
                onClick={handleCopyId}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Copy Transaction ID"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <RiskBadge score={tx.fraudScore} />
              <StatusChip status={tx.transactionStatus} />
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                {tx.processingTimeMs}ms
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200">
                <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                Model {tx.modelVersion || 'v2.1.0'}
              </span>
            </div>
          </div>

          {canReview && (
            <Link
              href={`/dashboard/transactions/${id}/review`}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/25 transition-all self-start md:self-center"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Submit Analyst Decision</span>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: AI Explainability Factors & Risk Signals */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Explainability Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-600" />
                  AI Model Explainability Factors
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Top weighted behavioral and telemetry signals evaluated by the ML ensemble
                </p>
              </div>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                Confidence: {tx.fraudConfidence}%
              </span>
            </div>

            <div className="space-y-3 pt-1">
              {tx.fraudFactors && tx.fraudFactors.length > 0 ? (
                tx.fraudFactors.map((f, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/60 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 capitalize">
                        {f.factor.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500">
                        Weight: {Math.round(f.weight * 100)}%
                      </span>
                    </div>

                    {/* Weight bar */}
                    <div className="w-full h-1.5 bg-slate-200/70 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full"
                        style={{ width: `${Math.min(f.weight * 100, 100)}%` }}
                      />
                    </div>

                    <p className="text-xs text-slate-600">{f.explanation}</p>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-slate-400 text-xs">
                  No risk deviation anomalies detected for this transaction profile.
                </div>
              )}
            </div>
          </div>

          {/* Audit History & Decision Trail */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2 border-b border-slate-100 pb-3">
              <History className="w-4 h-4 text-slate-500" />
              Audit Log & Decision History
            </h3>

            <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {tx.auditHistory && tx.auditHistory.length > 0 ? (
                tx.auditHistory.map((log) => (
                  <div key={log.id} className="relative">
                    <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-indigo-50" />
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 uppercase">
                          {log.actionType}
                        </span>
                        <span className="text-slate-400">by {log.actorId}</span>
                        {log.actorRole && (
                          <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-semibold">
                            {log.actorRole}
                          </span>
                        )}
                      </div>
                      {log.changeReason && (
                        <p className="text-slate-600 text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-100">
                          {log.changeReason}
                        </p>
                      )}
                      <p className="text-[10px] text-slate-400">{formatDate(log.timestamp)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400">
                  Transaction ingested and automatically classified by rule engine.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Transaction Details, Card & Telemetry */}
        <div className="space-y-6">
          {/* Financial Details */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2 border-b border-slate-100 pb-3">
              <CreditCard className="w-4 h-4 text-slate-500" />
              Payment & Merchant
            </h3>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500">Amount</span>
                <span className="font-bold text-base text-slate-900">
                  {formatCurrency(tx.amount)} {tx.currency}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500">Merchant</span>
                <span className="font-semibold text-slate-800">{tx.merchantName}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500">Category</span>
                <span className="font-medium text-slate-700 uppercase text-[11px]">
                  {tx.merchantCategory}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500">Card Payment</span>
                <span className="font-medium text-slate-800">
                  {tx.cardType} ···· {tx.cardLast4}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500">Channel</span>
                <span className="font-medium text-slate-800">{tx.transactionType}</span>
              </div>
            </div>
          </div>

          {/* Account Profile */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="w-4 h-4 text-slate-500" />
              Account Identity
            </h3>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500">User ID</span>
                <span className="font-semibold font-mono text-slate-800">{tx.userId}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500">Email</span>
                <span className="font-medium text-slate-800 truncate max-w-[160px]">
                  {tx.userEmail}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500">Created At</span>
                <span className="text-slate-600 text-[11px]">{formatDate(tx.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Telemetry & Geolocation */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2 border-b border-slate-100 pb-3">
              <Globe className="w-4 h-4 text-slate-500" />
              Device & Geolocation
            </h3>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500">Location</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  {tx.location?.city}, {tx.location?.country}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500">IP Address</span>
                <span className="font-mono text-slate-800">{tx.location?.ipAddress}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500">Device</span>
                <span className="font-medium text-slate-800 flex items-center gap-1">
                  {tx.deviceType === 'MOBILE' ? (
                    <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <Laptop className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  {tx.deviceType} ({tx.deviceOs})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

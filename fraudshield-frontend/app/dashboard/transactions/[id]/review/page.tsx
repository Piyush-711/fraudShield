'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  PhoneCall,
  Flag,
  FileCheck2,
  Bookmark,
  ShieldCheck,
  RefreshCw,
  Info,
} from 'lucide-react';
import { fetchTransactionById, submitManualReview } from '@/lib/api';
import { TransactionDetail } from '@/lib/types';
import { formatCurrency } from '@/lib/mockData';

export default function ReviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [tx, setTx] = useState<TransactionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED' | 'MANUAL_REVIEW' | ''>('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [contactCustomer, setContactCustomer] = useState(false);
  const [flagInvestigation, setFlagInvestigation] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  useEffect(() => {
    fetchTransactionById(id).then((data) => {
      setTx(data);
      setLoading(false);
    });
  }, [id]);

  const canSubmit = decision && reason.length >= 10 && confirmed;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError('');
    try {
      await submitManualReview(id, {
        decision: decision as any,
        reason,
        notes,
        contactCustomer,
        flagForInvestigation: flagInvestigation,
      });
      setSubmitted(true);
      setTimeout(() => router.push('/dashboard/transactions'), 2500);
    } catch {
      setError('Failed to submit review decision. Please check backend connectivity.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center max-w-md mx-auto space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
        <p className="text-xs text-slate-500 font-medium">Loading transaction review session...</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="py-16 flex items-center justify-center animate-fadeIn">
        <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-md text-center max-w-md w-full space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 className="w-8 h-8 stroke-[2]" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Decision Submitted Successfully
          </h2>
          <p className="text-xs text-slate-600">
            Decision outcome:{' '}
            <strong
              className={`uppercase font-bold ${
                decision === 'APPROVED' ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {decision}
            </strong>
          </p>
          <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
            "{reason}"
          </p>
          <p className="text-[11px] text-slate-400">Redirecting to transactions feed in 2s...</p>
          <Link
            href="/dashboard/transactions"
            className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
          >
            Return to Feed
          </Link>
        </div>
      </div>
    );
  }

  const decisionOptions = [
    {
      value: 'APPROVED',
      label: 'Approve Transaction',
      desc: 'Mark payment as genuine and clear risk flag',
      icon: CheckCircle2,
      activeBorder: 'border-emerald-500 bg-emerald-50/50 text-emerald-900 ring-2 ring-emerald-500/20',
      iconColor: 'text-emerald-600',
    },
    {
      value: 'REJECTED',
      label: 'Reject & Block',
      desc: 'Confirm fraudulent pattern and decline transaction',
      icon: XCircle,
      activeBorder: 'border-rose-500 bg-rose-50/50 text-rose-900 ring-2 ring-rose-500/20',
      iconColor: 'text-rose-600',
    },
    {
      value: 'MANUAL_REVIEW',
      label: 'Escalate to Tier 2',
      desc: 'Assign to Senior Fraud Investigation unit',
      icon: AlertTriangle,
      activeBorder: 'border-amber-500 bg-amber-50/50 text-amber-900 ring-2 ring-amber-500/20',
      iconColor: 'text-amber-600',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 font-medium">
        <Link href="/dashboard" className="hover:text-indigo-600 transition-colors">
          Dashboard
        </Link>
        <span>/</span>
        <Link href="/dashboard/transactions" className="hover:text-indigo-600 transition-colors">
          Transactions
        </Link>
        <span>/</span>
        <Link
          href={`/dashboard/transactions/${id}`}
          className="font-mono hover:text-indigo-600 transition-colors"
        >
          {id}
        </Link>
        <span>/</span>
        <span className="text-slate-700">Analyst Review</span>
      </nav>

      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <FileCheck2 className="w-6 h-6 text-indigo-600" />
          Fraud Analyst Adjudication
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review evidence, record resolution reasoning, and commit final risk decision
        </p>
      </div>

      {/* ── Transaction Brief Card ── */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm space-y-4">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Target Transaction Brief
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-400 text-[11px]">Transaction ID</span>
            <p className="font-mono font-bold text-sm text-indigo-300 mt-0.5">{tx?.transactionId ?? id}</p>
          </div>
          <div>
            <span className="text-slate-400 text-[11px]">Total Amount</span>
            <p className="font-bold text-sm text-white mt-0.5">{tx ? formatCurrency(tx.amount) : '—'}</p>
          </div>
          <div>
            <span className="text-slate-400 text-[11px]">Merchant</span>
            <p className="font-semibold text-white mt-0.5">{tx?.merchantName ?? '—'}</p>
          </div>
          <div>
            <span className="text-slate-400 text-[11px]">ML Risk Score</span>
            <p className="font-bold text-sm text-rose-400 mt-0.5">{tx?.fraudScore ?? 0} / 100</p>
          </div>
          <div>
            <span className="text-slate-400 text-[11px]">ML Initial Model</span>
            <p className="font-semibold text-white mt-0.5">{tx?.modelVersion || 'v2.1.0'}</p>
          </div>
          <div>
            <span className="text-slate-400 text-[11px]">Status</span>
            <p className="font-semibold text-amber-400 uppercase mt-0.5">
              {tx?.transactionStatus?.replace(/_/g, ' ') ?? '—'}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Decision Selectors ── */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 tracking-tight">
          Select Adjudication Decision <span className="text-rose-500">*</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {decisionOptions.map((opt) => {
            const isSelected = decision === opt.value;
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDecision(opt.value as any)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? opt.activeBorder
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Icon className={`w-5 h-5 ${opt.iconColor}`} />
                  {isSelected && <span className="w-2 h-2 rounded-full bg-indigo-600" />}
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900">{opt.label}</h3>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">{opt.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Review Details Form ── */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
        <h2 className="text-sm font-bold text-slate-900 tracking-tight">
          Decision Rationale & Compliance Notes
        </h2>

        {/* Reason field */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 block">
            Resolution Justification <span className="text-rose-500">*</span>{' '}
            <span className="text-slate-400 font-normal">(Minimum 10 characters required)</span>
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Cardholder identity verified via secondary mobile authentication"
            className={`w-full px-3.5 py-2 text-xs bg-slate-50 border rounded-xl focus:bg-white transition-all outline-none ${
              reason.length > 0 && reason.length < 10
                ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                : 'border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500'
            }`}
          />
          <div className="flex items-center justify-between text-[11px] pt-0.5">
            {reason.length > 0 && reason.length < 10 ? (
              <span className="text-rose-600">Must be at least 10 characters long</span>
            ) : (
              <span className="text-slate-400">Clear audit rationale will be logged</span>
            )}
            <span className="text-slate-400">{reason.length} / 500</span>
          </div>
        </div>

        {/* Additional Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 block">
            Investigation Notes <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Include any relevant communication, reference numbers, or supporting details..."
            className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Verification Checkboxes */}
        <div className="pt-2 space-y-2.5 border-t border-slate-100">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
            <span className="text-xs font-semibold text-slate-800">
              I certify this is an authoritative final risk adjudication{' '}
              <span className="text-rose-500">*</span>
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group text-slate-600">
            <input
              type="checkbox"
              checked={contactCustomer}
              onChange={(e) => setContactCustomer(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
            <span className="text-xs flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
              Customer verification callback requested
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group text-slate-600">
            <input
              type="checkbox"
              checked={flagInvestigation}
              onChange={(e) => setFlagInvestigation(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
            <span className="text-xs flex items-center gap-1.5">
              <Flag className="w-3.5 h-3.5 text-slate-400" />
              Flag merchant for chargeback audit review
            </span>
          </label>
        </div>
      </div>

      {/* ── Action Buttons ── */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-all cursor-pointer"
        >
          {submitting ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Committing Decision...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Submit Adjudication</span>
            </>
          )}
        </button>

        <button
          onClick={() => setShowCancel(true)}
          className="px-4 py-2.5 rounded-xl font-semibold text-xs text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>

      {/* ── Discard Modal ── */}
      {showCancel && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Discard Current Review?</h3>
            <p className="text-xs text-slate-500">
              Any unsaved changes or notes entered for this transaction will be cleared.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => router.push(`/dashboard/transactions/${id}`)}
                className="flex-1 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors cursor-pointer"
              >
                Discard
              </button>
              <button
                onClick={() => setShowCancel(false)}
                className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Keep Editing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

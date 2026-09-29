'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Eye,
  SlidersHorizontal,
  X,
  CreditCard,
  AlertOctagon,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { fetchTransactions } from '@/lib/api';
import { Transaction } from '@/lib/types';
import { formatCurrency, formatDate, getRiskLevel } from '@/lib/mockData';

function RiskScorePill({ score }: { score: number }) {
  let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let barColor = 'bg-emerald-500';

  if (score >= 70) {
    badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
    barColor = 'bg-rose-500';
  } else if (score >= 40) {
    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
    barColor = 'bg-amber-500';
  }

  return (
    <div className="inline-flex items-center gap-2">
      <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor}`}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
      <span className={`px-2 py-0.5 text-xs font-bold rounded-md border ${badgeColor}`}>
        {score}
      </span>
    </div>
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
      label: 'In Review',
    },
    PENDING: {
      bg: 'bg-sky-50 border-sky-200/80',
      text: 'text-sky-700',
      dot: 'bg-sky-500',
      label: 'Pending',
    },
  };

  const c = configs[status] || {
    bg: 'bg-slate-50 border-slate-200',
    text: 'text-slate-600',
    dot: 'bg-slate-400',
    label: status.replace(/_/g, ' '),
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.bg} ${c.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

const PAGE_SIZE = 10;

export default function TransactionsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState<string>(searchParams.get('status') ?? 'ALL');
  const [riskLevel, setRiskLevel] = useState<string>(searchParams.get('riskLevel') ?? 'ALL');
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '');
  const [page, setPage] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchTransactions({
        status: status as any,
        riskLevel: riskLevel as any,
        search,
        page,
        size: PAGE_SIZE,
        sortBy,
        sortDir,
      });
      setTransactions(res.content);
      setTotal(res.totalElements);
      setTotalPages(res.totalPages);
    } finally {
      setLoading(false);
    }
  }, [status, riskLevel, search, page, sortBy, sortDir]);

  useEffect(() => {
    load();
  }, [load]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(0);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleExport = () => {
    const rows = [['ID', 'Amount', 'Currency', 'Merchant', 'Risk Score', 'Status', 'Date']];
    transactions.forEach((t) =>
      rows.push([
        t.transactionId,
        String(t.amount),
        t.currency,
        t.merchantName,
        String(t.fraudScore),
        t.transactionStatus,
        formatDate(t.createdAt),
      ])
    );
    const csv = rows.map((r) => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv,' + encodeURIComponent(csv);
    a.download = `transactions_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
    setPage(0);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5 font-medium">
            <Link href="/dashboard" className="hover:text-indigo-600 transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-700">Transactions</span>
          </nav>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Transaction Activity Explorer
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time feed of all evaluated card payments and risk assessments
          </p>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs hover:shadow-xs transition-all self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* ── Filter Bar ── */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Filter by Transaction ID, Merchant, or Customer Email..."
              className="w-full pl-9 pr-9 py-2 text-xs bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Selector */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1 text-xs">
              {['ALL', 'APPROVED', 'MANUAL_REVIEW', 'REJECTED'].map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setStatus(st);
                    setPage(0);
                  }}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    status === st
                      ? 'bg-white text-indigo-700 font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st === 'ALL'
                    ? 'All Statuses'
                    : st === 'MANUAL_REVIEW'
                    ? 'Review Queue'
                    : st.charAt(0) + st.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Risk Level Dropdown */}
            <select
              value={riskLevel}
              onChange={(e) => {
                setRiskLevel(e.target.value);
                setPage(0);
              }}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="HIGH">High Risk (≥ 70)</option>
              <option value="MEDIUM">Medium Risk (40 - 69)</option>
              <option value="LOW">Low Risk (&lt; 40)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Transactions Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th
                  onClick={() => toggleSort('transactionId')}
                  className="py-3.5 px-6 cursor-pointer hover:text-slate-800"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Transaction ID</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-6">Customer / Account</th>
                <th
                  onClick={() => toggleSort('amount')}
                  className="py-3.5 px-6 cursor-pointer hover:text-slate-800"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Amount</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-6">Merchant & Category</th>
                <th
                  onClick={() => toggleSort('fraudScore')}
                  className="py-3.5 px-6 cursor-pointer hover:text-slate-800"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Risk Score</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-6">Decision Status</th>
                <th
                  onClick={() => toggleSort('createdAt')}
                  className="py-3.5 px-6 cursor-pointer hover:text-slate-800"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Date / Time</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {transactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  onClick={() => router.push(`/dashboard/transactions/${tx.transactionId}`)}
                >
                  <td className="py-3.5 px-6 font-mono font-bold text-indigo-600">
                    {tx.transactionId}
                  </td>
                  <td className="py-3.5 px-6">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-800">{tx.userId}</span>
                      <span className="text-[11px] text-slate-400">{tx.userEmail}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-6 font-bold text-slate-900">
                    {formatCurrency(tx.amount)}
                  </td>
                  <td className="py-3.5 px-6">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-800">{tx.merchantName}</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                        {tx.merchantCategory}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-6">
                    <RiskScorePill score={tx.fraudScore} />
                  </td>
                  <td className="py-3.5 px-6">
                    <StatusChip status={tx.transactionStatus} />
                  </td>
                  <td className="py-3.5 px-6 text-slate-500 text-[11px]">
                    {formatDate(tx.createdAt)}
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <Link
                      href={`/dashboard/transactions/${tx.transactionId}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-indigo-600 hover:text-white rounded-lg transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {loading && (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-600" />
              <p className="text-xs font-medium">Fetching transaction feed...</p>
            </div>
          )}

          {!loading && transactions.length === 0 && (
            <div className="py-16 text-center text-slate-400 space-y-3">
              <CreditCard className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No matching transactions found</p>
              <p className="text-xs text-slate-400">Try adjusting your filters or search keywords</p>
            </div>
          )}
        </div>

        {/* ── Pagination Footer ── */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            Showing{' '}
            <span className="font-semibold text-slate-800">
              {total > 0 ? page * PAGE_SIZE + 1 : 0}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-slate-800">
              {Math.min((page + 1) * PAGE_SIZE, total)}
            </span>{' '}
            of <span className="font-semibold text-slate-800">{total}</span> transactions
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <span className="px-2 font-medium text-slate-600">
              Page {page + 1} of {Math.max(1, totalPages)}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

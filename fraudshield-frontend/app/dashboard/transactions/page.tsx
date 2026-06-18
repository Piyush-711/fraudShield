'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { fetchTransactions } from '@/lib/api';
import { Transaction, TransactionStatus, RiskLevel } from '@/lib/types';
import { formatCurrency, formatDate, getRiskLevel } from '@/lib/mockData';

function RiskBadge({ score }: { score: number }) {
  const level = getRiskLevel(score);
  const s = level === 'HIGH' ? { bg:'#FEE2E2', color:'#991B1B' } : level === 'MEDIUM' ? { bg:'#FEF3C7', color:'#92400E' } : { bg:'#D1FAE5', color:'#065F46' };
  return <span style={{ background:s.bg, color:s.color, borderRadius:4, padding:'2px 8px', fontSize:12, fontWeight:600 }}>{score}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg:string; color:string; label:string }> = {
    APPROVED:      { bg:'#D1FAE5', color:'#065F46', label:'Approved' },
    REJECTED:      { bg:'#FEE2E2', color:'#991B1B', label:'Rejected' },
    MANUAL_REVIEW: { bg:'#DBEAFE', color:'#1E40AF', label:'Under Review' },
    PENDING:       { bg:'#FEF3C7', color:'#92400E', label:'Pending' },
    CANCELLED:     { bg:'#F3F4F6', color:'#6B7280', label:'Cancelled' },
  };
  const s = map[status] ?? { bg:'#F3F4F6', color:'#6B7280', label: status };
  return <span style={{ background:s.bg, color:s.color, borderRadius:4, padding:'3px 10px', fontSize:12, fontWeight:600 }}>{s.label}</span>;
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
  const [sortBy] = useState('createdAt');
  const [sortDir] = useState<'asc'|'desc'>('desc');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchTransactions({ status: status as any, riskLevel: riskLevel as any, search, page, size: PAGE_SIZE, sortBy, sortDir });
      setTransactions(res.content);
      setTotal(res.totalElements);
      setTotalPages(res.totalPages);
    } finally { setLoading(false); }
  }, [status, riskLevel, search, page, sortBy, sortDir]);

  useEffect(() => { load(); }, [load]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(0); }, 500);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleExport = () => {
    const rows = [['ID','Amount','Merchant','Risk Score','Status','Date']];
    transactions.forEach(t => rows.push([t.transactionId, String(t.amount), t.merchantName, String(t.fraudScore), t.transactionStatus, formatDate(t.createdAt)]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv,' + encodeURIComponent(csv);
    a.download = `transactions_export_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  const selectStyle = { padding:'8px 12px', borderRadius:8, border:'1px solid #E5E7EB', fontSize:13, color:'#374151', background:'white', cursor:'pointer' };

  return (
    <div style={{ animation:'fadeIn 0.3s ease' }}>
      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <nav style={{ fontSize:12, color:'#9CA3AF', marginBottom:8 }}>
          <Link href="/dashboard" style={{ color:'#6B7280', textDecoration:'none' }}>Dashboard</Link>
          <span style={{ margin:'0 6px' }}>›</span>
          <span style={{ color:'#1F2937' }}>Transactions</span>
        </nav>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:700, color:'#1F2937', margin:'0 0 4px' }}>Transactions</h1>
            <p style={{ fontSize:13, color:'#9CA3AF', margin:0 }}>{total.toLocaleString()} total transactions</p>
          </div>
          <button onClick={handleExport} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 16px', borderRadius:8, border:'1px solid #E5E7EB', background:'white', cursor:'pointer', fontSize:13, fontWeight:500, color:'#374151' }}>
            📥 Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background:'white', borderRadius:12, border:'1px solid #E5E7EB', padding:16, marginBottom:16, display:'flex', flexWrap:'wrap', gap:12, alignItems:'center' }}>
        <select id="status-filter" value={status} onChange={e => { setStatus(e.target.value); setPage(0); }} style={selectStyle}>
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="MANUAL_REVIEW">Manual Review</option>
        </select>
        <select id="risk-filter" value={riskLevel} onChange={e => { setRiskLevel(e.target.value); setPage(0); }} style={selectStyle}>
          <option value="ALL">All Risk Levels</option>
          <option value="HIGH">High Risk (&gt;70)</option>
          <option value="MEDIUM">Medium Risk (40–70)</option>
          <option value="LOW">Low Risk (&lt;40)</option>
        </select>
        <div style={{ flex:1, minWidth:200, position:'relative' }}>
          <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#9CA3AF', fontSize:14 }}>🔍</span>
          <input
            id="search-input"
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search by ID, merchant, user..."
            style={{ width:'100%', padding:'8px 12px 8px 32px', borderRadius:8, border:'1px solid #E5E7EB', fontSize:13, outline:'none', boxSizing:'border-box' }}
          />
        </div>
        <button onClick={() => { setStatus('ALL'); setRiskLevel('ALL'); setSearchInput(''); setPage(0); }}
          style={{ padding:'8px 14px', borderRadius:8, border:'1px solid #E5E7EB', background:'white', cursor:'pointer', fontSize:13, color:'#6B7280' }}>
          Clear Filters
        </button>
      </div>

      {/* Table */}
      <div style={{ background:'white', borderRadius:12, border:'1px solid #E5E7EB', boxShadow:'0 1px 3px rgba(0,0,0,0.05)', overflow:'hidden' }}>
        {loading ? (
          <div style={{ padding:60, textAlign:'center' }}>
            <div style={{ width:36, height:36, border:'3px solid #E5E7EB', borderTopColor:'#4F46E5', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto 12px' }} />
            <p style={{ color:'#9CA3AF', fontSize:14 }}>Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div style={{ padding:60, textAlign:'center' }}>
            <span style={{ fontSize:40 }}>📭</span>
            <p style={{ fontSize:16, fontWeight:600, color:'#374151', margin:'12px 0 4px' }}>No transactions found</p>
            <p style={{ fontSize:13, color:'#9CA3AF', margin:'0 0 16px' }}>Try adjusting your filters or search term</p>
            <button onClick={() => { setStatus('ALL'); setRiskLevel('ALL'); setSearchInput(''); }} style={{ padding:'8px 16px', borderRadius:8, border:'1px solid #4F46E5', background:'#EEF2FF', color:'#4F46E5', cursor:'pointer', fontSize:13, fontWeight:500 }}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table className="data-table" style={{ width:'100%' }}>
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Amount</th>
                  <th>Merchant</th>
                  <th>Category</th>
                  <th>Risk Score</th>
                  <th>Status</th>
                  <th>Date &amp; Time</th>
                  <th style={{ textAlign:'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id}
                    onClick={() => router.push(`/dashboard/transactions/${tx.transactionId}`)}
                    style={{ cursor:'pointer', transition:'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.background='#F9FAFB')}
                    onMouseLeave={e => (e.currentTarget.style.background='transparent')}
                  >
                    <td style={{ fontFamily:'monospace', fontSize:13, color:'#4F46E5', fontWeight:600 }}>{tx.transactionId}</td>
                    <td className="number" style={{ fontWeight:700, color:'#1F2937' }}>{formatCurrency(tx.amount)}</td>
                    <td style={{ color:'#374151', fontWeight:500 }}>{tx.merchantName}</td>
                    <td style={{ color:'#9CA3AF', fontSize:12 }}>{tx.merchantCategory}</td>
                    <td><RiskBadge score={tx.fraudScore} /></td>
                    <td><StatusBadge status={tx.transactionStatus} /></td>
                    <td style={{ color:'#6B7280', fontSize:12 }}>{formatDate(tx.createdAt)}</td>
                    <td className="action" onClick={e => e.stopPropagation()}>
                      {tx.transactionStatus === 'MANUAL_REVIEW' || tx.transactionStatus === 'PENDING' ? (
                        <Link href={`/dashboard/transactions/${tx.transactionId}/review`}
                          style={{ background:'#4F46E5', color:'white', borderRadius:6, padding:'5px 12px', fontSize:12, fontWeight:600, textDecoration:'none' }}>
                          Review
                        </Link>
                      ) : (
                        <Link href={`/dashboard/transactions/${tx.transactionId}`}
                          style={{ background:'#F3F4F6', color:'#374151', borderRadius:6, padding:'5px 12px', fontSize:12, fontWeight:500, textDecoration:'none' }}>
                          View
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && transactions.length > 0 && (
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 20px', borderTop:'1px solid #F3F4F6' }}>
            <span style={{ fontSize:13, color:'#6B7280' }}>
              Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total.toLocaleString()} transactions
            </span>
            <div style={{ display:'flex', gap:6 }}>
              <button onClick={() => setPage(p => Math.max(0, p-1))} disabled={page === 0}
                style={{ padding:'6px 14px', borderRadius:8, border:'1px solid #E5E7EB', background: page===0?'#F9FAFB':'white', color: page===0?'#D1D5DB':'#374151', cursor: page===0?'not-allowed':'pointer', fontSize:13 }}>
                ‹ Prev
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pg = Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
                return (
                  <button key={pg} onClick={() => setPage(pg)}
                    style={{ width:36, height:36, borderRadius:8, border: pg===page?'none':'1px solid #E5E7EB', background: pg===page?'#4F46E5':'white', color: pg===page?'white':'#374151', cursor:'pointer', fontSize:13, fontWeight: pg===page?600:400 }}>
                    {pg + 1}
                  </button>
                );
              })}
              <button onClick={() => setPage(p => Math.min(totalPages-1, p+1))} disabled={page >= totalPages-1}
                style={{ padding:'6px 14px', borderRadius:8, border:'1px solid #E5E7EB', background: page>=totalPages-1?'#F9FAFB':'white', color: page>=totalPages-1?'#D1D5DB':'#374151', cursor: page>=totalPages-1?'not-allowed':'pointer', fontSize:13 }}>
                Next ›
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
      `}</style>
    </div>
  );
}

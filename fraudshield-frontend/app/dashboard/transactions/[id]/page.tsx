'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { fetchTransactionById } from '@/lib/api';
import { TransactionDetail } from '@/lib/types';
import { formatCurrency, formatDate, getRiskLevel } from '@/lib/mockData';

function RiskBadge({ score }: { score: number }) {
  const level = getRiskLevel(score);
  const cfg = { HIGH:{ bg:'#FEE2E2',color:'#991B1B',label:'HIGH RISK' }, MEDIUM:{ bg:'#FEF3C7',color:'#92400E',label:'MEDIUM RISK' }, LOW:{ bg:'#D1FAE5',color:'#065F46',label:'LOW RISK' } }[level];
  return <span style={{ background:cfg.bg, color:cfg.color, borderRadius:6, padding:'4px 12px', fontSize:13, fontWeight:700 }}>{cfg.label} · {score}/100</span>;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string,{bg:string;color:string}> = { APPROVED:{bg:'#D1FAE5',color:'#065F46'}, REJECTED:{bg:'#FEE2E2',color:'#991B1B'}, MANUAL_REVIEW:{bg:'#DBEAFE',color:'#1E40AF'}, PENDING:{bg:'#FEF3C7',color:'#92400E'} };
  const s = map[status] ?? { bg:'#F3F4F6', color:'#6B7280' };
  return <span style={{ background:s.bg, color:s.color, borderRadius:6, padding:'4px 12px', fontSize:13, fontWeight:600 }}>{status.replace('_',' ')}</span>;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display:'flex', padding:'10px 0', borderBottom:'1px solid #F3F4F6' }}>
      <span style={{ width:220, fontSize:13, color:'#6B7280', fontWeight:500, flexShrink:0 }}>{label}</span>
      <span style={{ fontSize:13, color:'#1F2937', fontWeight:500 }}>{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background:'white', borderRadius:12, border:'1px solid #E5E7EB', boxShadow:'0 1px 3px rgba(0,0,0,0.05)', marginBottom:16 }}>
      <div style={{ padding:'16px 20px', borderBottom:'1px solid #F3F4F6' }}>
        <h3 style={{ fontSize:15, fontWeight:700, color:'#1F2937', margin:0 }}>{title}</h3>
      </div>
      <div style={{ padding:'4px 20px 16px' }}>{children}</div>
    </div>
  );
}

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [tx, setTx] = useState<TransactionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactionById(id).then(data => { setTx(data); setLoading(false); });
  }, [id]);

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:400 }}>
      <div style={{ width:40, height:40, border:'3px solid #E5E7EB', borderTopColor:'#4F46E5', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
    </div>
  );

  if (!tx) return (
    <div style={{ textAlign:'center', padding:80 }}>
      <span style={{ fontSize:48 }}>🔍</span>
      <h2 style={{ color:'#374151', marginTop:16 }}>Transaction Not Found</h2>
      <p style={{ color:'#9CA3AF' }}>No transaction with ID: {id}</p>
      <Link href="/dashboard/transactions" style={{ color:'#4F46E5', textDecoration:'none', fontWeight:500 }}>← Back to Transactions</Link>
    </div>
  );

  const canReview = tx.transactionStatus === 'MANUAL_REVIEW' || tx.transactionStatus === 'PENDING';

  return (
    <div style={{ animation:'fadeIn 0.3s ease', maxWidth:900 }}>
      {/* Breadcrumb */}
      <nav style={{ fontSize:12, color:'#9CA3AF', marginBottom:16 }}>
        <Link href="/dashboard" style={{ color:'#6B7280', textDecoration:'none' }}>Dashboard</Link>
        <span style={{ margin:'0 6px' }}>›</span>
        <Link href="/dashboard/transactions" style={{ color:'#6B7280', textDecoration:'none' }}>Transactions</Link>
        <span style={{ margin:'0 6px' }}>›</span>
        <span style={{ color:'#1F2937', fontFamily:'monospace' }}>{tx.transactionId}</span>
      </nav>

      {/* Header */}
      <div style={{ background:'white', borderRadius:12, border:'1px solid #E5E7EB', padding:24, marginBottom:16, boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:16 }}>
          <div>
            <h1 style={{ fontSize:22, fontWeight:700, color:'#1F2937', margin:'0 0 8px', fontFamily:'monospace' }}>{tx.transactionId}</h1>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              <RiskBadge score={tx.fraudScore} />
              <StatusBadge status={tx.transactionStatus} />
              <span style={{ background:'#F3F4F6', color:'#6B7280', borderRadius:6, padding:'4px 12px', fontSize:12 }}>
                ⚡ {tx.processingTimeMs}ms
              </span>
              <span style={{ background:'#F3F4F6', color:'#6B7280', borderRadius:6, padding:'4px 12px', fontSize:12 }}>
                🤖 Model {tx.modelVersion}
              </span>
            </div>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={() => router.back()} style={{ padding:'8px 16px', borderRadius:8, border:'1px solid #E5E7EB', background:'white', color:'#374151', cursor:'pointer', fontSize:13, fontWeight:500 }}>
              ← Back
            </button>
            {canReview && (
              <Link href={`/dashboard/transactions/${id}/review`} style={{ padding:'8px 20px', borderRadius:8, background:'#4F46E5', color:'white', textDecoration:'none', fontSize:13, fontWeight:600 }}>
                📋 Review Transaction
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Transaction Details */}
      <Section title="📄 Transaction Details">
        <InfoRow label="Transaction ID" value={<span style={{ fontFamily:'monospace', color:'#4F46E5' }}>{tx.transactionId}</span>} />
        <InfoRow label="Date & Time" value={formatDate(tx.createdAt)} />
        <InfoRow label="Amount" value={<span style={{ fontSize:16, fontWeight:700, color:'#1F2937' }}>{formatCurrency(tx.amount, tx.currency)}</span>} />
        <InfoRow label="User ID" value={<span style={{ fontFamily:'monospace' }}>{tx.userId}</span>} />
        <InfoRow label="User Email" value={tx.userEmail} />
        <InfoRow label="Merchant" value={`${tx.merchantName} (${tx.merchantCategory})`} />
        <InfoRow label="Card" value={`${tx.cardType} ····${tx.cardLast4}`} />
        <InfoRow label="Transaction Type" value={tx.transactionType} />
        <InfoRow label="Location" value={`${tx.location.city}, ${tx.location.country} · IP: ${tx.location.ipAddress}`} />
        <InfoRow label="Device" value={`${tx.deviceType} (${tx.deviceOs})`} />
      </Section>

      {/* Fraud Detection Result */}
      <Section title="🤖 Fraud Detection Analysis">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, margin:'12px 0 20px' }}>
          {[
            { label:'Risk Score', value:`${tx.fraudScore}/100`, color: tx.fraudScore>=70?'#EF4444':tx.fraudScore>=40?'#F59E0B':'#10B981' },
            { label:'Confidence', value:`${tx.fraudConfidence}%`, color:'#4F46E5' },
            { label:'ML Decision', value:tx.fraudPrediction, color: tx.fraudPrediction==='REJECT'?'#EF4444':'#10B981' },
          ].map(m => (
            <div key={m.label} style={{ background:'#F9FAFB', borderRadius:10, padding:16, textAlign:'center', border:`2px solid ${m.color}20` }}>
              <p style={{ fontSize:12, color:'#9CA3AF', margin:'0 0 6px', fontWeight:500 }}>{m.label}</p>
              <p style={{ fontSize:24, fontWeight:700, color:m.color, margin:0 }}>{m.value}</p>
            </div>
          ))}
        </div>

        {/* Risk Score Bar */}
        <div style={{ marginBottom:20 }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#9CA3AF', marginBottom:6 }}>
            <span>0</span><span>Risk Score</span><span>100</span>
          </div>
          <div style={{ height:10, background:'#F3F4F6', borderRadius:5, overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${tx.fraudScore}%`, background: tx.fraudScore>=70?'linear-gradient(90deg,#F59E0B,#EF4444)':tx.fraudScore>=40?'linear-gradient(90deg,#10B981,#F59E0B)':'#10B981', borderRadius:5, transition:'width 0.8s ease' }} />
          </div>
        </div>

        <h4 style={{ fontSize:14, fontWeight:600, color:'#374151', margin:'0 0 12px' }}>⚠️ Risk Factors</h4>
        {tx.fraudFactors.map((f, i) => (
          <div key={i} style={{ display:'flex', gap:14, padding:'12px 0', borderBottom:'1px solid #F3F4F6' }}>
            <div style={{ width:42, height:42, borderRadius:8, background:'#FEE2E2', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <span style={{ fontSize:18 }}>{i===0?'💰':i===1?'🏪':i===2?'🕐':'📍'}</span>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                <span style={{ fontSize:13, fontWeight:600, color:'#1F2937' }}>{f.factor.replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase())}</span>
                <span style={{ fontSize:12, fontWeight:600, color:'#EF4444', background:'#FEE2E2', borderRadius:4, padding:'2px 8px' }}>Weight: {(f.weight*100).toFixed(0)}%</span>
              </div>
              <p style={{ fontSize:12, color:'#6B7280', margin:0 }}>{f.explanation}</p>
              <div style={{ marginTop:6, height:4, background:'#F3F4F6', borderRadius:2 }}>
                <div style={{ height:'100%', width:`${f.weight*100}%`, background:'#EF4444', borderRadius:2 }} />
              </div>
            </div>
          </div>
        ))}
      </Section>

      {/* Manual Review Result (if reviewed) */}
      {tx.reviewedAt && (
        <Section title="✅ Manual Review Result">
          <InfoRow label="Final Decision" value={<StatusBadge status={tx.fraudFinalDecision ?? tx.transactionStatus} />} />
          <InfoRow label="Reviewed At" value={formatDate(tx.reviewedAt)} />
          {tx.manualReviewReason && <InfoRow label="Reason" value={tx.manualReviewReason} />}
          {tx.manualReviewNotes && <InfoRow label="Notes" value={tx.manualReviewNotes} />}
        </Section>
      )}

      {/* Audit History */}
      <Section title="📜 Audit History">
        <div style={{ position:'relative', paddingLeft:24 }}>
          <div style={{ position:'absolute', left:8, top:8, bottom:8, width:2, background:'#E5E7EB', borderRadius:1 }} />
          {tx.auditHistory.map((log, i) => (
            <div key={log.id} style={{ position:'relative', marginBottom:20 }}>
              <div style={{ position:'absolute', left:-20, top:4, width:10, height:10, borderRadius:'50%', background: i===0?'#4F46E5':'#E5E7EB', border:'2px solid white' }} />
              <div style={{ background:'#F9FAFB', borderRadius:8, padding:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                  <span style={{ fontSize:13, fontWeight:600, color:'#1F2937' }}>{log.actionType.replace(/_/g,' ')}</span>
                  <span style={{ fontSize:11, color:'#9CA3AF' }}>{formatDate(log.timestamp)}</span>
                </div>
                <p style={{ fontSize:12, color:'#6B7280', margin:'0 0 4px' }}>By: <strong>{log.actorId}</strong> ({log.actorRole})</p>
                {log.changeReason && <p style={{ fontSize:12, color:'#374151', margin:0 }}>📝 {log.changeReason}</p>}
                {log.newValue && <p style={{ fontSize:12, color:'#374151', margin:'4px 0 0' }}>→ {log.oldValue ?? '—'} <strong style={{ color:'#4F46E5' }}>→ {log.newValue}</strong></p>}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <style>{`
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
      `}</style>
    </div>
  );
}

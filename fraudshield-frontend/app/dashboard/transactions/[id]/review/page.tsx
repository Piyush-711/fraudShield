'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
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

  const [decision, setDecision] = useState<'APPROVED'|'REJECTED'|'MANUAL_REVIEW'|''>('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [contactCustomer, setContactCustomer] = useState(false);
  const [flagInvestigation, setFlagInvestigation] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  useEffect(() => {
    fetchTransactionById(id).then(data => { setTx(data); setLoading(false); });
  }, [id]);

  const canSubmit = decision && reason.length >= 10 && confirmed;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true); setError('');
    try {
      await submitManualReview(id, { decision: decision as any, reason, notes, contactCustomer, flagForInvestigation: flagInvestigation });
      setSubmitted(true);
      setTimeout(() => router.push('/dashboard/transactions'), 3000);
    } catch { setError('Failed to submit. Please try again.'); }
    finally { setSubmitting(false); }
  };

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:400 }}>
      <div style={{ width:40, height:40, border:'3px solid #E5E7EB', borderTopColor:'#4F46E5', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
    </div>
  );

  if (submitted) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:500 }}>
      <div style={{ textAlign:'center', background:'white', borderRadius:16, padding:48, boxShadow:'0 10px 40px rgba(0,0,0,0.1)', maxWidth:420 }}>
        <div style={{ width:72, height:72, borderRadius:'50%', background:'#D1FAE5', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', animation:'bounceIn 0.5s ease' }}>
          <span style={{ fontSize:36 }}>✅</span>
        </div>
        <h2 style={{ fontSize:22, fontWeight:700, color:'#1F2937', margin:'0 0 8px' }}>Review Submitted!</h2>
        <p style={{ color:'#6B7280', fontSize:14, margin:'0 0 8px' }}>Decision: <strong style={{ color: decision==='APPROVED'?'#10B981':'#EF4444' }}>{decision}</strong></p>
        <p style={{ color:'#6B7280', fontSize:14, margin:'0 0 24px' }}>Reason: {reason}</p>
        <p style={{ fontSize:13, color:'#9CA3AF' }}>Redirecting in 3 seconds...</p>
        <Link href="/dashboard/transactions" style={{ display:'inline-block', marginTop:12, padding:'10px 24px', background:'#4F46E5', color:'white', borderRadius:8, textDecoration:'none', fontWeight:600, fontSize:14 }}>
          Go Back Now
        </Link>
      </div>
    </div>
  );

  const decisionBtns = [
    { value:'APPROVED', label:'✅ Approve', desc:'Override ML and approve', color:'#10B981', bg:'#D1FAE5', selected:'#059669' },
    { value:'REJECTED', label:'❌ Reject', desc:'Confirm ML rejection', color:'#EF4444', bg:'#FEE2E2', selected:'#DC2626' },
    { value:'MANUAL_REVIEW', label:'⏸ Escalate', desc:'Send to fraud team', color:'#3B82F6', bg:'#DBEAFE', selected:'#2563EB' },
  ];

  const inputStyle = { width:'100%', padding:'10px 14px', borderRadius:8, border:'1px solid #D1D5DB', fontSize:14, outline:'none', boxSizing:'border-box' as const, fontFamily:'Inter,sans-serif' };

  return (
    <div style={{ animation:'fadeIn 0.3s ease', maxWidth:800 }}>
      <nav style={{ fontSize:12, color:'#9CA3AF', marginBottom:16 }}>
        <Link href="/dashboard" style={{ color:'#6B7280', textDecoration:'none' }}>Dashboard</Link>
        <span style={{ margin:'0 6px' }}>›</span>
        <Link href="/dashboard/transactions" style={{ color:'#6B7280', textDecoration:'none' }}>Transactions</Link>
        <span style={{ margin:'0 6px' }}>›</span>
        <Link href={`/dashboard/transactions/${id}`} style={{ color:'#6B7280', textDecoration:'none', fontFamily:'monospace' }}>{id}</Link>
        <span style={{ margin:'0 6px' }}>›</span>
        <span style={{ color:'#1F2937' }}>Review</span>
      </nav>

      <h1 style={{ fontSize:22, fontWeight:700, color:'#1F2937', margin:'0 0 20px' }}>📋 Manual Review</h1>

      {/* Transaction Summary */}
      <div style={{ background:'linear-gradient(135deg,#1e1b4b,#312e81)', borderRadius:12, padding:20, marginBottom:16, color:'white' }}>
        <p style={{ fontSize:12, opacity:0.7, margin:'0 0 8px', textTransform:'uppercase', letterSpacing:'0.05em' }}>Transaction Summary</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:16 }}>
          {[
            { label:'Transaction', value: tx?.transactionId ?? id, mono:true },
            { label:'Amount', value: tx ? formatCurrency(tx.amount) : '—' },
            { label:'Merchant', value: tx?.merchantName ?? '—' },
            { label:'ML Risk Score', value: `${tx?.fraudScore ?? 0}/100` },
            { label:'ML Decision', value: tx?.fraudPrediction ?? '—' },
            { label:'Current Status', value: tx?.transactionStatus?.replace('_',' ') ?? '—' },
          ].map(item => (
            <div key={item.label}>
              <p style={{ fontSize:11, opacity:0.6, margin:'0 0 2px' }}>{item.label}</p>
              <p style={{ fontSize:14, fontWeight:700, margin:0, fontFamily: item.mono?'monospace':'inherit' }}>{item.value}</p>
            </div>
          ))}
        </div>
        {tx?.fraudFactors && tx.fraudFactors.length > 0 && (
          <div style={{ marginTop:12, borderTop:'1px solid rgba(255,255,255,0.15)', paddingTop:12 }}>
            <p style={{ fontSize:11, opacity:0.6, margin:'0 0 6px' }}>TOP RISK FACTORS</p>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {tx.fraudFactors.slice(0,3).map((f,i) => (
                <span key={i} style={{ background:'rgba(255,255,255,0.15)', borderRadius:4, padding:'3px 10px', fontSize:12 }}>
                  {f.factor.replace(/_/g,' ')} ({(f.weight*100).toFixed(0)}%)
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && <div style={{ background:'#FEE2E2', border:'1px solid #FECACA', borderRadius:8, padding:'12px 16px', marginBottom:16, color:'#991B1B', fontSize:14 }}>✗ {error}</div>}

      {/* Decision */}
      <div style={{ background:'white', borderRadius:12, border:'1px solid #E5E7EB', padding:20, marginBottom:16 }}>
        <h3 style={{ fontSize:15, fontWeight:700, color:'#1F2937', margin:'0 0 16px' }}>Your Decision *</h3>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
          {decisionBtns.map(btn => (
            <button key={btn.value} onClick={() => setDecision(btn.value as any)}
              style={{ padding:16, borderRadius:10, border:`2px solid ${decision===btn.value?btn.color:'#E5E7EB'}`, background: decision===btn.value?btn.bg:'white', cursor:'pointer', textAlign:'center', transition:'all 0.15s' }}>
              <p style={{ fontSize:20, margin:'0 0 6px' }}>{btn.label.split(' ')[0]}</p>
              <p style={{ fontSize:13, fontWeight:700, color: decision===btn.value?btn.color:'#374151', margin:'0 0 2px' }}>{btn.label.slice(3)}</p>
              <p style={{ fontSize:11, color:'#9CA3AF', margin:0 }}>{btn.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Reason & Notes */}
      <div style={{ background:'white', borderRadius:12, border:'1px solid #E5E7EB', padding:20, marginBottom:16 }}>
        <h3 style={{ fontSize:15, fontWeight:700, color:'#1F2937', margin:'0 0 16px' }}>Review Details</h3>

        <div style={{ marginBottom:16 }}>
          <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 }}>Reason * <span style={{ color:'#9CA3AF', fontWeight:400 }}>(min. 10 characters)</span></label>
          <input type="text" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Verified by phone call with customer" style={{ ...inputStyle, border: reason && reason.length < 10 ? '2px solid #EF4444' : '1px solid #D1D5DB' }} />
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
            {reason.length < 10 && reason.length > 0 && <span style={{ fontSize:11, color:'#EF4444' }}>Minimum 10 characters required</span>}
            <span style={{ fontSize:11, color:'#9CA3AF', marginLeft:'auto' }}>{reason.length}/500</span>
          </div>
        </div>

        <div style={{ marginBottom:16 }}>
          <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 }}>Additional Notes <span style={{ color:'#9CA3AF', fontWeight:400 }}>(optional)</span></label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Any additional context or notes..." style={{ ...inputStyle, resize:'vertical' }} />
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {[
            { id:'confirm', checked:confirmed, set:setConfirmed, label:'✓ I confirm this is my final decision', required:true, color:'#4F46E5' },
            { id:'contact', checked:contactCustomer, set:setContactCustomer, label:'📞 Contact customer to verify transaction', required:false, color:'#6B7280' },
            { id:'flag', checked:flagInvestigation, set:setFlagInvestigation, label:'🚩 Flag for fraud investigation team', required:false, color:'#6B7280' },
          ].map(opt => (
            <label key={opt.id} style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
              <input type="checkbox" id={opt.id} checked={opt.checked} onChange={e => opt.set(e.target.checked)}
                style={{ width:18, height:18, accentColor:'#4F46E5', cursor:'pointer' }} />
              <span style={{ fontSize:13, color: opt.checked ? opt.color : '#6B7280', fontWeight: opt.checked ? 600 : 400 }}>{opt.label}</span>
              {opt.required && <span style={{ fontSize:11, color:'#EF4444' }}>*</span>}
            </label>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display:'flex', gap:12, alignItems:'center' }}>
        <button onClick={handleSubmit} disabled={!canSubmit || submitting}
          style={{ padding:'12px 28px', borderRadius:8, border:'none', background: canSubmit?'linear-gradient(135deg,#4F46E5,#7C3AED)':'#D1D5DB', color:'white', fontSize:14, fontWeight:600, cursor: canSubmit?'pointer':'not-allowed', display:'flex', alignItems:'center', gap:8, transition:'all 0.2s' }}>
          {submitting ? <><span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', display:'inline-block', animation:'spin 1s linear infinite' }} />Submitting...</> : '✓ Submit Review'}
        </button>
        <button onClick={() => setShowCancel(true)} style={{ padding:'12px 20px', borderRadius:8, border:'1px solid #E5E7EB', background:'white', color:'#6B7280', fontSize:14, cursor:'pointer', fontWeight:500 }}>
          Cancel
        </button>
        <button onClick={() => { alert('Draft saved!'); }} style={{ padding:'12px 20px', borderRadius:8, border:'1px solid #4F46E5', background:'#EEF2FF', color:'#4F46E5', fontSize:14, cursor:'pointer', fontWeight:500 }}>
          💾 Save Draft
        </button>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancel && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999 }}>
          <div style={{ background:'white', borderRadius:16, padding:32, maxWidth:380, width:'90%', boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize:18, fontWeight:700, color:'#1F2937', margin:'0 0 8px' }}>Discard Review?</h3>
            <p style={{ fontSize:14, color:'#6B7280', margin:'0 0 24px' }}>Are you sure? Your review will not be saved.</p>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => router.push(`/dashboard/transactions/${id}`)} style={{ flex:1, padding:'10px', borderRadius:8, background:'#EF4444', color:'white', border:'none', cursor:'pointer', fontWeight:600, fontSize:13 }}>
                Yes, Discard
              </button>
              <button onClick={() => setShowCancel(false)} style={{ flex:1, padding:'10px', borderRadius:8, background:'#F3F4F6', color:'#374151', border:'none', cursor:'pointer', fontWeight:600, fontSize:13 }}>
                No, Stay
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes bounceIn { 0%{transform:scale(0);opacity:0} 60%{transform:scale(1.2)} 100%{transform:scale(1);opacity:1} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
      `}</style>
    </div>
  );
}

'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchSettings, saveSettings } from '@/lib/api';
import { SystemSettings } from '@/lib/types';

function Section({ title, subtitle, children }: { title:string; subtitle?:string; children:React.ReactNode }) {
  return (
    <div style={{ background:'white', borderRadius:12, border:'1px solid #E5E7EB', padding:24, marginBottom:16, boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
      <div style={{ marginBottom:20, borderBottom:'1px solid #F3F4F6', paddingBottom:14 }}>
        <h3 style={{ fontSize:16, fontWeight:700, color:'#1F2937', margin:'0 0 2px' }}>{title}</h3>
        {subtitle && <p style={{ fontSize:13, color:'#9CA3AF', margin:0 }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function SliderField({ label, desc, value, min, max, step=1, onChange, color='#4F46E5', unit='' }: {
  label:string; desc?:string; value:number; min:number; max:number; step?:number; onChange:(v:number)=>void; color?:string; unit?:string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom:20 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:4 }}>
        <label style={{ fontSize:13, fontWeight:600, color:'#374151' }}>{label}</label>
        <span style={{ fontSize:18, fontWeight:700, color, background:color+'15', borderRadius:6, padding:'2px 12px' }}>{value}{unit}</span>
      </div>
      {desc && <p style={{ fontSize:12, color:'#9CA3AF', margin:'0 0 8px' }}>{desc}</p>}
      <div style={{ position:'relative', height:8 }}>
        <div style={{ position:'absolute', inset:0, borderRadius:4, background:'#F3F4F6' }} />
        <div style={{ position:'absolute', left:0, top:0, bottom:0, width:`${pct}%`, borderRadius:4, background:`linear-gradient(90deg,${color}88,${color})`, transition:'width 0.2s' }} />
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{ position:'absolute', inset:0, opacity:0, cursor:'pointer', width:'100%', height:'100%' }}
        />
        <div style={{ position:'absolute', top:'50%', left:`${pct}%`, transform:'translate(-50%,-50%)', width:18, height:18, borderRadius:'50%', background:'white', border:`3px solid ${color}`, boxShadow:'0 2px 6px rgba(0,0,0,0.15)', pointerEvents:'none', transition:'left 0.2s' }} />
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
        <span style={{ fontSize:11, color:'#D1D5DB' }}>{min}{unit}</span>
        <span style={{ fontSize:11, color:'#D1D5DB' }}>{max}{unit}</span>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked:boolean; onChange:(v:boolean)=>void }) {
  return (
    <div onClick={()=>onChange(!checked)} style={{ width:48, height:26, borderRadius:13, background: checked?'#4F46E5':'#D1D5DB', cursor:'pointer', position:'relative', transition:'background 0.2s', flexShrink:0 }}>
      <div style={{ position:'absolute', top:3, left: checked?22:3, width:20, height:20, borderRadius:'50%', background:'white', boxShadow:'0 2px 4px rgba(0,0,0,0.2)', transition:'left 0.2s' }} />
    </div>
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
    fetchSettings().then(s => { setSettings(s); setOriginal(JSON.parse(JSON.stringify(s))); setLoading(false); });
  }, []);

  const update = <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) => {
    setSettings(s => s ? { ...s, [key]: value } : s);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true); setShowConfirm(false);
    await saveSettings(settings);
    setOriginal(JSON.parse(JSON.stringify(settings)));
    setSaving(false); setSaved(true); setHasChanges(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => { if (original) { setSettings(JSON.parse(JSON.stringify(original))); setHasChanges(false); } };

  if (loading || !settings) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:400 }}>
      <div style={{ width:40, height:40, border:'3px solid #E5E7EB', borderTopColor:'#4F46E5', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ animation:'fadeIn 0.3s ease', maxWidth:800 }}>
      <div style={{ marginBottom:24 }}>
        <nav style={{ fontSize:12, color:'#9CA3AF', marginBottom:8 }}>
          <Link href="/dashboard" style={{ color:'#6B7280', textDecoration:'none' }}>Dashboard</Link>
          <span style={{ margin:'0 6px' }}>›</span>
          <span style={{ color:'#1F2937' }}>Admin</span>
          <span style={{ margin:'0 6px' }}>›</span>
          <span style={{ color:'#1F2937' }}>Settings</span>
        </nav>
        <h1 style={{ fontSize:24, fontWeight:700, color:'#1F2937', margin:'0 0 4px' }}>⚙️ System Settings</h1>
        <p style={{ fontSize:13, color:'#9CA3AF', margin:0 }}>Configure fraud detection thresholds and system behaviour</p>
      </div>

      {saved && (
        <div style={{ background:'#D1FAE5', border:'1px solid #6EE7B7', borderRadius:10, padding:'12px 20px', marginBottom:16, color:'#065F46', fontWeight:600, fontSize:14, animation:'slideDown 0.3s ease' }}>
          ✅ Settings saved successfully!
        </div>
      )}

      {hasChanges && (
        <div style={{ background:'#FEF3C7', border:'1px solid #FCD34D', borderRadius:10, padding:'12px 20px', marginBottom:16, color:'#92400E', fontWeight:500, fontSize:14, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span>⚠️ You have unsaved changes</span>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={handleReset} style={{ padding:'6px 14px', borderRadius:6, background:'white', border:'1px solid #D1D5DB', cursor:'pointer', fontSize:13, color:'#374151' }}>Reset</button>
            <button onClick={() => setShowConfirm(true)} style={{ padding:'6px 14px', borderRadius:6, background:'#F59E0B', border:'none', cursor:'pointer', fontSize:13, color:'white', fontWeight:600 }}>Save Now</button>
          </div>
        </div>
      )}

      {/* Fraud Detection Thresholds */}
      <Section title="🎯 Fraud Detection Thresholds" subtitle="Configure ML model decision boundaries (0–100 risk score)">
        <div style={{ background:'#F9FAFB', borderRadius:8, padding:'12px 16px', marginBottom:20, fontSize:13, color:'#374151' }}>
          <strong>Score Ranges:</strong> &nbsp;
          <span style={{ color:'#10B981' }}>0–{settings.autoApprovalThreshold} Auto-Approve</span> &nbsp;·&nbsp;
          <span style={{ color:'#F59E0B' }}>{settings.autoApprovalThreshold}–{settings.manualReviewThreshold} Manual Review</span> &nbsp;·&nbsp;
          <span style={{ color:'#EF4444' }}>{settings.manualReviewThreshold}–{settings.autoRejectionThreshold} High Risk</span> &nbsp;·&nbsp;
          <span style={{ color:'#991B1B' }}>{settings.autoRejectionThreshold}–100 Auto-Reject</span>
        </div>
        <SliderField label="Auto-Approval Threshold" desc="Transactions below this score are auto-approved" value={settings.autoApprovalThreshold} min={5} max={40} onChange={v => update('autoApprovalThreshold', v)} color="#10B981" />
        <SliderField label="Manual Review Threshold" desc="Transactions above this score require analyst review" value={settings.manualReviewThreshold} min={40} max={90} onChange={v => update('manualReviewThreshold', v)} color="#F59E0B" />
        <SliderField label="Auto-Rejection Threshold" desc="Transactions above this score are auto-rejected" value={settings.autoRejectionThreshold} min={70} max={99} onChange={v => update('autoRejectionThreshold', v)} color="#EF4444" />
      </Section>

      {/* Rate Limiting */}
      <Section title="🚦 Rate Limiting" subtitle="Transaction throughput controls">
        <SliderField label="Max Transactions / Minute (Global)" value={settings.maxTransactionsPerMinute} min={1000} max={20000} step={500} onChange={v => update('maxTransactionsPerMinute', v)} unit="" />
        <SliderField label="Max Transactions / User / Hour" value={settings.maxTransactionsPerUserHour} min={100} max={5000} step={100} onChange={v => update('maxTransactionsPerUserHour', v)} unit="" />
        <SliderField label="Transaction Timeout" desc="Maximum processing time before timeout" value={settings.transactionTimeoutMs} min={100} max={1000} step={50} onChange={v => update('transactionTimeoutMs', v)} unit="ms" color="#F59E0B" />
      </Section>

      {/* Infrastructure */}
      <Section title="🔧 Infrastructure" subtitle="Kafka, Redis and processing configuration">
        <SliderField label="Kafka Consumer Threads" value={settings.kafkaConsumerThreads} min={1} max={10} onChange={v => update('kafkaConsumerThreads', v)} color="#7C3AED" />
        <SliderField label="Redis Cache TTL" value={settings.redisCacheTtlHours} min={1} max={24} onChange={v => update('redisCacheTtlHours', v)} unit="h" color="#7C3AED" />
      </Section>

      {/* Notifications */}
      <Section title="🔔 Notifications" subtitle="Alert and notification configuration">
        {[
          { key:'emailNotificationsEnabled' as const, label:'📧 Email Notifications', desc:'Send fraud alerts via email' },
          { key:'slackNotificationsEnabled' as const, label:'💬 Slack Notifications', desc:'Send fraud alerts to Slack channel' },
        ].map(item => (
          <div key={item.key} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid #F3F4F6' }}>
            <div>
              <p style={{ fontSize:14, fontWeight:600, color:'#1F2937', margin:'0 0 2px' }}>{item.label}</p>
              <p style={{ fontSize:12, color:'#9CA3AF', margin:0 }}>{item.desc}</p>
            </div>
            <Toggle checked={settings[item.key] as boolean} onChange={v => update(item.key, v)} />
          </div>
        ))}
        <div style={{ marginTop:16 }}>
          <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 }}>Minimum Alert Severity</label>
          <select value={settings.alertSeverityThreshold} onChange={e => update('alertSeverityThreshold', e.target.value)}
            style={{ padding:'10px 12px', borderRadius:8, border:'1px solid #D1D5DB', fontSize:14, background:'white', outline:'none', width:'100%' }}>
            <option value="LOW">Low & above</option>
            <option value="MEDIUM">Medium & above</option>
            <option value="HIGH">High & above</option>
            <option value="CRITICAL">Critical only</option>
          </select>
        </div>
      </Section>

      {/* Action Buttons */}
      <div style={{ display:'flex', gap:12 }}>
        <button onClick={() => setShowConfirm(true)} disabled={saving || !hasChanges}
          style={{ padding:'12px 28px', borderRadius:8, border:'none', background: hasChanges?'linear-gradient(135deg,#4F46E5,#7C3AED)':'#D1D5DB', color:'white', fontSize:14, fontWeight:600, cursor: hasChanges?'pointer':'not-allowed', display:'flex', alignItems:'center', gap:8 }}>
          {saving ? <><span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', display:'inline-block', animation:'spin 1s linear infinite' }} />Saving...</> : '💾 Save Changes'}
        </button>
        <button onClick={handleReset} disabled={!hasChanges} style={{ padding:'12px 20px', borderRadius:8, border:'1px solid #E5E7EB', background:'white', color: hasChanges?'#374151':'#D1D5DB', fontSize:14, cursor: hasChanges?'pointer':'not-allowed' }}>
          ↺ Reset
        </button>
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999 }}>
          <div style={{ background:'white', borderRadius:16, padding:32, maxWidth:420, width:'90%', boxShadow:'0 20px 60px rgba(0,0,0,0.2)', animation:'bounceIn 0.3s ease' }}>
            <div style={{ fontSize:48, textAlign:'center', marginBottom:16 }}>⚠️</div>
            <h3 style={{ fontSize:18, fontWeight:700, color:'#1F2937', margin:'0 0 8px', textAlign:'center' }}>Save Configuration?</h3>
            <p style={{ fontSize:14, color:'#6B7280', margin:'0 0 24px', textAlign:'center' }}>These settings affect live transaction processing. Changes take effect immediately.</p>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={handleSave} style={{ flex:1, padding:'12px', borderRadius:8, background:'#4F46E5', color:'white', border:'none', cursor:'pointer', fontWeight:700, fontSize:14 }}>✓ Confirm Save</button>
              <button onClick={() => setShowConfirm(false)} style={{ flex:1, padding:'12px', borderRadius:8, background:'#F3F4F6', color:'#374151', border:'none', cursor:'pointer', fontWeight:600, fontSize:14 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}
        @keyframes bounceIn{0%{transform:scale(0.8);opacity:0}60%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
      `}</style>
    </div>
  );
}

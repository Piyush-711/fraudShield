'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [passErr, setPassErr] = useState('');

  useEffect(() => {
    if (localStorage.getItem('fraudshield_token')) router.push('/dashboard');
  }, [router]);

  const validate = () => {
    let ok = true;
    if (!email) { setEmailErr('Email is required'); ok = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailErr('Please enter a valid email'); ok = false; }
    else setEmailErr('');
    if (!password) { setPassErr('Password is required'); ok = false; }
    else setPassErr('');
    return ok;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await login({ email, password });
      localStorage.setItem('fraudshield_token', res.token);
      localStorage.setItem('fraudshield_user', JSON.stringify(res.user));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'linear-gradient(135deg,#1e1b4b 0%,#312e81 40%,#4338ca 100%)' }}>
      {/* Left decorative panel */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'48px', color:'white' }} className="hide-mobile">
        <div style={{ maxWidth:480 }}>
          <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:48 }}>
            <div style={{ width:56, height:56, borderRadius:16, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28 }}>🛡️</div>
            <div>
              <h1 style={{ fontSize:28, fontWeight:700, margin:0 }}>FraudShield</h1>
              <p style={{ fontSize:14, opacity:0.7, margin:0 }}>AI-Powered Fraud Detection</p>
            </div>
          </div>
          <h2 style={{ fontSize:36, fontWeight:700, lineHeight:1.2, marginBottom:24 }}>Protect your customers with real-time AI</h2>
          <p style={{ fontSize:16, opacity:0.8, lineHeight:1.6, marginBottom:40 }}>Detect &gt;95% of fraudulent transactions in under 200ms using cutting-edge machine learning models.</p>
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {[
              { icon:'⚡', text:'&lt;200ms real-time detection' },
              { icon:'🎯', text:'&gt;95% fraud detection rate' },
              { icon:'✅', text:'&lt;1% false positive rate' },
              { icon:'📊', text:'10,000 TPS throughput' },
            ].map((item, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12, background:'rgba(255,255,255,0.08)', borderRadius:12, padding:'12px 16px' }}>
                <span style={{ fontSize:20 }}>{item.icon}</span>
                <span style={{ opacity:0.9, fontSize:14 }} dangerouslySetInnerHTML={{ __html: item.text }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right login form */}
      <div style={{ width:'100%', maxWidth:480, display:'flex', alignItems:'center', justifyContent:'center', padding:'32px', background:'white', minHeight:'100vh' }}>
        <div style={{ width:'100%', maxWidth:400 }}>
          {/* Logo (mobile) */}
          <div style={{ textAlign:'center', marginBottom:40 }}>
            <div style={{ width:64, height:64, borderRadius:18, background:'linear-gradient(135deg,#4F46E5,#7C3AED)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, margin:'0 auto 16px' }}>🛡️</div>
            <h2 style={{ fontSize:24, fontWeight:700, color:'#1F2937', margin:'0 0 4px' }}>Welcome back</h2>
            <p style={{ fontSize:14, color:'#6B7280', margin:0 }}>Sign in to your FraudShield account</p>
          </div>

          {/* Demo credentials hint */}
          <div style={{ background:'#EEF2FF', border:'1px solid #C7D2FE', borderRadius:8, padding:'12px 16px', marginBottom:24, fontSize:13 }}>
            <p style={{ fontWeight:600, color:'#4338CA', margin:'0 0 4px' }}>Demo Credentials</p>
            <p style={{ color:'#4338CA', margin:0 }}>📧 admin@fraudshield.com</p>
            <p style={{ color:'#4338CA', margin:0 }}>🔑 admin123</p>
          </div>

          {/* Error banner */}
          {error && (
            <div style={{ background:'#FEE2E2', border:'1px solid #FECACA', borderRadius:8, padding:'12px 16px', marginBottom:20, display:'flex', alignItems:'center', gap:8, fontSize:14, color:'#991B1B' }}>
              <span>✗</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom:20 }}>
              <label style={{ display:'block', fontSize:14, fontWeight:500, color:'#374151', marginBottom:6 }}>Email address</label>
              <input
                id="email-input"
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setEmailErr(''); }}
                placeholder="you@bank.com"
                style={{
                  width:'100%', padding:'11px 14px', borderRadius:8, fontSize:14,
                  border: emailErr ? '2px solid #EF4444' : '1px solid #D1D5DB',
                  outline:'none', background: emailErr ? '#FEF2F2' : 'white',
                  transition:'border 0.15s', boxSizing:'border-box',
                }}
              />
              {emailErr && <p style={{ color:'#EF4444', fontSize:12, marginTop:4 }}>{emailErr}</p>}
            </div>

            {/* Password */}
            <div style={{ marginBottom:28 }}>
              <label style={{ display:'block', fontSize:14, fontWeight:500, color:'#374151', marginBottom:6 }}>Password</label>
              <input
                id="password-input"
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setPassErr(''); }}
                placeholder="••••••••"
                style={{
                  width:'100%', padding:'11px 14px', borderRadius:8, fontSize:14,
                  border: passErr ? '2px solid #EF4444' : '1px solid #D1D5DB',
                  outline:'none', background: passErr ? '#FEF2F2' : 'white',
                  transition:'border 0.15s', boxSizing:'border-box',
                }}
              />
              {passErr && <p style={{ color:'#EF4444', fontSize:12, marginTop:4 }}>{passErr}</p>}
            </div>

            {/* Submit */}
            <button
              id="login-btn"
              type="submit"
              disabled={loading}
              style={{
                width:'100%', padding:'12px', borderRadius:8, border:'none',
                background: loading ? '#9CA3AF' : 'linear-gradient(135deg,#4F46E5,#7C3AED)',
                color:'white', fontSize:15, fontWeight:600, cursor: loading ? 'not-allowed' : 'pointer',
                transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              }}
            >
              {loading ? (
                <>
                  <span style={{ width:18, height:18, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', display:'inline-block', animation:'spin 1s linear infinite' }} />
                  Authenticating...
                </>
              ) : 'Sign in →'}
            </button>
          </form>

          <p style={{ textAlign:'center', fontSize:13, color:'#9CA3AF', marginTop:32 }}>
            © 2026 FraudShield. All rights reserved.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) { .hide-mobile { display: none !important; } }
      `}</style>
    </div>
  );
}

'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem('fraudshield_token');
    if (token) router.push('/dashboard');
    else router.push('/auth/login');
  }, [router]);

  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#F9FAFB' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:48, height:48, borderRadius:'50%', border:'4px solid #4F46E5', borderTopColor:'transparent', animation:'spin 1s linear infinite', margin:'0 auto 16px' }} />
        <p style={{ color:'#6B7280', fontFamily:'Inter,sans-serif' }}>Loading FraudShield...</p>
      </div>
    </div>
  );
}

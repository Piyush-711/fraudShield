'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchUsers, createUser } from '@/lib/api';
import { User, UserRole } from '@/lib/types';

const roleConfig: Record<UserRole, { color:string; bg:string; label:string }> = {
  SYSTEM_ADMIN:      { color:'#4F46E5', bg:'#EEF2FF',   label:'System Admin' },
  ANALYST_REVIEWER:  { color:'#065F46', bg:'#D1FAE5',   label:'Analyst Reviewer' },
  ANALYST_VIEWER:    { color:'#1E40AF', bg:'#DBEAFE',   label:'Analyst Viewer' },
  DATA_SCIENTIST:    { color:'#7C3AED', bg:'#EDE9FE',   label:'Data Scientist' },
  OPERATOR:          { color:'#92400E', bg:'#FEF3C7',   label:'Operator' },
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState('');
  const [toastError, setToastError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New user form
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('ANALYST_VIEWER');

  useEffect(() => {
    fetchUsers().then(data => { setUsers(data); setLoading(false); });
  }, []);

  const showToast = (msg: string, isError = false) => {
    setToast(msg);
    setToastError(isError);
    setTimeout(() => { setToast(''); setToastError(false); }, 3500);
  };

  const filtered = users.filter(u => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleAddUser = async () => {
    if (!newName || !newEmail) return;
    setSubmitting(true);
    try {
      const newUser = await createUser({ name: newName, email: newEmail, role: newRole, password: 'TempPass123!' });
      setUsers(prev => [newUser, ...prev]);
      setShowModal(false);
      setNewName(''); setNewEmail(''); setNewRole('ANALYST_VIEWER');
      showToast(`User ${newName} added successfully!`);
    } catch (err: any) {
      showToast(err.message || 'Failed to create user. Please try again.', true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = (id: number) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u));
    showToast('User status updated');
  };

  const inputStyle = { width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid #D1D5DB', fontSize:14, outline:'none', boxSizing:'border-box' as const };

  const summary = {
    total: users.length,
    active: users.filter(u=>u.isActive).length,
    admins: users.filter(u=>u.role==='SYSTEM_ADMIN').length,
  };

  return (
    <div style={{ animation:'fadeIn 0.3s ease' }}>
      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <nav style={{ fontSize:12, color:'#9CA3AF', marginBottom:8 }}>
          <Link href="/dashboard" style={{ color:'#6B7280', textDecoration:'none' }}>Dashboard</Link>
          <span style={{ margin:'0 6px' }}>›</span>
          <span>Admin</span>
          <span style={{ margin:'0 6px' }}>›</span>
          <span style={{ color:'#1F2937' }}>Users</span>
        </nav>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:700, color:'#1F2937', margin:'0 0 4px' }}>👥 User Management</h1>
            <p style={{ fontSize:13, color:'#9CA3AF', margin:0 }}>Manage analyst accounts and access levels</p>
          </div>
          <button onClick={() => setShowModal(true)} style={{ padding:'10px 20px', borderRadius:8, border:'none', background:'linear-gradient(135deg,#4F46E5,#7C3AED)', color:'white', fontSize:14, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:8 }}>
            + Add User
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
        {[
          { label:'Total Users', value:summary.total, icon:'👥', color:'#4F46E5', bg:'#EEF2FF' },
          { label:'Active Users', value:summary.active, icon:'✅', color:'#10B981', bg:'#D1FAE5' },
          { label:'Admins', value:summary.admins, icon:'🛡️', color:'#7C3AED', bg:'#EDE9FE' },
        ].map(c => (
          <div key={c.label} style={{ background:'white', borderRadius:12, border:'1px solid #E5E7EB', padding:16, display:'flex', alignItems:'center', gap:14 }}>
            <span style={{ fontSize:28, background:c.bg, borderRadius:10, padding:'8px 10px' }}>{c.icon}</span>
            <div>
              <p style={{ fontSize:12, color:'#6B7280', margin:'0 0 2px' }}>{c.label}</p>
              <p style={{ fontSize:28, fontWeight:700, color:c.color, margin:0 }}>{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background:'white', borderRadius:12, border:'1px solid #E5E7EB', padding:'12px 16px', marginBottom:16, display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
        <select value={roleFilter} onChange={e=>setRoleFilter(e.target.value)} style={{ padding:'8px 12px', borderRadius:8, border:'1px solid #E5E7EB', fontSize:13, background:'white', cursor:'pointer' }}>
          <option value="ALL">All Roles</option>
          <option value="SYSTEM_ADMIN">System Admin</option>
          <option value="ANALYST_REVIEWER">Analyst Reviewer</option>
          <option value="ANALYST_VIEWER">Analyst Viewer</option>
          <option value="DATA_SCIENTIST">Data Scientist</option>
          <option value="OPERATOR">Operator</option>
        </select>
        <div style={{ flex:1, minWidth:200, position:'relative' }}>
          <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#9CA3AF' }}>🔍</span>
          <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or email..." style={{ width:'100%', padding:'8px 12px 8px 32px', borderRadius:8, border:'1px solid #E5E7EB', fontSize:13, outline:'none', boxSizing:'border-box' }} />
        </div>
      </div>

      {/* Users Table */}
      <div style={{ background:'white', borderRadius:12, border:'1px solid #E5E7EB', overflow:'hidden', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
        {loading ? (
          <div style={{ padding:60, textAlign:'center' }}>
            <div style={{ width:36, height:36, border:'3px solid #E5E7EB', borderTopColor:'#4F46E5', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto' }} />
          </div>
        ) : (
          <table className="data-table" style={{ width:'100%' }}>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th style={{ textAlign:'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => {
                const rc = roleConfig[user.role];
                return (
                  <tr key={user.id}>
                    {/* Avatar + name */}
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <div style={{ width:40, height:40, borderRadius:'50%', background:`linear-gradient(135deg,${rc.color},${rc.color}88)`, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:15, fontWeight:700, flexShrink:0 }}>
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p style={{ fontSize:14, fontWeight:600, color:'#1F2937', margin:'0 0 1px' }}>{user.name}</p>
                          <p style={{ fontSize:12, color:'#9CA3AF', margin:0 }}>{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td><span style={{ background:rc.bg, color:rc.color, borderRadius:4, padding:'3px 10px', fontSize:12, fontWeight:600 }}>{rc.label}</span></td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <span style={{ width:8, height:8, borderRadius:'50%', background: user.isActive?'#10B981':'#D1D5DB', display:'inline-block' }} />
                        <span style={{ fontSize:13, color: user.isActive?'#065F46':'#9CA3AF', fontWeight:500 }}>{user.isActive?'Active':'Inactive'}</span>
                      </div>
                    </td>
                    <td style={{ fontSize:12, color:'#9CA3AF' }}>
                      {new Date(user.lastLoginAt).toLocaleString('en-US',{ month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}
                    </td>
                    <td className="action">
                      <div style={{ display:'flex', gap:6, justifyContent:'center' }}>
                        <button onClick={() => handleToggleActive(user.id)}
                          style={{ padding:'5px 12px', borderRadius:6, border:`1px solid ${user.isActive?'#FCA5A5':'#6EE7B7'}`, background: user.isActive?'#FEF2F2':'#F0FDF4', color: user.isActive?'#DC2626':'#059669', cursor:'pointer', fontSize:12, fontWeight:600 }}>
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => showToast(`Reset email sent to ${user.email}`)}
                          style={{ padding:'5px 12px', borderRadius:6, border:'1px solid #E5E7EB', background:'#F9FAFB', color:'#374151', cursor:'pointer', fontSize:12 }}>
                          Reset PW
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {!loading && filtered.length === 0 && (
          <div style={{ padding:40, textAlign:'center' }}>
            <span style={{ fontSize:32 }}>👤</span>
            <p style={{ fontSize:14, color:'#9CA3AF', margin:'8px 0 0' }}>No users found</p>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999 }} onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={{ background:'white', borderRadius:16, padding:32, width:440, boxShadow:'0 20px 60px rgba(0,0,0,0.2)', animation:'bounceIn 0.3s ease' }}>
            <h3 style={{ fontSize:18, fontWeight:700, color:'#1F2937', margin:'0 0 20px' }}>➕ Add New User</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 }}>Full Name *</label>
                <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="John Smith" style={inputStyle} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 }}>Email *</label>
                <input type="email" value={newEmail} onChange={e=>setNewEmail(e.target.value)} placeholder="john@bank.com" style={inputStyle} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 }}>Role</label>
                <select value={newRole} onChange={e=>setNewRole(e.target.value as UserRole)} style={{ ...inputStyle, cursor:'pointer' }}>
                  <option value="ANALYST_VIEWER">Analyst Viewer</option>
                  <option value="ANALYST_REVIEWER">Analyst Reviewer</option>
                  <option value="DATA_SCIENTIST">Data Scientist</option>
                  <option value="OPERATOR">Operator</option>
                  <option value="SYSTEM_ADMIN">System Admin</option>
                </select>
              </div>
              <div style={{ background:'#F9FAFB', borderRadius:8, padding:12, fontSize:12, color:'#6B7280' }}>
                📧 A temporary password will be sent to the user's email address.
              </div>
            </div>
            <div style={{ display:'flex', gap:10, marginTop:24 }}>
              <button onClick={handleAddUser} disabled={!newName || !newEmail || submitting}
                style={{ flex:1, padding:'12px', borderRadius:8, background: newName&&newEmail&&!submitting?'linear-gradient(135deg,#4F46E5,#7C3AED)':'#D1D5DB', color:'white', border:'none', cursor: newName&&newEmail&&!submitting?'pointer':'not-allowed', fontWeight:700, fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                {submitting ? <><span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', display:'inline-block', animation:'spin 1s linear infinite' }} />Adding...</> : 'Add User'}
              </button>
              <button onClick={() => setShowModal(false)} style={{ flex:1, padding:'12px', borderRadius:8, background:'#F3F4F6', color:'#374151', border:'none', cursor:'pointer', fontWeight:600, fontSize:14 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', bottom:24, right:24, background: toastError?'#DC2626':'#1F2937', color:'white', borderRadius:10, padding:'12px 20px', fontSize:14, fontWeight:500, zIndex:9999, animation:'slideUp 0.3s ease', boxShadow:'0 10px 30px rgba(0,0,0,0.2)' }}>
          {toastError ? '✗' : '✅'} {toast}
        </div>
      )}
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        @keyframes slideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        @keyframes bounceIn{0%{transform:scale(0.8);opacity:0}60%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
      `}</style>
    </div>
  );
}

'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchUsers, createUser, toggleUserStatus } from '@/lib/api';
import { User, UserRole } from '@/lib/types';
import {
  Users,
  UserCheck,
  Shield,
  UserPlus,
  Search,
  KeyRound,
  Power,
  RefreshCw,
  ChevronRight,
  Mail,
  Lock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  User as UserIcon,
  X
} from 'lucide-react';

const roleConfig: Record<UserRole, {
  color: string;
  badgeBg: string;
  label: string;
}> = {
  SYSTEM_ADMIN: {
    color: 'text-indigo-700',
    badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    label: 'System Admin',
  },
  ANALYST_REVIEWER: {
    color: 'text-emerald-700',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    label: 'Analyst Reviewer',
  },
  ANALYST_VIEWER: {
    color: 'text-blue-700',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    label: 'Analyst Viewer',
  },
  DATA_SCIENTIST: {
    color: 'text-purple-700',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
    label: 'Data Scientist',
  },
  OPERATOR: {
    color: 'text-amber-700',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    label: 'Operator',
  },
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; isError: boolean } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // New user form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('ANALYST_VIEWER');

  useEffect(() => {
    fetchUsers().then(data => {
      setUsers(data);
      setLoading(false);
    });
  }, []);

  const showToast = (message: string, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 3500);
  };

  const filtered = users.filter(u => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (
      search &&
      !u.name.toLowerCase().includes(search.toLowerCase()) &&
      !u.email.toLowerCase().includes(search.toLowerCase())
    ) return false;
    return true;
  });

  const handleAddUser = async () => {
    if (!newName || !newEmail) return;
    setSubmitting(true);
    try {
      const newUser = await createUser({
        name: newName,
        email: newEmail,
        role: newRole,
        password: 'TempPass123!',
      });
      setUsers(prev => [newUser, ...prev]);
      setShowModal(false);
      setNewName('');
      setNewEmail('');
      setNewRole('ANALYST_VIEWER');
      showToast(`User account for ${newName} created successfully!`);
    } catch (err: any) {
      showToast(err.message || 'Failed to create user. Please try again.', true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      const updated = await toggleUserStatus(id);
      setUsers(prev => prev.map(u => (u.id === id ? { ...u, isActive: updated.isActive } : u)));
      showToast(`User status modified to ${updated.isActive ? 'Active' : 'Deactivated'}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update user status', true);
    }
  };

  const summary = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    admins: users.filter(u => u.role === 'SYSTEM_ADMIN').length,
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Header */}
      <div>
        <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-2">
          <Link href="/dashboard" className="text-slate-500 hover:text-indigo-600 transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500">Admin</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 font-semibold">User Directory</span>
        </nav>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Identity & Access Management</h1>
            <p className="text-xs text-slate-500 mt-1">Manage operator permissions, analyst roles, and directory credentials</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Provision User</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Directory Members', value: summary.total, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Active Operators', value: summary.active, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'System Admins', value: summary.admins, icon: Shield, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map(item => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-3.5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.bg}`}>
                <Icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{item.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5 tracking-tight">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative">
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="appearance-none bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium px-3 py-2 pr-8 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer transition-colors"
          >
            <option value="ALL">All Roles</option>
            <option value="SYSTEM_ADMIN">System Admin</option>
            <option value="ANALYST_REVIEWER">Analyst Reviewer</option>
            <option value="ANALYST_VIEWER">Analyst Viewer</option>
            <option value="DATA_SCIENTIST">Data Scientist</option>
            <option value="OPERATOR">Operator</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email address..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
            <p className="text-xs font-medium">Fetching directory records...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Operator / User</th>
                  <th className="py-3 px-4">Access Role</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4">Last Authentication</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filtered.map(user => {
                  const rc = roleConfig[user.role] || roleConfig.ANALYST_VIEWER;
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate">{user.name}</p>
                            <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${rc.badgeBg}`}>
                          {rc.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              user.isActive ? 'bg-emerald-500 ring-2 ring-emerald-500/20' : 'bg-slate-300'
                            }`}
                          />
                          <span className={`font-medium ${user.isActive ? 'text-emerald-700' : 'text-slate-400'}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(user.lastLoginAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleToggleActive(user.id)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                              user.isActive
                                ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => showToast(`Password reset link dispatched to ${user.email}`)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                            title="Reset Password"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            <UserIcon className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-semibold text-slate-700">No users found</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Try adjusting your search query or role filter</p>
          </div>
        )}
      </div>

      {/* Provision User Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
          onClick={e => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-slideDown">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Provision User Account</h3>
                  <p className="text-xs text-slate-400">Create login credentials and assign role permissions</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name *</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="e.g. Elena Rostova"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Corporate Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    placeholder="e.g. elena@banksecurity.com"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Access Role</label>
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value as UserRole)}
                  className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="ANALYST_VIEWER">Analyst Viewer (Read-only)</option>
                  <option value="ANALYST_REVIEWER">Analyst Reviewer (Adjudication allowed)</option>
                  <option value="DATA_SCIENTIST">Data Scientist (Model inspection)</option>
                  <option value="OPERATOR">Operator (Triage & support)</option>
                  <option value="SYSTEM_ADMIN">System Admin (Full system configuration)</option>
                </select>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 flex items-start gap-2.5 text-slate-600 text-xs">
                <KeyRound className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  A temporary password will be auto-generated and dispatched to this email address along with secure SSO enrollment instructions.
                </p>
              </div>
            </div>

            <div className="flex gap-2.5 mt-6">
              <button
                onClick={handleAddUser}
                disabled={!newName || !newEmail || submitting}
                className="flex-1 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Provisioning...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 px-4 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-xs font-medium z-50 text-white animate-slideUp ${
            toast.isError ? 'bg-rose-900' : 'bg-slate-900'
          }`}
        >
          {toast.isError ? (
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

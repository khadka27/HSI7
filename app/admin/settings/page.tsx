'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  User, Lock, Shield, Loader2, AlertCircle, CheckCircle2,
  Eye, EyeOff, Mail, UserCircle, Calendar,
} from 'lucide-react';

const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white transition-all';

function SectionCard({ icon: Icon, title, subtitle, accent = 'violet', children }: {
  icon: React.ElementType; title: string; subtitle?: string;
  accent?: string; children: React.ReactNode;
}) {
  const accents: Record<string, string> = {
    violet: 'from-violet-500 to-purple-500',
    blue: 'from-blue-500 to-teal-500',
    rose:    'from-rose-500 to-pink-500',
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className={`h-0.5 bg-gradient-to-r ${accents[accent]}`} />
      <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${accents[accent]} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

export default function AdminSettingsPage() {
  const { data: session, update: updateSession } = useSession();

  // Profile state
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password state
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Account info
  const [accountInfo, setAccountInfo] = useState<{ role: string; createdAt: string } | null>(null);

  useEffect(() => {
    fetch('/api/auth/account')
      .then(r => r.json())
      .then(data => {
        if (data.email) {
          setProfile({ name: data.name || '', email: data.email });
          setAccountInfo({ role: data.role, createdAt: data.createdAt });
        }
      })
      .finally(() => setProfileLoading(false));
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      const res = await fetch('/api/auth/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profile.name, email: profile.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update');
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      // Refresh session so header shows new name
      await updateSession({ name: profile.name });
      setTimeout(() => setProfileMsg(null), 4000);
    } catch (err) {
      setProfileMsg({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update profile' });
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (passwords.new !== passwords.confirm) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    if (passwords.new.length < 8) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 8 characters' });
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await fetch('/api/auth/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.new }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password');
      setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
      setPasswords({ current: '', new: '', confirm: '' });
      setTimeout(() => setPasswordMsg(null), 4000);
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update password' });
    } finally {
      setPasswordSaving(false);
    }
  };

  // Password strength
  const strength = (() => {
    const p = passwords.new;
    if (!p) return null;
    let score = 0;
    if (p.length >= 8)  score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 1) return { label: 'Weak',   color: 'bg-red-400',    width: 'w-1/5' };
    if (score <= 2) return { label: 'Fair',   color: 'bg-amber-400',  width: 'w-2/5' };
    if (score <= 3) return { label: 'Good',   color: 'bg-yellow-400', width: 'w-3/5' };
    if (score <= 4) return { label: 'Strong', color: 'bg-blue-400',width: 'w-4/5' };
    return { label: 'Very Strong', color: 'bg-blue-500', width: 'w-full' };
  })();

  if (profileLoading) return <div className="animate-pulse h-96 bg-gray-100 rounded-2xl" />;

  return (
    <div className="max-w-4xl space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-sm">
          <User className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-xs text-gray-400 mt-0.5">Manage your profile and security</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left — forms */}
        <div className="lg:col-span-2 space-y-5">

          {/* Profile */}
          <SectionCard icon={UserCircle} title="Profile Information" subtitle="Update your name and email address" accent="violet">
            {profileMsg && (
              <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm border ${
                profileMsg.type === 'success'
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                {profileMsg.type === 'success'
                  ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                {profileMsg.text}
              </div>
            )}
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <UserCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={profile.name}
                    onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                    className={`${inputCls} pl-10`}
                    placeholder="Your full name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    required
                    type="email"
                    value={profile.email}
                    onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                    className={`${inputCls} pl-10`}
                    placeholder="admin@example.com"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Changing your email will require you to log in again.</p>
              </div>
              <div className="pt-1">
                <button type="submit" disabled={profileSaving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0">
                  {profileSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : 'Save Profile'}
                </button>
              </div>
            </form>
          </SectionCard>

          {/* Password */}
          <SectionCard icon={Lock} title="Change Password" subtitle="Use a strong password with letters, numbers and symbols" accent="rose">
            {passwordMsg && (
              <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm border ${
                passwordMsg.type === 'success'
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                {passwordMsg.type === 'success'
                  ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                {passwordMsg.text}
              </div>
            )}
            <form onSubmit={handlePasswordSave} className="space-y-4">
              {/* Current password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    required
                    type={showCurrent ? 'text' : 'password'}
                    value={passwords.current}
                    onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
                    className={`${inputCls} pl-10 pr-11`}
                    placeholder="Enter current password"
                  />
                  <button type="button" onClick={() => setShowCurrent(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    required
                    type={showNew ? 'text' : 'password'}
                    value={passwords.new}
                    onChange={e => setPasswords(p => ({ ...p, new: e.target.value }))}
                    className={`${inputCls} pl-10 pr-11`}
                    placeholder="Min. 8 characters"
                  />
                  <button type="button" onClick={() => setShowNew(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Strength meter */}
                {strength && (
                  <div className="mt-2 space-y-1">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                    </div>
                    <p className={`text-xs font-medium ${
                      strength.label === 'Weak' ? 'text-red-500' :
                      strength.label === 'Fair' ? 'text-amber-500' :
                      strength.label === 'Good' ? 'text-yellow-600' :
                      'text-blue-600'
                    }`}>{strength.label}</p>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    required
                    type={showConfirm ? 'text' : 'password'}
                    value={passwords.confirm}
                    onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                    className={`${inputCls} pl-10 pr-11 ${
                      passwords.confirm && passwords.new !== passwords.confirm
                        ? 'border-red-300 focus:ring-red-400'
                        : passwords.confirm && passwords.new === passwords.confirm
                        ? 'border-blue-300 focus:ring-blue-400'
                        : ''
                    }`}
                    placeholder="Repeat new password"
                  />
                  <button type="button" onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  {passwords.confirm && (
                    <div className="absolute right-10 top-1/2 -translate-y-1/2">
                      {passwords.new === passwords.confirm
                        ? <CheckCircle2 className="w-4 h-4 text-blue-500" />
                        : <AlertCircle className="w-4 h-4 text-red-400" />}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-1">
                <button type="submit" disabled={passwordSaving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0">
                  {passwordSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</> : 'Update Password'}
                </button>
              </div>
            </form>
          </SectionCard>
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          {/* Account info card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-0.5 bg-gradient-to-r from-blue-500 to-teal-500" />
            <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Account Info</h3>
            </div>
            <div className="p-5 space-y-4">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-3 pb-4 border-b border-gray-100">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200">
                  <span className="text-2xl font-bold text-white">
                    {(profile.name || profile.email || 'A').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-900 text-sm">{profile.name || 'Admin'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{profile.email}</p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" /> Role
                  </span>
                  <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                    {accountInfo?.role || 'ADMIN'}
                  </span>
                </div>
                {accountInfo?.createdAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> Member since
                    </span>
                    <span className="text-xs text-gray-600">
                      {new Date(accountInfo.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </span>
                  <span className="text-xs text-gray-600 truncate max-w-[120px]">{profile.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Security tips */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-0.5 bg-gradient-to-r from-rose-500 to-pink-500" />
            <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                <Lock className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Security Tips</h3>
            </div>
            <div className="p-5 space-y-3 text-xs text-gray-500">
              {[
                'Use at least 12 characters for a strong password.',
                'Mix uppercase, lowercase, numbers and symbols.',
                'Never reuse passwords from other accounts.',
                'Change your password every 3–6 months.',
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold mt-0.5">•</span>
                  <p>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

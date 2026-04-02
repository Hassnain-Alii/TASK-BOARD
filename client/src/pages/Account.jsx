import React, { useState, useContext,  } from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiShield, FiCamera, FiArrowLeft, FiEye, FiEyeOff } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import Toast from '../components/Toast';
import api from '../api/taskApi';

const TABS = [
  { id: 'profile',  label: 'Profile',  icon: <FiUser size={15}/> },
  { id: 'security', label: 'Security', icon: <FiShield size={15}/> },
];

const Account = () => {
  const { user } = useContext(AuthContext);

  const [tab,     setTab]     = useState('profile');
  const [toast,   setToast]   = useState(null);
  const [loading, setLoading] = useState(false);

  // Profile form
  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName:  user?.lastName  || '',
    dob:       user?.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
    avatar:    user?.avatar    || '',
  });

  // Security form
  const [security, setSecurity] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  // ── Profile Submit ──────────────────────────────────────────────────────────
  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profile.firstName || profile.firstName.trim().length < 3) {
      showToast('First name must be at least 3 characters', 'error'); return;
    }
    setLoading(true);
    try {
      await api.put('/auth/update-profile', profile);
      showToast('Profile updated successfully!');
      // Refresh user data
      await api.get('/auth/me');
      // Update context indirectly by re-reading from local storage token
    } catch (err) {
      showToast(err.response?.data?.msg || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── Security Submit ─────────────────────────────────────────────────────────
  const handleSecuritySave = async (e) => {
    e.preventDefault();
    if (security.newPassword !== security.confirmPassword) {
      showToast('New passwords do not match', 'error'); return;
    }
    if (security.newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error'); return;
    }
    setLoading(true);
    try {
      await api.put('/auth/update-password', security);
      showToast('Password changed successfully!');
      setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showToast(err.response?.data?.msg || 'Failed to change password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const initials = user
    ? `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase()
    : '??';

  return (
    <div className="min-h-screen p-4 md:p-8">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-2xl mx-auto">
        {/* Back button */}
        <Link to="/board" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6 transition-colors">
          <FiArrowLeft size={15}/> Back to Board
        </Link>

        <div className="glass-card overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full bg-linear-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-2xl font-bold text-white overflow-hidden">
                {profile.avatar
                  ? <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover"/>
                  : initials}
              </div>
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-xl font-bold">{user?.firstName} {user?.lastName}</h1>
              <p className="text-slate-400 text-sm">{user?.email}</p>
              <p className="text-xs text-slate-500 mt-1">Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/10">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all border-b-2 ${
                  tab === t.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* ── Profile Tab ─────────────────────────────────────────────── */}
            {tab === 'profile' && (
              <form onSubmit={handleProfileSave} className="space-y-5 animate-fadeIn">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Avatar URL</label>
                  <input
                    type="url"
                    className="input-field"
                    placeholder="https://example.com/avatar.jpg"
                    value={profile.avatar}
                    onChange={(e) => setProfile({ ...profile, avatar: e.target.value })}
                  />
                  <p className="text-xs text-slate-500 mt-1">Paste a direct image URL for your profile picture</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">First Name <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="input-field"
                      value={profile.firstName}
                      onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Last Name</label>
                    <input
                      type="text"
                      className="input-field"
                      value={profile.lastName}
                      onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    className="input-field"
                    value={profile.dob}
                    onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : 'Save Profile'}
                </button>
              </form>
            )}

            {/* ── Security Tab ─────────────────────────────────────────────── */}
            {tab === 'security' && (
              <form onSubmit={handleSecuritySave} className="space-y-5 animate-fadeIn">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      className="input-field pr-10"
                      placeholder="Enter current password"
                      value={security.currentPassword}
                      onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                    />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white" onClick={() => setShowCurrent(!showCurrent)}>
                      {showCurrent ? <FiEyeOff size={16}/> : <FiEye size={16}/>}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showNew ? 'text' : 'password'}
                      className="input-field pr-10"
                      placeholder="At least 6 characters"
                      value={security.newPassword}
                      onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                    />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white" onClick={() => setShowNew(!showNew)}>
                      {showNew ? <FiEyeOff size={16}/> : <FiEye size={16}/>}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      className="input-field pr-10"
                      placeholder="Repeat new password"
                      value={security.confirmPassword}
                      onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                    />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white" onClick={() => setShowConfirm(!showConfirm)}>
                      {showConfirm ? <FiEyeOff size={16}/> : <FiEye size={16}/>}
                    </button>
                  </div>
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : 'Update Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;

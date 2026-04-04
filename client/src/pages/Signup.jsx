import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import Toast from '../components/Toast';

const Signup = () => {
  const [form, setForm] = useState({ firstName: '', lastName: '', dob: '', email: '', password: '', confirmPassword: '' });
  const [showPwd, setShowPwd]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [errorField, setErrorField]   = useState('');
  const [toast, setToast]             = useState(null);

  const { signup }  = useContext(AuthContext);
  const navigate    = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrorField('');
  };

  const shake = (field) => {
    setErrorField(field);
    setTimeout(() => setErrorField(''), 800);
  };

  const validate = () => {
    if (!form.firstName || form.firstName.trim().length < 3)
      return { field: 'firstName', msg: 'First name must be at least 3 characters' };
    // Last name is optional — no validation needed
    if (!form.dob)
      return { field: 'dob', msg: 'Date of birth is required' };
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email))
      return { field: 'email', msg: 'Please enter a valid email address' };
    if (!form.password || form.password.length < 6)
      return { field: 'password', msg: 'Password must be at least 6 characters' };
    if (form.password !== form.confirmPassword)
      return { field: 'confirmPassword', msg: 'Passwords do not match' };
    return null;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      shake(error.field);
      setToast({ msg: error.msg, type: 'error' });
      return;
    }
    setLoading(true);
    try {
      await signup(form);
      setToast({ msg: 'Account created successfully!', type: 'success' });
      setTimeout(() => navigate('/board'), 1200);
    } catch (err) {
      shake('all');
      setToast({ msg: err.response?.data?.msg || 'Registration failed', type: 'error' });
      setLoading(false);
    }
  };

  const cls = (field) =>
    `input-field ${errorField === field || errorField === 'all' ? 'error-shake !border-danger' : ''}`;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute w-96 h-96 bg-pink-600/40 rounded-full blur-[80px] -top-24 -left-24 animate-float -z-10" />
      <div className="absolute w-72 h-72 bg-primary/40 rounded-full blur-[80px] -bottom-12 -right-12 animate-float-delay -z-10" />

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="glass-card w-full max-w-lg p-6 sm:p-8 md:p-10 relative animate-fadeIn">
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-slate-900/70 backdrop-blur-sm">
            <div className="w-10 h-10 border-4 border-white/20 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-lg">Board</span>
            <span className="text-xl font-bold bg-linear-to-r from-white to-indigo-300 bg-clip-text text-transparent">TaskBoard</span>
          </div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-white to-pink-300 bg-clip-text text-transparent mb-1">Create account</h1>
          <p className="text-slate-400 text-sm">Join thousands of productive teams</p>
        </div>

        <a
          href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/api/auth/google`}
          className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all mb-6"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M5.27 9.76A7.08 7.08 0 0 1 12 4.9c1.76 0 3.35.64 4.58 1.69l3.41-3.41A11.94 11.94 0 0 0 12 .9C7.45.9 3.55 3.77 1.72 7.82l3.55 1.94Z"/>
            <path fill="#34A853" d="M16.04 18.01A7.07 7.07 0 0 1 12 19.1c-2.97 0-5.51-1.83-6.6-4.44l-3.57 1.94C3.7 20.3 7.52 23.1 12 23.1c2.96 0 5.68-1.04 7.77-2.74l-3.73-2.35Z"/>
            <path fill="#FBBC05" d="M5.4 14.66A7.16 7.16 0 0 1 4.9 12c0-.92.18-1.8.49-2.6L1.84 7.45A11.87 11.87 0 0 0 .9 12c0 1.58.3 3.1.85 4.47l3.65-1.81Z"/>
            <path fill="#4285F4" d="M23.1 12c0-.78-.07-1.53-.2-2.27H12v4.51h6.22a5.37 5.37 0 0 1-2.31 3.52l3.73 2.35C21.87 18.1 23.1 15.27 23.1 12Z"/>
          </svg>
          <span className="text-sm font-semibold text-slate-200">Sign up with Google</span>
        </a>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-slate-500 text-xs">or with email</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">First Name <span className="text-danger">*</span></label>
              <input name="firstName" type="text" className={cls('firstName')} placeholder="John (min 3 chars)" value={form.firstName} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Last Name <span className="text-slate-500 text-xs">(optional)</span></label>
              <input name="lastName" type="text" className="input-field" placeholder="Doe" value={form.lastName} onChange={handleChange} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Date of Birth <span className="text-danger">*</span></label>
            <input name="dob" type="date" className={cls('dob')} value={form.dob} onChange={handleChange} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Email <span className="text-danger">*</span></label>
            <input name="email" type="email" className={cls('email')} placeholder="you@example.com" value={form.email} onChange={handleChange} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Password <span className="text-danger">*</span></label>
            <div className="relative">
              <input
                name="password"
                type={showPwd ? 'text' : 'password'}
                className={`${cls('password')} pr-10`}
                placeholder="Min 6 characters"
                value={form.password}
                onChange={handleChange}
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white" onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? <FiEyeOff size={16}/> : <FiEye size={16}/>}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Confirm Password <span className="text-danger">*</span></label>
            <div className="relative">
              <input
                name="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                className={`${cls('confirmPassword')} pr-10`}
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={handleChange}
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white" onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? <FiEyeOff size={16}/> : <FiEye size={16}/>}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary mt-2">Create Account</button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:text-indigo-400 transition-colors">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;

import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FiEye, FiEyeOff, FiMail, FiLock, FiX } from "react-icons/fi";
import Toast from "../components/Toast";
import api from "../api/taskApi";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorField, setErrorField] = useState("");
  const [toast, setToast] = useState(null);
  // Forgot password modal
  const [fpOpen, setFpOpen] = useState(false);
  const [fpEmail, setFpEmail] = useState("");
  const [fpLoading, setFpLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const shake = (field) => {
    setErrorField(field);
    setTimeout(() => setErrorField(""), 800);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email) {
      shake("email");
      setToast({ msg: "Email cannot be empty", type: "error" });
      return;
    }
    if (!password) {
      shake("password");
      setToast({ msg: "Password cannot be empty", type: "error" });
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      setToast({ msg: "Login successful!", type: "success" });
      setTimeout(() => navigate("/board"), 1200);
    } catch (err) {
      shake("all");
      setToast({
        msg: err.response?.data?.msg || "Email or Password is not correct",
        type: "error",
      });
      setLoading(false);
    }
  };

  // Open forgot-password modal only if email is valid format
  const openForgotPassword = (e) => {
    e.preventDefault();
    const emailRegex = /\S+@\S+\.\S+/;
    if (!email || !emailRegex.test(email)) {
      shake("email");
      setToast({
        msg: "Please enter a valid email address first",
        type: "error",
      });
      return;
    }
    setFpEmail(email);
    setFpOpen(true);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    const emailRegex = /\S+@\S+\.\S+/;
    if (!fpEmail || !emailRegex.test(fpEmail)) {
      setToast({ msg: "Please enter a valid email address", type: "error" });
      return;
    }
    setFpLoading(true);
    try {
      await api.post("/auth/forgot-password", { email: fpEmail });
      setToast({ msg: "Reset link sent! Check your inbox.", type: "success" });
      setFpOpen(false);
    } catch (err) {
      setToast({
        msg: err.response?.data?.msg || "Something went wrong",
        type: "error",
      });
    } finally {
      setFpLoading(false);
    }
  };

  const inputCls = (field) =>
    `input-field ${errorField === field || errorField === "all" ? "error-shake !border-danger" : ""}`;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute w-96 h-96 bg-primary/50 rounded-full blur-[80px] -top-24 -left-24 animate-float -z-10" />
      <div className="absolute w-72 h-72 bg-violet-600/50 rounded-full blur-[80px] -bottom-12 -right-12 animate-float-delay -z-10" />

      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Forgot Password Modal */}
      {fpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
          <div className="glass-card w-full max-w-sm p-8 relative">
            <button
              onClick={() => setFpOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <FiX size={20} />
            </button>
            <h2 className="text-xl font-bold mb-1">Reset Password</h2>
            <p className="text-slate-400 text-sm mb-6">
              Enter your email and we'll send a reset link.
            </p>
            <form onSubmit={handleForgotPassword}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="your@email.com"
                  value={fpEmail}
                  onChange={(e) => setFpEmail(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="btn-primary"
                disabled={fpLoading}
              >
                {fpLoading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="glass-card w-full max-w-md p-10 relative animate-fadeIn">
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-slate-900/70 backdrop-blur-sm">
            <div className="w-10 h-10 border-4 border-white/20 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-lg">
              Board
            </span>
            <span className="text-xl font-bold bg-linear-to-r from-white to-indigo-300 bg-clip-text text-transparent">
              TaskBoard
            </span>
          </div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-white to-indigo-300 bg-clip-text text-transparent mb-1">
            Welcome back
          </h1>
          <p className="text-slate-400 text-sm">Sign in to your account</p>
        </div>

        {/* Google OAuth */}
        <a
          href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/api/auth/google`}
          className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all mb-6"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M5.27 9.76A7.08 7.08 0 0 1 12 4.9c1.76 0 3.35.64 4.58 1.69l3.41-3.41A11.94 11.94 0 0 0 12 .9C7.45.9 3.55 3.77 1.72 7.82l3.55 1.94Z"
            />
            <path
              fill="#34A853"
              d="M16.04 18.01A7.07 7.07 0 0 1 12 19.1c-2.97 0-5.51-1.83-6.6-4.44l-3.57 1.94C3.7 20.3 7.52 23.1 12 23.1c2.96 0 5.68-1.04 7.77-2.74l-3.73-2.35Z"
            />
            <path
              fill="#FBBC05"
              d="M5.4 14.66A7.16 7.16 0 0 1 4.9 12c0-.92.18-1.8.49-2.6L1.84 7.45A11.87 11.87 0 0 0 .9 12c0 1.58.3 3.1.85 4.47l3.65-1.81Z"
            />
            <path
              fill="#4285F4"
              d="M23.1 12c0-.78-.07-1.53-.2-2.27H12v4.51h6.22a5.37 5.37 0 0 1-2.31 3.52l3.73 2.35C21.87 18.1 23.1 15.27 23.1 12Z"
            />
          </svg>
          <span className="text-sm font-semibold text-slate-200">
            Continue with Google
          </span>
        </a>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-slate-500 text-xs">or continue with email</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Email
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                className={`${inputCls("email")} pl-10`}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorField("");
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-slate-400">
                Password
              </label>
              <a
                href="#"
                onClick={openForgotPassword}
                className="text-xs text-primary hover:text-indigo-400 transition-colors"
              >
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type={showPwd ? "text" : "password"}
                className={`${inputCls("password")} pl-10 pr-10`}
                placeholder="Your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorField("");
                }}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                onClick={() => setShowPwd(!showPwd)}
              >
                {showPwd ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary">
            Login
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-primary font-semibold hover:text-indigo-400 transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

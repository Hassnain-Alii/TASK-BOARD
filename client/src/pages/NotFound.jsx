import React from "react";
import { Link } from "react-router-dom";
import { FiHome, FiAlertTriangle } from "react-icons/fi";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute w-96 h-96 bg-primary/30 rounded-full blur-[100px] -top-24 -left-24 animate-float -z-10" />
      <div className="absolute w-72 h-72 bg-danger/20 rounded-full blur-[100px] -bottom-12 -right-12 animate-float-delay -z-10" />

      <div className="glass-card w-full max-w-lg p-12 text-center relative animate-fadeIn">
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 bg-danger/10 rounded-full flex items-center justify-center text-danger border border-danger/20 animate-pulse">
            <FiAlertTriangle size={48} />
          </div>
        </div>

        <h1 className="text-8xl font-black bg-linear-to-r from-white via-danger to-indigo-300 bg-clip-text text-transparent mb-4">
          404
        </h1>
        
        <h2 className="text-2xl font-bold text-white mb-4">
          Oops! Page Not Found
        </h2>
        
        <p className="text-slate-400 mb-10 max-w-xs mx-auto">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/board"
            className="btn-primary flex items-center justify-center gap-2 px-8 py-3"
          >
            <FiHome size={18} />
            Back to Dashboard
          </Link>
          <Link
            to="/login"
            className="bg-white/5 hover:bg-white/10 text-white font-semibold py-3 px-8 rounded-xl border border-white/10 transition-all flex items-center justify-center"
          >
            Go to Login
          </Link>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-500 text-sm">
        &copy; {new Date().getFullYear()} TaskBoard Enterprise Edition
      </div>
    </div>
  );
};

export default NotFound;

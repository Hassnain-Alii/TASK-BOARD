import React, { useState, useContext, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiPlus, FiLogOut, FiUser } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';

const Navbar = ({ searchTerm, setSearchTerm, filterPriority, setFilterPriority, onAddTask }) => {
  const { user, logout } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = user
    ? `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase()
    : '??';

  return (
    <nav className="flex items-center justify-between px-4 md:px-6 py-3 bg-slate-900/70 backdrop-blur-glass border-b border-white/5 z-30 gap-3">
      {/* Left: Logo */}
      <Link to="/board" className="flex items-center gap-2 shrink-0">
        <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-lg">TB</span>
        <span className="hidden sm:block font-bold text-lg bg-linear-to-r from-white to-indigo-300 bg-clip-text text-transparent">TaskBoard</span>
      </Link>

      {/* Center: Search */}
      <div className="relative flex-1 max-w-80">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
        <input
          type="text"
          className="w-full pl-9 pr-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-slate-200 placeholder-slate-500 outline-none transition-all focus:border-primary/60 focus:bg-white/10"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Right: Filter + Add + Avatar */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        <select
          className="hidden sm:block py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 outline-none cursor-pointer"
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
        >
          <option value="all">All Priority</option>
          <option value="high">🔴 High</option>
          <option value="medium">🟡 Medium</option>
          <option value="low">🔵 Low</option>
        </select>

        <button
          onClick={onAddTask}
          className="flex items-center gap-1.5 py-2 px-3 md:px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-all shadow-[0_4px_14px_0_rgba(99,102,241,0.4)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.5)] active:scale-[0.97]"
        >
          <FiPlus size={16}/>
          <span className="hidden md:inline">Add Task</span>
        </button>

        {/* Avatar + Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-9 h-9 rounded-full bg-linear-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold hover:ring-2 hover:ring-primary/60 transition-all"
            title={user?.email}
          >
            {user?.avatar ? (
              <img src={user.avatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
            ) : initials}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-11 w-52 glass-card rounded-xl! overflow-hidden z-50 animate-fadeIn shadow-xl">
              <div className="px-4 py-3 border-b border-white/10">
                <p className="text-sm font-semibold text-slate-100 truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
              <Link
                to="/account"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-all"
              >
                <FiUser size={15}/> Manage Account
              </Link>
              <button
                onClick={() => { setDropdownOpen(false); logout(); }}
                className="flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all w-full text-left"
              >
                <FiLogOut size={15}/> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

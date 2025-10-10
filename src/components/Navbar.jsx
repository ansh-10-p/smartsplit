import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar(){
  const nav = useNavigate();
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      root.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);
  return (
    <nav className="w-full flex items-center justify-between py-4 px-6 glass">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
             style={{ background: "linear-gradient(90deg,#7C3AED,#C084FC)" }}>
          ⚡
        </div>
        <div className="select-none">
          <div className="text-white font-bold text-lg">SmartSplit</div>
          <div className="text-xs text-slate-300">Split Smart. Pay Easy.</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link to="/" className="text-slate-300 hover:text-white">Home</Link>
        <Link to="/dashboard" className="text-slate-300 hover:text-white">Dashboard</Link>
        <Link to="/add-expense" className="text-slate-300 hover:text-white">Add Expense</Link>
        <Link to="/summary" className="text-slate-300 hover:text-white">Summary</Link>
        <Link to="/balance-summary" className="text-slate-300 hover:text-white">Balance</Link>
        <Link to="/analytics" className="text-slate-300 hover:text-white">Analytics</Link>
        <Link to="/groups" className="text-slate-300 hover:text-white">Groups</Link>
        <Link to="/upi" className="text-slate-300 hover:text-white">UPI</Link>
        <button
          aria-label="Toggle dark mode"
          onClick={() => setDark(d => !d)}
          className="px-3 py-2 rounded-lg border border-slate-600 hover:bg-slate-800 transition"
          title={dark ? 'Switch to light' : 'Switch to dark'}
        >
          {dark ? '🌙' : '☀️'}
        </button>
        <button
          onClick={() => nav("/login")}
          className="px-4 py-2 rounded-lg border border-[#7C3AED] hover:shadow-neon-lg transition"
        >
          Login
        </button>
        <Link to="/signup" className="px-4 py-2 rounded-lg btn-neon text-black ml-2">Sign Up</Link>
      </div>
    </nav>
  );
}

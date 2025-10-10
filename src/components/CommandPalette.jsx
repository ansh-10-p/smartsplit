import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/* Ctrl/Cmd + K command palette */
export default function CommandPalette(){
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const nav = useNavigate();

  const commands = [
    { id: 'add', title: 'Add Expense (Dashboard)', action: () => nav('/dashboard') },
    { id: 'dashboard', title: 'Open Dashboard', action: () => nav('/dashboard') },
    { id: 'summary', title: 'View Summary', action: () => nav('/summary') },
    { id: 'upi', title: 'Open UPI Pay Mock', action: () => nav('/upi') },
  ];

  useEffect(() => {
    function onKey(e){
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k'){
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const filtered = commands.filter(c => c.title.toLowerCase().includes(query.toLowerCase()));

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-28">
      <div className="w-full max-w-xl glass p-4 rounded-2xl shadow-neon-lg">
        <input
          autoFocus
          value={query}
          onChange={(e)=>setQuery(e.target.value)}
          placeholder="Type a command (e.g., Add Expense) — Ctrl/Cmd+K to toggle"
          className="w-full p-3 rounded bg-transparent border border-slate-700"
        />
        <div className="mt-3">
          {filtered.map(c => (
            <div key={c.id} onClick={() => { c.action(); setOpen(false); }} className="p-3 rounded hover:bg-slate-800 cursor-pointer">
              {c.title}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

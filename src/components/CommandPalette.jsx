import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const nav = useNavigate();
  const commands = [
    { id: "home", title: "Home", action: () => nav("/") },
    { id: "dashboard", title: "Open Dashboard", action: () => nav("/dashboard") },
    { id: "summary", title: "View Summary", action: () => nav("/summary") },
    { id: "upi", title: "Open UPI Pay Mock", action: () => nav("/upi") },
  ];

  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!open) return null;
  const filtered = commands.filter(c => c.title.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-28">
      <div className="w-full max-w-xl glass p-4 rounded-2xl shadow-neon-lg">
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)}
               className="w-full bg-transparent p-3 outline-none border border-slate-700 rounded" placeholder="Type a command (Ctrl/Cmd+K)"/>
        <div className="mt-3">
          {filtered.map(c => (
            <div key={c.id} onClick={() => { c.action(); setOpen(false); }} className="p-3 rounded hover:bg-slate-800 cursor-pointer">
              {c.title}
            </div>
          ))}
          {filtered.length === 0 && <div className="p-3 text-slate-500">No results</div>}
        </div>
      </div>
    </div>
  );
}

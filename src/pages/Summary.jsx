import React from "react";
import { Link } from "react-router-dom";

/* For demo: compute a quick mock summary from localStorage expenses */
function computeMock() {
  const expenses = JSON.parse(localStorage.getItem("smartsplit_expenses_v1") || "[]");
  const participants = JSON.parse(localStorage.getItem("smartsplit_participants_v1") || "[]");
  if (!participants.length) return [];
  const map = {};
  participants.forEach(p => map[p.id] = 0);
  expenses.forEach(e => {
    map[e.paidBy] += e.amount;
    e.splits.forEach(s => map[s.participantId] -= s.value);
  });
  // create simple settlements
  const entries = Object.entries(map).map(([id, amt]) => ({ id, amt: Math.round(amt * 100) / 100 }));
  let debtors = entries.filter(e => e.amt < -0.01).sort((a, b) => a.amt - b.amt);
  let creditors = entries.filter(e => e.amt > 0.01).sort((a, b) => b.amt - a.amt);
  const res = [];
  while (debtors.length && creditors.length) {
    const d = debtors[0], c = creditors[0];
    const settle = Math.min(Math.abs(d.amt), c.amt);
    res.push({ from: d.id, to: c.id, amount: Math.round(settle * 100) / 100 });
    d.amt += settle; c.amt -= settle;
    if (Math.abs(d.amt) < 0.01) debtors.shift();
    if (Math.abs(c.amt) < 0.01) creditors.shift();
  }
  return { participants, res };
}

export default function Summary() {
  const data = computeMock();
  if (!data.participants) return <div className="p-6">No data</div>;
  const { participants, res } = data;
  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-light font-serif mb-6 tracking-wide">Summary — Who owes whom</h2>
      <div className="grid gap-3">
        {res.length === 0 && <div className="text-slate-400">Everything is settled.</div>}
        {res.map((s, i) => (
          <div key={i} className="glass p-4 rounded-lg flex items-center justify-between">
            <div>
              <div className="text-sm opacity-80">{participants.find(p => p.id === s.from)?.name} → {participants.find(p => p.id === s.to)?.name}</div>
              <div className="font-semibold">₹{s.amount}</div>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-2 rounded border" onClick={() => alert('Reminder sent (mock)')}>Remind</button>
              <Link to="/upi" state={{ from: s.from, to: s.to, amount: s.amount }} className="px-3 py-2 rounded bg-purple-600 hover:bg-purple-500 text-white transition-all duration-200">Pay</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

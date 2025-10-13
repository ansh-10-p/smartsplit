import React from "react";

export default function Leaderboard({ summary }) {
  const sorted = Object.entries(summary)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (!sorted.length)
    return <div className="p-6 rounded-2xl glass text-center text-slate-400">No data yet</div>;

  return (
    <div className="p-6 rounded-2xl glass">
      <h2 className="text-2xl font-semibold mb-4">Leaderboard</h2>
      <ul className="space-y-2">
        {sorted.map(([name, balance], i) => (
          <li key={i} className="flex justify-between">
            <span>{i + 1}. {name}</span>
            <span className={balance >= 0 ? "text-green-400" : "text-red-400"}>
              ₹{balance.toFixed(2)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

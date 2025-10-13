import React from "react";

export default function SummaryCard({ summary }) {
  if (!Object.keys(summary).length)
    return <div className="p-6 rounded-2xl glass text-center text-slate-400">No summary yet</div>;

  return (
    <div className="p-6 rounded-2xl glass">
      <h2 className="text-2xl font-semibold mb-4">Balance Summary</h2>
      <ul className="space-y-2">
        {Object.entries(summary).map(([person, balance]) => (
          <li key={person} className="flex justify-between">
            <span>{person}</span>
            <span className={balance >= 0 ? "text-green-400" : "text-red-400"}>
              {balance >= 0 ? "+" : "-"}₹{Math.abs(balance).toFixed(2)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

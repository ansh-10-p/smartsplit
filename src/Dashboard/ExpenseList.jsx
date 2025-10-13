import React from "react";

export default function ExpenseList({ expenses }) {
  if (!expenses.length)
    return (
      <div className="p-6 rounded-2xl glass text-center text-slate-400">
        No expenses yet. Add one!
      </div>
    );

  return (
    <div className="p-6 rounded-2xl glass">
      <h2 className="text-2xl font-semibold mb-4">All Expenses</h2>
      <ul className="space-y-2">
        {expenses.map((exp) => (
          <li key={exp.id} className="flex justify-between border-b border-slate-700 pb-2">
            <div>
              <p className="font-medium">{exp.description}</p>
              <p className="text-sm text-slate-400">
                Paid by <b>{exp.paidBy}</b> — ₹{exp.amount}
              </p>
            </div>
            <div className="text-right text-sm text-slate-400">
              {exp.splits.length} splits
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

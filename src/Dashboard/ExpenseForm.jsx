import React, { useState } from "react";

export default function ExpenseForm({ onAddExpense }) {
  const [form, setForm] = useState({ description: "", amount: "", paidBy: "", participants: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.description || !form.amount || !form.paidBy || !form.participants) return;
    const parts = form.participants.split(",").map((p) => p.trim()).filter(Boolean);
    const splits = parts.map((p) => ({ participantId: p, value: +(form.amount / parts.length).toFixed(2) }));
    onAddExpense({ ...form, amount: +form.amount, splits });
    setForm({ description: "", amount: "", paidBy: "", participants: "" });
  };

  return (
    <div className="p-6 rounded-2xl glass">
      <h2 className="text-2xl font-semibold mb-4">Add Expense</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input name="description" value={form.description} onChange={handleChange} placeholder="Description"
          className="input-field w-full" />
        <input name="amount" value={form.amount} onChange={handleChange} placeholder="Amount" type="number"
          className="input-field w-full" />
        <input name="paidBy" value={form.paidBy} onChange={handleChange} placeholder="Paid by (Name)"
          className="input-field w-full" />
        <input name="participants" value={form.participants} onChange={handleChange}
          placeholder="Participants (comma separated)" className="input-field w-full" />
        <button type="submit" className="btn-neon w-full py-2 rounded-lg font-medium">Add Expense</button>
      </form>
    </div>
  );
}

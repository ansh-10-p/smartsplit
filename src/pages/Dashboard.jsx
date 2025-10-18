// src/pages/Dashboard.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../App";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  Wallet,
  TrendingUp,
  Divide,
  X,
  Trash2,
  CreditCard,
  Loader2,
  ArrowRightCircle,
} from "lucide-react";

const EXP_KEY = "smartsplit_expenses_v1";
const PART_KEY = "smartsplit_participants_v1";

function uid(prefix = "id") {
  return prefix + "_" + Math.random().toString(36).slice(2, 9);
}

function isGroupExpense(ex) {
  return (
    ex &&
    typeof ex.amount === "number" &&
    typeof ex.paidBy === "string" &&
    Array.isArray(ex.splits)
  );
}

function Toast({ message, type = "info", onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className={`fixed bottom-6 right-6 px-4 py-2 rounded shadow-lg text-white z-50 max-w-xs ${type === "error" ? "bg-red-500" : type === "success" ? "bg-green-500" : "bg-blue-500"
        }`}
      onClick={onClose}
      style={{ cursor: "pointer" }}
    >
      {message}
    </motion.div>
  );
}

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  const [participants, setParticipants] = useState(() => {
    return (
      JSON.parse(localStorage.getItem(PART_KEY) || "null") || [
        { id: "p1", name: "Raj", points: 120 },
        { id: "p2", name: "Sarah", points: 90 },
        { id: "p3", name: "Asha", points: 70 },
      ]
    );
  });

  const [expenses, setExpenses] = useState(() => {
    return JSON.parse(localStorage.getItem(EXP_KEY) || "[]");
  });

  // Only group-style expenses (protects from Quick Add/Transactions records)
  const groupExpenses = useMemo(() => expenses.filter(isGroupExpense), [expenses]);

  // form/ui state
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState(participants[0]?.id || "");
  const [splitType, setSplitType] = useState("equal");
  const [alloc, setAlloc] = useState({});

  // pay modal
  const [payModal, setPayModal] = useState({ open: false, from: null, to: null, amount: 0 });

  // toast
  const [toast, setToast] = useState(null);

  useEffect(() => {
    localStorage.setItem(EXP_KEY, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(PART_KEY, JSON.stringify(participants));
  }, [participants]);

  const participantMap = useMemo(() => {
    const map = {};
    participants.forEach((p) => (map[p.id] = p));
    return map;
  }, [participants]);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const addParticipant = (name) => {
    if (!name || !name.trim()) {
      showToast("Participant name can't be empty", "error");
      return;
    }
    const p = { id: uid("p"), name: name.trim(), points: 0 };
    setParticipants((s) => [...s, p]);
    showToast(`Added participant "${p.name}"`, "success");
  };

  const deleteParticipant = (id) => {
    const participant = participantMap[id];
    if (!participant) return;
    if (
      window.confirm(
        `Are you sure you want to delete participant "${participant.name}"? This will also remove related expenses.`
      )
    ) {
      setParticipants((s) => s.filter((p) => p.id !== id));
      setExpenses((s) =>
        s.filter((ex) => ex.paidBy !== id && !(Array.isArray(ex.splits) && ex.splits.some((sp) => sp.participantId === id)))
      );
      showToast(`Deleted participant "${participant.name}"`, "success");
    }
  };

  const addExpense = () => {
    if (!title.trim() || !amount || isNaN(amount) || Number(amount) <= 0) {
      showToast("Enter valid title & positive amount", "error");
      return;
    }
    const amt = Number(amount);
    if (participants.length === 0) {
      showToast("Add participants first", "error");
      return;
    }

    let splits = [];

    if (splitType === "equal") {
      const per = +(amt / participants.length).toFixed(2);
      splits = participants.map((p) => ({ participantId: p.id, value: per }));
    } else if (splitType === "percentage") {
      const totalPercent = participants.reduce((s, p) => s + (alloc[p.id] || 0), 0);
      if (Math.round(totalPercent) !== 100) {
        showToast("Percentages must sum to 100", "error");
        return;
      }
      splits = participants.map((p) => ({
        participantId: p.id,
        value: +(((alloc[p.id] || 0) * amt) / 100).toFixed(2),
      }));
    } else {
      const totalCustom = participants.reduce((s, p) => s + (alloc[p.id] || 0), 0);
      if (Math.abs(totalCustom - amt) > 0.5) {
        showToast("Custom allocations must sum to total amount", "error");
        return;
      }
      splits = participants.map((p) => ({ participantId: p.id, value: +(alloc[p.id] || 0) }));
    }

    const e = {
      id: uid("exp"),
      title,
      amount: amt,
      paidBy,
      splits,
      createdAt: Date.now(),
    };

    setExpenses((s) => [e, ...s]);
    setTitle("");
    setAmount("");
    setAlloc({});
    setSplitType("equal");
    setShowForm(false);
    showToast(`Added expense "${title}"`, "success");
  };

  const deleteExpense = (id) => {
    const expense = groupExpenses.find((e) => e.id === id);
    if (!expense) return;
    if (window.confirm(`Delete expense "${expense.title}"?`)) {
      setExpenses((s) => s.filter((e) => e.id !== id));
      showToast(`Deleted expense "${expense.title}"`, "success");
    }
  };

  const balances = useMemo(() => {
    const map = {};
    participants.forEach((p) => (map[p.id] = 0));
    groupExpenses.forEach((ex) => {
      map[ex.paidBy] = (map[ex.paidBy] || 0) + (Number(ex.amount) || 0);
      (ex.splits || []).forEach((s) => {
        map[s.participantId] = (map[s.participantId] || 0) - (Number(s.value) || 0);
      });
    });
    return map;
  }, [groupExpenses, participants]);

  const computeSettlements = () => {
    const res = [];
    const entries = Object.entries(balances).map(([id, amt]) => ({
      id,
      amt: Math.round(amt * 100) / 100,
    }));

    let debtors = entries.filter((e) => e.amt < -0.01).sort((a, b) => a.amt - b.amt);
    let creditors = entries.filter((e) => e.amt > 0.01).sort((a, b) => b.amt - a.amt);

    while (debtors.length && creditors.length) {
      const d = debtors[0];
      const c = creditors[0];
      const settle = Math.min(Math.abs(d.amt), c.amt);
      res.push({
        from: d.id,
        to: c.id,
        amount: Math.round(settle * 100) / 100,
      });
      d.amt += settle;
      c.amt -= settle;
      if (Math.abs(d.amt) < 0.01) debtors.shift();
      if (Math.abs(c.amt) < 0.01) creditors.shift();
    }
    return res;
  };

  const settlements = computeSettlements();

  const createSettlementExpense = (fromId, toId, amt) => {
    const e = {
      id: uid("exp"),
      title: `Settlement ${participantMap[fromId]?.name || fromId} → ${participantMap[toId]?.name || toId}`,
      amount: amt,
      paidBy: fromId,
      splits: [{ participantId: toId, value: amt }],
      createdAt: Date.now(),
      meta: { settlement: true },
    };
    setExpenses((s) => [e, ...s]);
  };

  const openPayModal = (from, to, amount) => {
    setPayModal({ open: true, from, to, amount, upi: "" });
  };

  const closePayModal = () => setPayModal({ open: false, from: null, to: null, amount: 0 });

  const handlePayNow = async () => {
    if (!payModal.from || !payModal.to || !payModal.amount) {
      showToast("Invalid payment", "error");
      return;
    }
    setPayModal((p) => ({ ...p, loading: true }));
    await new Promise((res) => setTimeout(res, 1400));
    const success = Math.random() < 0.9;
    setPayModal((p) => ({ ...p, loading: false }));
    if (success) {
      createSettlementExpense(payModal.from, payModal.to, payModal.amount);
      showToast(`Payment successful: ₹${payModal.amount.toFixed(2)}`, "success");
      closePayModal();
    } else {
      showToast("Payment failed. Try again.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200 text-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 dark:text-white p-6 transition-colors">
      <div className="max-w-7xl mx-auto">
        <main>
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <motion.h1
                className="text-4xl md:text-5xl font-light font-serif mb-2 tracking-wide"
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                Welcome back, {user?.username || "Friend"}
              </motion.h1>
              <p className="text-slate-600 dark:text-slate-400">Split smarter. Settle faster. Stay friends forever.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-white border border-gray-200 dark:bg-gray-900/60 dark:border-gray-800">
                <div className="text-xs text-slate-600 dark:text-slate-400">Your Balance</div>
                <div className="font-semibold">
                  ₹{Object.values(balances).reduce((s, v) => s + v, 0).toFixed(2)}
                </div>
              </div>
              <button
                onClick={() => {
                  const name = prompt("Enter participant name:");
                  if (name) addParticipant(name);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg border border-gray-300 transition dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                <UserPlus size={16} /> Add
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Top cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl p-4 bg-white border border-gray-200 shadow dark:bg-gray-900/80 dark:border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 font-semibold">
                    <Wallet className="text-cyan-600 dark:text-cyan-400" /> Expenses
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{groupExpenses.length} items</div>
                </div>
                <div className="text-sm text-slate-700 dark:text-slate-300">Quick actions</div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setShowForm((s) => !s)}
                    className="px-3 py-2 rounded-md bg-cyan-600 text-white font-semibold hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600"
                  >
                    {showForm ? "Close" : "Add Expense"}
                  </button>
                  <button
                    onClick={() => {
                      setParticipants([
                        { id: "p1", name: "Raj", points: 120 },
                        { id: "p2", name: "Sarah", points: 90 },
                        { id: "p3", name: "Asha", points: 70 },
                      ]);
                      setExpenses([]);
                      showToast("Reset demo data", "info");
                    }}
                    className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700 dark:text-white"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="rounded-xl p-4 bg-white border border-gray-200 shadow dark:bg-gray-900/80 dark:border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 font-semibold">
                    <TrendingUp className="text-cyan-600 dark:text-cyan-400" /> Balances
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Live</div>
                </div>
                <div className="text-sm text-slate-700 dark:text-slate-300">
                  Quick glance of who owes and who is owed.
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  {participants.slice(0, 3).map((p) => (
                    <div key={p.id} className="flex justify-between">
                      <div className="text-sm">{p.name}</div>
                      <div className="font-semibold">₹{(balances[p.id] ?? 0).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl p-4 bg-white border border-gray-200 shadow dark:bg-gray-900/80 dark:border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 font-semibold">
                    <Divide className="text-cyan-600 dark:text-cyan-400" /> Settlements
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{settlements.length}</div>
                </div>
                <div className="text-sm text-slate-700 dark:text-slate-300">Pay or request to settle balances.</div>

                <div className="mt-3">
                  {settlements.slice(0, 3).map((s, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 mb-2">
                      <div className="text-sm">
                        {participantMap[s.from]?.name || s.from} → {participantMap[s.to]?.name || s.to}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="font-semibold">₹{s.amount.toFixed(2)}</div>
                        <button
                          onClick={() => openPayModal(s.from, s.to, s.amount)}
                          className="px-2 py-1 rounded-md bg-cyan-600 text-white hover:bg-cyan-700 flex items-center gap-2 dark:bg-cyan-500 dark:hover:bg-cyan-600"
                        >
                          <CreditCard size={14} /> Pay
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Add Expense Form (animated) */}
            <AnimatePresence>
              {showForm && (
                <motion.div
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xl mb-4 dark:bg-gray-900/70 dark:border-gray-700"
                >
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Wallet className="text-cyan-600 dark:text-cyan-400" /> New Expense
                  </h2>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Expense Title"
                      className="p-3 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 dark:bg-gray-950 dark:border-gray-700"
                    />
                    <input
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Amount (₹)"
                      type="number"
                      min="0"
                      className="p-3 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 dark:bg-gray-950 dark:border-gray-700"
                    />
                    <select
                      value={paidBy}
                      onChange={(e) => setPaidBy(e.target.value)}
                      className="p-3 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 dark:bg-gray-950 dark:border-gray-700"
                    >
                      {participants.map((p) => (
                        <option value={p.id} key={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4 flex items-center gap-3 flex-wrap">
                    <label className="text-sm text-slate-700 dark:text-slate-300">Split Type:</label>
                    <select
                      value={splitType}
                      onChange={(e) => setSplitType(e.target.value)}
                      className="p-2 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 dark:bg-gray-950 dark:border-gray-700"
                    >
                      <option value="equal">Equal</option>
                      <option value="percentage">Percentage</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>

                  {(splitType === "percentage" || splitType === "custom") && (
                    <div className="grid md:grid-cols-3 gap-3 mb-4">
                      {participants.map((p) => (
                        <div key={p.id} className="flex items-center gap-3">
                          <div className="w-24 text-sm">{p.name}</div>
                          <input
                            value={alloc[p.id] ?? ""}
                            onChange={(e) =>
                              setAlloc((a) => ({
                                ...a,
                                [p.id]: Number(e.target.value),
                              }))
                            }
                            placeholder={splitType === "percentage" ? "%" : "₹"}
                            type="number"
                            min="0"
                            className="flex-1 p-2 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 dark:bg-gray-950 dark:border-gray-700"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={addExpense}
                    className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold transition dark:bg-cyan-500 dark:hover:bg-cyan-600"
                  >
                    Add Expense
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Participants + Expenses lists */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Participants */}
              <section className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg dark:bg-gray-900/80 dark:border-gray-800">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <UserPlus className="text-cyan-600 dark:text-cyan-400" /> Participants
                </h3>
                {participants.length === 0 ? (
                  <p className="text-gray-500 italic dark:text-gray-400">No participants added yet.</p>
                ) : (
                  <ul className="grid sm:grid-cols-2 gap-3">
                    {participants.map((p) => (
                      <li
                        key={p.id}
                        className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-md p-3 dark:bg-gray-950 dark:border-gray-800"
                      >
                        <span>{p.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            ₹{(balances[p.id] ?? 0).toFixed(2)}
                          </span>
                          <button
                            onClick={() => deleteParticipant(p.id)}
                            className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
                            title="Delete Participant"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* Expenses */}
              <section className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg dark:bg-gray-900/80 dark:border-gray-800">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Wallet className="text-cyan-600 dark:text-cyan-400" /> Expenses
                </h3>
                {groupExpenses.length === 0 ? (
                  <p className="text-gray-500 italic dark:text-gray-400">No expenses recorded yet.</p>
                ) : (
                  <ul className="space-y-3 max-h-96 overflow-auto pr-2">
                    {groupExpenses.map((ex) => (
                      <li
                        key={ex.id}
                        className="bg-gray-50 border border-gray-200 rounded-md p-4 flex flex-col md:flex-row md:justify-between md:items-center dark:bg-gray-950 dark:border-gray-800"
                      >
                        <div>
                          <div className="text-lg font-semibold">{ex.title}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Paid by: {participantMap[ex.paidBy]?.name || "Unknown"} | ₹{Number(ex.amount).toFixed(2)}
                          </div>
                          <div className="text-sm mt-2 flex flex-wrap gap-2">
                            {(ex.splits || []).map((sp) => (
                              <span
                                key={sp.participantId}
                                className="px-2 py-1 rounded bg-cyan-100 text-cyan-800 text-xs dark:bg-cyan-700/50 dark:text-cyan-100"
                              >
                                {participantMap[sp.participantId]?.name || "?"}: ₹
                                {Number(sp.value ?? 0).toFixed(2)}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="mt-3 md:mt-0 flex gap-3">
                          <button
                            onClick={() => deleteExpense(ex.id)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md transition"
                            title="Delete Expense"
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            {/* Balance Summary + Full Settlements */}
            <div className="grid md:grid-cols-2 gap-6">
              <section className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg dark:bg-gray-900/80 dark:border-gray-800">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="text-cyan-600 dark:text-cyan-400" /> Balance Summary
                </h3>
                <ul className="space-y-2">
                  {participants.map((p) => {
                    const bal = balances[p.id] ?? 0;
                    return (
                      <li
                        key={p.id}
                        className={`flex justify-between items-center px-4 py-2 rounded border ${bal > 0
                            ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-700/70 dark:border-green-700 dark:text-green-100"
                            : bal < 0
                              ? "bg-red-50 border-red-200 text-red-800 dark:bg-red-700/70 dark:border-red-700 dark:text-red-100"
                              : "bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-700/70 dark:border-gray-700 dark:text-gray-100"
                          }`}
                      >
                        <span>{p.name}</span>
                        <span>₹{bal.toFixed(2)}</span>
                      </li>
                    );
                  })}
                </ul>
              </section>

              <section className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg dark:bg-gray-900/80 dark:border-gray-800">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Divide className="text-cyan-600 dark:text-cyan-400" /> Settlements
                </h3>
                {settlements.length === 0 ? (
                  <p className="text-gray-500 italic dark:text-gray-400">All settled up! 🎉</p>
                ) : (
                  <ul className="space-y-3">
                    {settlements.map(({ from, to, amount }, i) => (
                      <li
                        key={i}
                        className="flex flex-wrap justify-between items-center bg-gray-50 border border-gray-200 rounded-md p-3 gap-2 dark:bg-gray-950 dark:border-gray-800"
                      >
                        <div>
                          <div className="text-sm">
                            {participantMap[from]?.name || from} pays {participantMap[to]?.name || to}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Auto computed</div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-semibold">₹{amount.toFixed(2)}</span>
                          <button
                            onClick={() => openPayModal(from, to, amount)}
                            className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md transition flex items-center gap-2 dark:bg-cyan-500 dark:hover:bg-cyan-600"
                            title="Settle via UPI"
                          >
                            <CreditCard size={14} /> Pay
                          </button>
                          <Link
                            to="/upi"
                            state={{ from: participantMap[from], to: participantMap[to], amount }}
                            className="px-3 py-1 bg-gray-100 border border-gray-300 text-gray-900 rounded-md hover:bg-gray-200 transition hidden md:inline-block dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700"
                          >
                            Open UPI Page
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </div>
        </main>
      </div>

      {/* Pay Modal */}
      <AnimatePresence>
        {payModal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => {
                if (!payModal.loading) closePayModal();
              }}
            />
            <motion.div
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 12, opacity: 0 }}
              className="relative w-full max-w-md bg-white border border-gray-200 rounded-2xl p-6 shadow-xl dark:bg-gray-900/95 dark:border-gray-800"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <ArrowRightCircle className="text-cyan-600 dark:text-cyan-400" />
                  <div>
                    <div className="font-semibold">Pay Now</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      {participantMap[payModal.from]?.name || payModal.from} →{" "}
                      {participantMap[payModal.to]?.name || payModal.to}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => !payModal.loading && closePayModal()}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mb-3">
                <div className="text-sm text-slate-600 dark:text-slate-400">Amount</div>
                <div className="text-2xl font-light font-serif">₹{payModal.amount.toFixed(2)}</div>
              </div>

              <div className="mb-4">
                <label className="text-sm text-slate-700 dark:text-slate-300 block mb-1">UPI ID (mock)</label>
                <input
                  value={payModal.upi ?? ""}
                  onChange={(e) => setPayModal((p) => ({ ...p, upi: e.target.value }))}
                  placeholder="example@upi"
                  className="w-full p-3 rounded-md bg-white border border-gray-300 focus:outline-none dark:bg-gray-950 dark:border-gray-800"
                  disabled={payModal.loading}
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handlePayNow}
                  className="flex-1 flex items-center justify-center gap-3 px-4 py-2 rounded-md bg-cyan-600 text-white font-semibold hover:bg-cyan-700 disabled:opacity-60 dark:bg-cyan-500 dark:hover:bg-cyan-600"
                  disabled={payModal.loading}
                >
                  {payModal.loading ? <Loader2 className="animate-spin" /> : <CreditCard />}
                  {payModal.loading ? "Processing..." : "Pay Now"}
                </button>

                <button
                  onClick={() => {
                    if (!payModal.loading) {
                      createSettlementExpense(payModal.from, payModal.to, payModal.amount);
                      showToast("Marked as paid (manual)", "success");
                      closePayModal();
                    }
                  }}
                  className="px-4 py-2 rounded-md bg-gray-100 border border-gray-300 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700"
                  disabled={payModal.loading}
                >
                  Mark Paid
                </button>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-500 mt-3">
                This is a mock payment flow for demo purposes.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast key="t" message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
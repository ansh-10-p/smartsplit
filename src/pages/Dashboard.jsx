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

function Toast({ message, type = "info", onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className={`fixed bottom-6 right-6 px-4 py-2 rounded shadow-lg text-white z-50 max-w-xs ${
        type === "error" ? "bg-red-500" : type === "success" ? "bg-green-500" : "bg-blue-500"
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

  // --- State Management (persisted) ---
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

  // participant lookup
  const participantMap = useMemo(() => {
    const map = {};
    participants.forEach((p) => (map[p.id] = p));
    return map;
  }, [participants]);

  // helpers
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
        s.filter((exp) => exp.paidBy !== id && !exp.splits.some((sp) => sp.participantId === id))
      );
      showToast(`Deleted participant "${participant.name}"`, "success");
    }
  };

  // add expense logic
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
    const expense = expenses.find((e) => e.id === id);
    if (!expense) return;
    if (window.confirm(`Delete expense "${expense.title}"?`)) {
      setExpenses((s) => s.filter((e) => e.id !== id));
      showToast(`Deleted expense "${expense.title}"`, "success");
    }
  };

  // compute balances
  const balances = useMemo(() => {
    const map = {};
    participants.forEach((p) => (map[p.id] = 0));
    expenses.forEach((ex) => {
      map[ex.paidBy] += ex.amount;
      ex.splits.forEach((s) => (map[s.participantId] -= s.value));
    });
    return map;
  }, [expenses, participants]);

  // settlement algorithm
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

  // Create settlement expense to reflect a transfer "from -> to" of amount
  const createSettlementExpense = (fromId, toId, amt) => {
    const e = {
      id: uid("exp"),
      title: `Settlement ${participantMap[fromId]?.name || fromId} → ${
        participantMap[toId]?.name || toId
      }`,
      amount: amt,
      paidBy: fromId,
      splits: [{ participantId: toId, value: amt }],
      createdAt: Date.now(),
      meta: { settlement: true },
    };
    setExpenses((s) => [e, ...s]);
  };

  // Pay modal handlers (mock UPI)
  const openPayModal = (from, to, amount) => {
    setPayModal({ open: true, from, to, amount, upi: "" });
  };

  const closePayModal = () => setPayModal({ open: false, from: null, to: null, amount: 0 });

  // simulate payment: random success/failure (90% success)
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
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-800 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <main>
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <motion.h1
                className="text-3xl md:text-4xl font-bold mb-1 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                Welcome back, {user?.username || "Friend"} 👋
              </motion.h1>
              <p className="text-slate-400">Split smarter. Settle faster. Stay friends forever.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-gray-900/60 border border-gray-800">
                <div className="text-xs text-slate-400">Your Balance</div>
                <div className="font-semibold">
                  ₹{Object.values(balances).reduce((s, v) => s + v, 0).toFixed(2)}
                </div>
              </div>
              <button
                onClick={() => {
                  const name = prompt("Enter participant name:");
                  if (name) addParticipant(name);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-600 transition"
              >
                <UserPlus size={16} /> Add
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Top cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl p-4 bg-gray-900/80 border border-gray-800 shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 font-semibold">
                    <Wallet className="text-cyan-400" /> Expenses
                  </div>
                  <div className="text-sm text-slate-400">{expenses.length} items</div>
                </div>
                <div className="text-sm text-slate-300">Quick actions</div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setShowForm((s) => !s)}
                    className="px-3 py-2 rounded-md bg-cyan-500 text-black font-semibold hover:bg-cyan-600"
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
                    className="px-3 py-2 rounded-md bg-gray-800 hover:bg-gray-700"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="rounded-xl p-4 bg-gray-900/80 border border-gray-800 shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 font-semibold">
                    <TrendingUp className="text-cyan-400" /> Balances
                  </div>
                  <div className="text-sm text-slate-400">Live</div>
                </div>
                <div className="text-sm text-slate-300">
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

              <div className="rounded-xl p-4 bg-gray-900/80 border border-gray-800 shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 font-semibold">
                    <Divide className="text-cyan-400" /> Settlements
                  </div>
                  <div className="text-sm text-slate-400">{settlements.length}</div>
                </div>
                <div className="text-sm text-slate-300">Pay or request to settle balances.</div>

                <div className="mt-3">
                  {settlements.slice(0, 3).map((s, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 mb-2">
                      <div className="text-sm">
                        {participantMap[s.from]?.name || s.from} →{" "}
                        {participantMap[s.to]?.name || s.to}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="font-semibold">₹{s.amount.toFixed(2)}</div>
                        <button
                          onClick={() => openPayModal(s.from, s.to, s.amount)}
                          className="px-2 py-1 rounded-md bg-cyan-500 text-black hover:bg-cyan-600 flex items-center gap-2"
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
                  className="p-6 rounded-2xl bg-gray-900/70 border border-gray-700 shadow-xl mb-4 backdrop-blur-lg"
                >
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Wallet className="text-cyan-400" /> New Expense
                  </h2>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Expense Title"
                      className="p-3 rounded-md bg-gray-950 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                    <input
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Amount (₹)"
                      type="number"
                      min="0"
                      className="p-3 rounded-md bg-gray-950 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                    <select
                      value={paidBy}
                      onChange={(e) => setPaidBy(e.target.value)}
                      className="p-3 rounded-md bg-gray-950 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    >
                      {participants.map((p) => (
                        <option value={p.id} key={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4 flex items-center gap-3 flex-wrap">
                    <label className="text-sm">Split Type:</label>
                    <select
                      value={splitType}
                      onChange={(e) => setSplitType(e.target.value)}
                      className="p-2 rounded-md bg-gray-950 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
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
                            className="flex-1 p-2 rounded-md bg-gray-950 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={addExpense}
                    className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-semibold transition"
                  >
                    Add Expense
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Participants + Expenses lists */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Participants */}
              <section className="bg-gray-900/80 rounded-xl p-6 border border-gray-800 shadow-lg">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <UserPlus className="text-cyan-400" /> Participants
                </h3>
                {participants.length === 0 ? (
                  <p className="text-gray-400 italic">No participants added yet.</p>
                ) : (
                  <ul className="grid sm:grid-cols-2 gap-3">
                    {participants.map((p) => (
                      <li
                        key={p.id}
                        className="flex justify-between items-center bg-gray-950 rounded-md p-3"
                      >
                        <span>{p.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-400">
                            ₹{(balances[p.id] ?? 0).toFixed(2)}
                          </span>
                          <button
                            onClick={() => deleteParticipant(p.id)}
                            className="text-red-500 hover:text-red-700"
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
              <section className="bg-gray-900/80 rounded-xl p-6 border border-gray-800 shadow-lg">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Wallet className="text-cyan-400" /> Expenses
                </h3>
                {expenses.length === 0 ? (
                  <p className="text-gray-400 italic">No expenses recorded yet.</p>
                ) : (
                  <ul className="space-y-3 max-h-96 overflow-auto pr-2">
                    {expenses.map((ex) => (
                      <li
                        key={ex.id}
                        className="bg-gray-950 rounded-md p-4 flex flex-col md:flex-row md:justify-between md:items-center"
                      >
                        <div>
                          <div className="text-lg font-semibold">{ex.title}</div>
                          <div className="text-sm text-gray-400">
                            Paid by: {participantMap[ex.paidBy]?.name || "Unknown"} | ₹
                            {ex.amount.toFixed(2)}
                          </div>
                          <div className="text-sm mt-2 flex flex-wrap gap-2">
                            {ex.splits.map((sp) => (
                              <span
                                key={sp.participantId}
                                className="px-2 py-1 rounded bg-cyan-700/50 text-xs"
                              >
                                {participantMap[sp.participantId]?.name || "?"}: ₹
                                {sp.value.toFixed(2)}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="mt-3 md:mt-0 flex gap-3">
                          <button
                            onClick={() => deleteExpense(ex.id)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md transition"
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
              <section className="bg-gray-900/80 rounded-xl p-6 border border-gray-800 shadow-lg">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="text-cyan-400" /> Balance Summary
                </h3>
                <ul className="space-y-2">
                  {participants.map((p) => {
                    const bal = balances[p.id] ?? 0;
                    return (
                      <li
                        key={p.id}
                        className={`flex justify-between items-center px-4 py-2 rounded ${
                          bal > 0
                            ? "bg-green-700/70"
                            : bal < 0
                            ? "bg-red-700/70"
                            : "bg-gray-700/70"
                        }`}
                      >
                        <span>{p.name}</span>
                        <span>₹{bal.toFixed(2)}</span>
                      </li>
                    );
                  })}
                </ul>
              </section>

              <section className="bg-gray-900/80 rounded-xl p-6 border border-gray-800 shadow-lg">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Divide className="text-cyan-400" /> Settlements
                </h3>
                {settlements.length === 0 ? (
                  <p className="text-gray-400 italic">All settled up! 🎉</p>
                ) : (
                  <ul className="space-y-3">
                    {settlements.map(({ from, to, amount }, i) => (
                      <li
                        key={i}
                        className="flex flex-wrap justify-between items-center bg-gray-950 rounded-md p-3 gap-2"
                      >
                        <div>
                          <div className="text-sm">
                            {participantMap[from]?.name || from} pays{" "}
                            {participantMap[to]?.name || to}
                          </div>
                          <div className="text-xs text-slate-400">Auto computed</div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-semibold">₹{amount.toFixed(2)}</span>
                          <button
                            onClick={() => openPayModal(from, to, amount)}
                            className="px-3 py-1 bg-cyan-500 text-black rounded-md hover:bg-cyan-600 transition flex items-center gap-2"
                            title="Settle via UPI"
                          >
                            <CreditCard size={14} /> Pay
                          </button>
                          <Link
                            to="/upi"
                            state={{ from: participantMap[from], to: participantMap[to], amount }}
                            className="px-3 py-1 bg-gray-800 rounded-md hover:bg-gray-700 transition hidden md:inline-block"
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
              className="relative w-full max-w-md bg-gray-900/95 border border-gray-800 rounded-2xl p-6 shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <ArrowRightCircle className="text-cyan-400" />
                  <div>
                    <div className="font-semibold">Pay Now</div>
                    <div className="text-xs text-slate-400">
                      {participantMap[payModal.from]?.name || payModal.from} →{" "}
                      {participantMap[payModal.to]?.name || payModal.to}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => !payModal.loading && closePayModal()}
                  className="p-1 rounded hover:bg-gray-800"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mb-3">
                <div className="text-sm text-slate-400">Amount</div>
                <div className="text-2xl font-bold">₹{payModal.amount.toFixed(2)}</div>
              </div>

              <div className="mb-4">
                <label className="text-sm text-slate-300 block mb-1">UPI ID (mock)</label>
                <input
                  value={payModal.upi ?? ""}
                  onChange={(e) => setPayModal((p) => ({ ...p, upi: e.target.value }))}
                  placeholder="example@upi"
                  className="w-full p-3 rounded-md bg-gray-950 border border-gray-800 focus:outline-none"
                  disabled={payModal.loading}
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handlePayNow}
                  className="flex-1 flex items-center justify-center gap-3 px-4 py-2 rounded-md bg-cyan-500 text-black font-semibold hover:bg-cyan-600 disabled:opacity-60"
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
                  className="px-4 py-2 rounded-md bg-gray-800 hover:bg-gray-700"
                  disabled={payModal.loading}
                >
                  Mark Paid
                </button>
              </div>

              <div className="text-xs text-slate-500 mt-3">
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
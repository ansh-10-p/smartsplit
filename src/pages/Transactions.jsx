// src/pages/Transactions.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  PlusCircle,
  DollarSign,
  Trash2,
  X,
  Mic,
  StopCircle,
  Trophy,
  Sparkles,
  Flame,
  Search,
  TrendingUp,
  TrendingDown,
  Wallet,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

// Storage keys (with legacy migration)
const EXP_KEY_V1 = "smartsplit_expenses_v1";
const INC_KEY_V1 = "smartsplit_incomes_v1";
const EXP_KEY_LEGACY = "smartsplit_expenses";
const INC_KEY_LEGACY = "smartsplit_incomes";
const GAMIFY_KEY = "smartsplit_gamification_v1";
const PART_KEY = "smartsplit_participants_v1";

// --------------------------------------
// Helpers
// --------------------------------------
function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}
function todayISODate() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}
function isYesterdayISO(prevISO) {
  if (!prevISO) return false;
  const prev = new Date(prevISO);
  const now = new Date();
  prev.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diff = (now - prev) / (1000 * 60 * 60 * 24);
  return diff === 1;
}

// --------------------------------------
// AI-like categorization (keyword heuristic)
// --------------------------------------
function aiCategorizeExpense(name) {
  const text = (name || "").toLowerCase();
  const categories = {
    Food: ["chai", "tea", "coffee", "snack", "pizza", "burger", "restaurant", "food", "cafe", "lunch", "dinner", "breakfast"],
    Shopping: ["shopping", "clothes", "shoe", "mall", "amazon", "flipkart", "myntra"],
    Travel: ["uber", "ola", "fuel", "petrol", "diesel", "cab", "taxi", "flight", "train", "bus", "travel"],
    Rent: ["rent", "landlord", "lease"],
    Utilities: ["electricity", "water", "internet", "wifi", "broadband", "gas", "phone", "recharge", "dth"],
    Entertainment: ["movie", "netflix", "spotify", "bookmyshow", "game", "gaming"],
    Groceries: ["grocery", "groceries", "bigbasket", "dmart", "mart", "supermarket"],
    Health: ["medicine", "pharmacy", "doctor", "hospital", "clinic"],
    Education: ["book", "tuition", "course", "udemy", "byju"],
  };
  let best = { cat: "Others", score: 0 };
  for (const [cat, kws] of Object.entries(categories)) {
    const score = kws.reduce((s, kw) => (text.includes(kw) ? s + 1 : s), 0);
    if (score > best.score) best = { cat, score };
  }
  const words = text.split(/\s+/).filter(Boolean).length || 1;
  const confidence = Math.min(0.99, best.score / Math.min(4, words));
  return { category: best.cat, confidence };
}

// --------------------------------------
// Voice recognition hook (Web Speech API)
// --------------------------------------
function useSpeechRecognition() {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recogRef = useRef(null);

  useEffect(() => {
    const SR =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition ||
      window.mozSpeechRecognition ||
      window.msSpeechRecognition;
    if (SR) {
      setSupported(true);
      const recog = new SR();
      recog.lang = "en-IN";
      recog.interimResults = false;
      recog.maxAlternatives = 1;
      recog.onresult = (e) => {
        const t = e.results?.[0]?.[0]?.transcript || "";
        setTranscript(t);
      };
      recog.onend = () => setListening(false);
      recogRef.current = recog;
    }
  }, []);

  const start = () => {
    if (!recogRef.current) return;
    setTranscript("");
    setListening(true);
    try {
      recogRef.current.start();
    } catch { }
  };
  const stop = () => {
    if (!recogRef.current) return;
    try {
      recogRef.current.stop();
    } catch { }
  };

  return { supported, listening, transcript, start, stop };
}

// Parse utterance like: "Add ₹200 chai bill by Raj" or "₹500 petrol"
function parseExpenseUtterance(text) {
  const t = (text || "").toLowerCase();
  let amount = 0;
  const amtMatch = t.match(/(?:₹|rs\.?\s*)?(\d+(?:\.\d+)?)/i);
  if (amtMatch) amount = parseFloat(amtMatch[1]);
  let remainder = t.replace(/add|rupees|rs\.?|₹/g, "").trim();
  const byIdx = remainder.lastIndexOf(" by ");
  const namePart = byIdx >= 0 ? remainder.slice(0, byIdx).trim() : remainder;
  const name = namePart || "Unnamed expense";
  const { category, confidence } = aiCategorizeExpense(name);
  return { amount, name, category, confidence };
}

// --------------------------------------
// Confirm Modal
// --------------------------------------
const ConfirmModal = ({ isOpen, onConfirm, onCancel, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 p-6 rounded-xl max-w-sm w-full text-center shadow-xl"
      >
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        <p className="mb-6 text-lg text-slate-800 dark:text-slate-100">{message}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirm}
            className="px-5 py-2 rounded-md text-white bg-red-600 hover:bg-red-700"
          >
            Confirm
          </button>
          <button
            onClick={onCancel}
            className="px-5 py-2 rounded-md bg-gray-100 border border-gray-300 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// --------------------------------------
// Profit/Loss Chart
// --------------------------------------
const ProfitLossChart = ({ totalIncome, totalExpense }) => {
  const data = [
    { name: "Income", amount: totalIncome },
    { name: "Expense", amount: totalExpense },
  ];
  const profit = totalIncome - totalExpense;

  return (
    <motion.div
      className="rounded-3xl p-6 shadow-2xl ring-1 ring-white/20 bg-gradient-to-br from-white/80 to-white/60 dark:from-gray-800/80 dark:to-gray-900/60 backdrop-blur-xl relative overflow-hidden"
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -4, shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
    >
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 opacity-50" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-2xl text-slate-800 dark:text-white flex items-center gap-2">
            {profit >= 0 ? (
              <>
                <TrendingUp className="w-6 h-6 text-emerald-500" />
                Profit Summary
              </>
            ) : (
              <>
                <TrendingDown className="w-6 h-6 text-red-500" />
                Loss Summary
              </>
            )}
          </h3>
          <motion.div
            className={`px-4 py-2 rounded-full font-semibold text-sm ${profit >= 0 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            {profit >= 0 ? `+₹${profit.toFixed(2)}` : `-₹${Math.abs(profit).toFixed(2)}`}
          </motion.div>
        </div>

        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ left: 10, right: 10 }}>
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              formatter={(v) => `₹${Number(v).toFixed(2)}`}
              contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none", color: "white", padding: "12px" }}
              labelStyle={{ color: "#cbd5e1", fontWeight: "600" }}
            />
            <Bar
              dataKey="amount"
              fill={profit >= 0 ? "url(#profitGradient)" : "url(#lossGradient)"}
              barSize={60}
              radius={[12, 12, 0, 0]}
            >
              <defs>
                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={1} />
                </linearGradient>
                <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#dc2626" stopOpacity={1} />
                </linearGradient>
              </defs>
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

// --------------------------------------
// Gamification Panel (points, streak, badges, leaderboard)
// --------------------------------------
const GamificationPanel = ({ gamify, leaderboard }) => {
  return (
    <motion.div
      className="rounded-3xl p-6 shadow-2xl ring-1 ring-white/20 bg-gradient-to-br from-amber-50/90 to-orange-50/80 dark:from-gray-800/90 dark:to-gray-900/80 backdrop-blur-xl relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Decorative gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-orange-500/5 to-red-500/10 pointer-events-none" />

      <div className="relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {/* Karma Points */}
          <motion.div
            className="flex items-center gap-3 p-4 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm shadow-lg"
            whileHover={{ scale: 1.05, y: -2 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div
              className="p-3 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <Trophy className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <div className="text-xs font-medium text-slate-600 dark:text-gray-400">Karma Points</div>
              <div className="text-2xl font-extrabold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">{gamify.points}</div>
            </div>
          </motion.div>

          {/* Streak */}
          <motion.div
            className="flex items-center gap-3 p-4 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm shadow-lg"
            whileHover={{ scale: 1.05, y: -2 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div
              className="p-3 rounded-xl bg-gradient-to-br from-orange-400 to-red-600 shadow-lg"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Flame className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <div className="text-xs font-medium text-slate-600 dark:text-gray-400">Streak</div>
              <div className="text-2xl font-extrabold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {gamify.streak} {gamify.streak === 1 ? "day" : "days"}
              </div>
            </div>
          </motion.div>

          {/* Badges */}
          <motion.div
            className="flex items-start gap-3 p-4 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm shadow-lg"
            whileHover={{ scale: 1.05, y: -2 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div
              className="p-3 rounded-xl bg-gradient-to-br from-purple-400 to-pink-600 shadow-lg"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <Sparkles className="w-6 h-6 text-white" />
            </motion.div>
            <div className="flex-1">
              <div className="text-xs font-medium text-slate-600 dark:text-gray-400 mb-2">Badges</div>
              <div className="flex flex-wrap gap-1.5">
                {gamify.badges?.length ? (
                  gamify.badges.map((b, idx) => (
                    <motion.span
                      key={b}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="px-2 py-1 text-xs font-semibold rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                    >
                      {b}
                    </motion.span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 dark:text-gray-500">Earn your first badge!</span>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Leaderboard */}
        <div>
          <h4 className="text-sm font-bold text-slate-700 dark:text-gray-200 mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Leaderboard
          </h4>
          <ul className="space-y-2">
            {leaderboard.map((row, idx) => (
              <motion.li
                key={row.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.02, x: 4 }}
                className="flex items-center justify-between rounded-xl px-4 py-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-md hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-xs w-7 h-7 grid place-items-center rounded-full font-bold ${idx === 0 ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg" :
                      idx === 1 ? "bg-gradient-to-br from-gray-300 to-gray-500 text-white shadow-md" :
                        idx === 2 ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-md" :
                          "bg-slate-200 text-slate-700 dark:bg-gray-700 dark:text-gray-300"
                    }`}>
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-white">{row.name}</span>
                </div>
                <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">{row.points} pts</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

// --------------------------------------
// Main Transactions Component
// --------------------------------------
const Transactions = () => {
  // Migrate legacy
  const initialExpenses = load(EXP_KEY_V1, null) ?? load(EXP_KEY_LEGACY, []);
  const initialIncomes = load(INC_KEY_V1, null) ?? load(INC_KEY_LEGACY, []);

  const [expenses, setExpenses] = useState(initialExpenses);
  const [incomes, setIncomes] = useState(initialIncomes);

  useEffect(() => save(EXP_KEY_V1, expenses), [expenses]);
  useEffect(() => save(INC_KEY_V1, incomes), [incomes]);

  // Gamification state
  const [gamify, setGamify] = useState(() =>
    load(GAMIFY_KEY, { points: 0, streak: 0, lastActiveISO: null, badges: [] })
  );
  useEffect(() => save(GAMIFY_KEY, gamify), [gamify]);

  // Participants to enrich leaderboard (optional)
  const participants = useMemo(() => load(PART_KEY, []), []);
  const leaderboard = useMemo(() => {
    const others = participants
      .map((p) => ({ name: p.name, points: p.points ?? Math.floor(Math.random() * 200) }))
      .slice(0, 4);
    const rows = [{ name: "You", points: gamify.points }, ...others];
    return rows.sort((a, b) => b.points - a.points).slice(0, 5);
  }, [participants, gamify.points]);

  // Toolbar: month filter + search
  const [filterMonth, setFilterMonth] = useState("All");
  const [search, setSearch] = useState("");

  const uniqueMonths = useMemo(() => {
    const set = new Set(["All"]);
    [...expenses, ...incomes].forEach((t) => t.month && set.add(t.month));
    return [...set];
  }, [expenses, incomes]);

  // Delete confirmation
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const requestDelete = (type, id) => {
    setDeleteTarget({ type, id });
    setModalOpen(true);
  };
  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "expense") {
      setExpenses((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      awardPoints("delete_expense", -1);
    } else {
      setIncomes((prev) => prev.filter((i) => i.id !== deleteTarget.id));
      awardPoints("delete_income", -1);
    }
    setDeleteTarget(null);
    setModalOpen(false);
  };
  const cancelDelete = () => {
    setDeleteTarget(null);
    setModalOpen(false);
  };

  // Apply filters
  const filteredExpenses = useMemo(() => {
    const monthFiltered =
      filterMonth === "All" ? expenses : expenses.filter((e) => e.month === filterMonth);
    if (!search.trim()) return monthFiltered;
    const q = search.toLowerCase();
    return monthFiltered.filter(
      (e) => e.name?.toLowerCase().includes(q) || (e.category || "").toLowerCase().includes(q)
    );
  }, [expenses, filterMonth, search]);

  const filteredIncomes = useMemo(() => {
    const monthFiltered =
      filterMonth === "All" ? incomes : incomes.filter((i) => i.month === filterMonth);
    if (!search.trim()) return monthFiltered;
    const q = search.toLowerCase();
    return monthFiltered.filter((i) => i.source?.toLowerCase().includes(q));
  }, [incomes, filterMonth, search]);

  // Totals
  const totalExpense = filteredExpenses.reduce((s, e) => s + e.amount, 0);
  const totalIncome = filteredIncomes.reduce((s, i) => s + i.amount, 0);
  const balance = totalIncome - totalExpense;

  // Gamification awarding
  function awardPoints(reason, delta, options = {}) {
    setGamify((g) => {
      const today = todayISODate();
      const newPoints = Math.max(0, (g.points || 0) + delta);
      let newStreak = g.streak || 0;
      if (options.countAsActivity) {
        if (g.lastActiveISO && isYesterdayISO(g.lastActiveISO)) {
          newStreak = Math.max(1, newStreak + 1);
        } else if (
          !g.lastActiveISO ||
          new Date(g.lastActiveISO).toDateString() !== new Date(today).toDateString()
        ) {
          newStreak = 1;
        }
      }
      const badges = new Set(g.badges || []);
      if (newStreak >= 3) badges.add("3-day Streak");
      if (newStreak >= 7) badges.add("7-day Streak");
      if (newPoints >= 50) badges.add("Bronze");
      if (newPoints >= 200) badges.add("Silver");
      if (newPoints >= 500) badges.add("Gold");

      return {
        points: newPoints,
        streak: newStreak,
        lastActiveISO: options.countAsActivity ? today : g.lastActiveISO,
        badges: Array.from(badges),
      };
    });
  }

  const handleAddExpense = (expense, meta = {}) => {
    setExpenses((prev) => [...prev, expense]);
    const base = 3;
    const amtBonus = Math.floor(expense.amount / 200);
    const voiceBonus = meta.viaVoice ? 2 : 0;
    const aiBonus = meta.aiCategorized ? 1 : 0;
    awardPoints("add_expense", base + amtBonus + voiceBonus + aiBonus, { countAsActivity: true });
  };

  const handleAddIncome = (income) => {
    setIncomes((prev) => [...prev, income]);
    const base = 2;
    const amtBonus = Math.floor(income.amount / 500);
    awardPoints("add_income", base + amtBonus, { countAsActivity: true });
  };

  return (
    <div className="min-h-screen px-6 pt-20 pb-10 bg-gradient-to-b from-gray-50 via-white to-gray-100 text-gray-900 dark:from-gray-900 dark:to-gray-800 dark:text-white transition-colors">
      <motion.h1
        className="text-4xl font-light font-serif mb-8 flex items-center gap-3 tracking-wide"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        SmartSplit Dashboard <ArrowRight className="w-6 h-6 text-emerald-600 dark:text-green-400" />
      </motion.h1>

      {/* Gamification */}
      <div className="mb-8">
        <GamificationPanel gamify={gamify} leaderboard={leaderboard} />
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
        <div className="max-w-xs">
          <label htmlFor="monthFilter" className="block mb-1 font-semibold text-slate-700 dark:text-gray-300">
            Filter by Month
          </label>
          <select
            id="monthFilter"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="w-full p-2 rounded-md bg-white border border-gray-300 focus:outline-none dark:bg-gray-800 dark:border-gray-700"
          >
            {uniqueMonths.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[220px]">
          <label className="block mb-1 font-semibold text-slate-700 dark:text-gray-300">Search</label>
          <div className="flex items-center gap-2 p-2 rounded-md bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700">
            <Search className="text-slate-500 dark:text-slate-400" size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Find expense/income..."
              className="flex-1 bg-transparent outline-none text-slate-700 dark:text-gray-100"
            />
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <SummaryCard title="Total Income" value={`₹${totalIncome.toFixed(2)}`} color="green" />
        <SummaryCard title="Total Expense" value={`₹${totalExpense.toFixed(2)}`} color="red" />
        <SummaryCard title="Balance" value={`₹${balance.toFixed(2)}`} color="blue" />
      </div>

      {/* Profit / Loss Chart */}
      <div className="mb-8">
        <ProfitLossChart totalIncome={totalIncome} totalExpense={totalExpense} />
      </div>

      {/* Forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <IncomeForm onAddIncome={handleAddIncome} />
        <ExpenseForm onAddExpense={handleAddExpense} />
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <ExpenseList expenses={filteredExpenses} onDelete={(id) => requestDelete("expense", id)} />
        <IncomeList incomes={filteredIncomes} onDelete={(id) => requestDelete("income", id)} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ExpenseChart expenses={filteredExpenses} />
        <ExpensePieChart expenses={filteredExpenses} />
      </div>

      {/* Confirm delete modal */}
      <ConfirmModal
        isOpen={modalOpen}
        message={`Are you sure you want to delete this ${deleteTarget?.type}?`}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
};

// --------------------------------------
// Expense Form (AI categorization + Voice input)
// --------------------------------------
const ExpenseForm = ({ onAddExpense }) => {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Auto");
  const [aiHint, setAiHint] = useState(null);
  const [autoSubmitVoice, setAutoSubmitVoice] = useState(true);

  const { supported, listening, transcript, start, stop } = useSpeechRecognition();

  useEffect(() => {
    if (!name.trim()) {
      setAiHint(null);
      if (category === "Auto") setCategory("Auto");
      return;
    }
    const { category: cat, confidence } = aiCategorizeExpense(name);
    setAiHint({ cat, confidence });
    if (category === "Auto") setCategory(cat);
  }, [name]); // eslint-disable-line

  useEffect(() => {
    if (!transcript) return;
    const parsed = parseExpenseUtterance(transcript);
    if (parsed.amount) setAmount(String(parsed.amount));
    if (parsed.name) setName(parsed.name);
    if (parsed.category) setCategory(parsed.category);
    if (autoSubmitVoice && parsed.amount && parsed.name) {
      handleSubmit(undefined, { viaVoice: true, aiCategorized: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript]);

  const handleSubmit = (e, meta = {}) => {
    if (e) e.preventDefault();
    if (!name.trim() || !amount) return;
    const monthShort = new Date().toLocaleString("default", { month: "short" });
    const expense = {
      id: uid("exp"),
      name: name.trim(),
      amount: parseFloat(amount),
      category: category === "Auto" ? aiHint?.cat || "Others" : category,
      month: monthShort,
      createdAt: new Date().toISOString(),
    };
    onAddExpense(expense, {
      viaVoice: !!meta.viaVoice,
      aiCategorized: category === "Auto" || aiHint?.cat === category,
    });
    setName("");
    setAmount("");
    setCategory("Auto");
    setAiHint(null);
  };

  return (
    <motion.div
      className="rounded-2xl p-5 shadow-lg ring-1 ring-black/10 bg-white dark:ring-white/10 dark:bg-gray-800"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
        <PlusCircle className="w-5 h-5 text-red-500" /> Add Expense
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Expense name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 p-2 rounded-md bg-white border border-gray-300 focus:outline-none dark:bg-gray-700 dark:border-gray-600"
          />
          {supported ? (
            listening ? (
              <button
                type="button"
                onClick={stop}
                className="p-2 rounded-md bg-red-600 hover:bg-red-700 text-white"
                title="Stop voice"
              >
                <StopCircle className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={start}
                className="p-2 rounded-md bg-gray-100 border border-gray-300 hover:bg-gray-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                title="Voice input"
              >
                <Mic className="w-5 h-5" />
              </button>
            )
          ) : null}
        </div>

        {aiHint && (
          <div className="text-xs text-slate-600 dark:text-gray-300">
            AI suggests: <span className="text-purple-600 dark:text-purple-300">{aiHint.cat}</span>{" "}
            ({Math.round((aiHint.confidence || 0) * 100)}%)
          </div>
        )}

        <input
          type="number"
          placeholder="Amount"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="p-2 rounded-md bg-white border border-gray-300 focus:outline-none dark:bg-gray-700 dark:border-gray-600"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="p-2 rounded-md bg-white border border-gray-300 focus:outline-none dark:bg-gray-700 dark:border-gray-600"
        >
          <option>Auto</option>
          <option>Food</option>
          <option>Shopping</option>
          <option>Travel</option>
          <option>Rent</option>
          <option>Utilities</option>
          <option>Entertainment</option>
          <option>Groceries</option>
          <option>Health</option>
          <option>Education</option>
          <option>Others</option>
        </select>

        {supported && (
          <label className="text-xs text-slate-600 dark:text-gray-400 flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoSubmitVoice}
              onChange={(e) => setAutoSubmitVoice(e.target.checked)}
            />
            Auto-submit voice input when parsed successfully
          </label>
        )}

        <button
          type="submit"
          className="rounded-md py-2 font-semibold text-white bg-red-600 hover:bg-red-700"
        >
          Add Expense
        </button>
      </form>
    </motion.div>
  );
};

// --------------------------------------
// Income Form
// --------------------------------------
const IncomeForm = ({ onAddIncome }) => {
  const [source, setSource] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!source.trim() || !amount) return;
    onAddIncome({
      id: uid("inc"),
      source: source.trim(),
      amount: parseFloat(amount),
      month: new Date().toLocaleString("default", { month: "short" }),
      createdAt: new Date().toISOString(),
    });
    setSource("");
    setAmount("");
  };

  return (
    <motion.div
      className="rounded-2xl p-5 shadow-lg ring-1 ring-black/10 bg-white dark:ring-white/10 dark:bg-gray-800"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
        <PlusCircle className="w-5 h-5 text-green-500" /> Add Income
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Income source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="p-2 rounded-md bg-white border border-gray-300 focus:outline-none dark:bg-gray-700 dark:border-gray-600"
        />
        <input
          type="number"
          placeholder="Amount"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="p-2 rounded-md bg-white border border-gray-300 focus:outline-none dark:bg-gray-700 dark:border-gray-600"
        />
        <button
          type="submit"
          className="rounded-md py-2 font-semibold text-white bg-green-600 hover:bg-green-700"
        >
          Add Income
        </button>
      </form>
    </motion.div>
  );
};

// --------------------------------------
// Summary Card
// --------------------------------------
const SummaryCard = ({ title, value, color }) => {
  const colorConfig = {
    green: {
      gradient: "from-emerald-500 via-green-500 to-teal-500",
      icon: TrendingUp,
      glow: "shadow-emerald-500/40",
    },
    red: {
      gradient: "from-red-500 via-rose-500 to-pink-500",
      icon: TrendingDown,
      glow: "shadow-red-500/40",
    },
    blue: {
      gradient: "from-blue-500 via-indigo-500 to-purple-500",
      icon: Wallet,
      glow: "shadow-blue-500/40",
    },
  };

  const config = colorConfig[color];
  const Icon = config.icon;

  return (
    <motion.div
      className={`rounded-3xl p-6 shadow-2xl ${config.glow} bg-gradient-to-br ${config.gradient} text-white flex flex-col items-center justify-center backdrop-blur-sm relative overflow-hidden group`}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, type: "spring" }}
      whileHover={{ scale: 1.05, y: -6, shadow: "0 30px 60px -15px rgba(0, 0, 0, 0.3)" }}
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />

      <motion.div
        className="relative z-10 flex flex-col items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.div
          className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm"
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 0.6 }}
        >
          <Icon className="w-8 h-8" />
        </motion.div>
        <h3 className="text-sm font-semibold uppercase tracking-wider opacity-90">{title}</h3>
        <motion.p
          className="text-4xl font-extrabold font-mono"
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        >
          {value}
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

// --------------------------------------
// Expense List
// --------------------------------------
const ExpenseList = ({ expenses, onDelete }) => (
  <motion.div
    className="rounded-2xl p-6 shadow-xl ring-1 ring-slate-200 dark:ring-slate-700 bg-white/90 backdrop-blur-sm dark:bg-gray-800/90 relative overflow-hidden"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    {/* Gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-pink-500/5 pointer-events-none" />

    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white relative z-10">
      <motion.div
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.5 }}
        className="p-2 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 text-white shadow-lg"
      >
        <DollarSign className="w-5 h-5" />
      </motion.div>
      Expenses
    </h2>
    {expenses.length === 0 ? (
      <p className="text-slate-600 dark:text-gray-400 text-center py-8 relative z-10">No expenses for this month.</p>
    ) : (
      <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-80 overflow-y-auto relative z-10">
        {expenses.map((e, idx) => (
          <motion.li
            key={e.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ scale: 1.02, x: 4 }}
            className="flex justify-between items-center py-3 px-2 rounded-lg hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/10 dark:hover:to-pink-900/10 transition-all"
          >
            <div>
              <p className="font-semibold text-slate-800 dark:text-white">{e.name}</p>
              <p className="text-sm text-slate-500 dark:text-gray-400">{e.category || "Others"}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-800 dark:text-white font-medium">₹{e.amount.toFixed(2)}</span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onDelete(e.id)}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                aria-label={`Delete expense ${e.name}`}
                title="Delete"
              >
                <Trash2 className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.li>
        ))}
      </ul>
    )}
  </motion.div>
);

// --------------------------------------
// Income List
// --------------------------------------
const IncomeList = ({ incomes, onDelete }) => (
  <motion.div
    className="rounded-2xl p-6 shadow-xl ring-1 ring-slate-200 dark:ring-slate-700 bg-white/90 backdrop-blur-sm dark:bg-gray-800/90 relative overflow-hidden"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
  >
    {/* Gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5 pointer-events-none" />

    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white relative z-10">
      <motion.div
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.5 }}
        className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 text-white shadow-lg"
      >
        <DollarSign className="w-5 h-5" />
      </motion.div>
      Incomes
    </h2>
    {incomes.length === 0 ? (
      <p className="text-slate-600 dark:text-gray-400 text-center py-8 relative z-10">No incomes for this month.</p>
    ) : (
      <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-80 overflow-y-auto relative z-10">
        {incomes.map((i, idx) => (
          <motion.li
            key={i.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ scale: 1.02, x: 4 }}
            className="flex justify-between items-center py-3 px-2 rounded-lg hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 dark:hover:from-emerald-900/10 dark:hover:to-green-900/10 transition-all"
          >
            <div>
              <p className="font-semibold text-slate-800 dark:text-white">{i.source}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-800 dark:text-white font-medium">₹{i.amount.toFixed(2)}</span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onDelete(i.id)}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                aria-label={`Delete income ${i.source}`}
                title="Delete"
              >
                <Trash2 className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.li>
        ))}
      </ul>
    )}
  </motion.div>
);

// --------------------------------------
// Expense Bar Chart (by category)
// --------------------------------------
const ExpenseChart = ({ expenses }) => {
  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category || "Others"] = (acc[e.category || "Others"] || 0) + e.amount;
    return acc;
  }, {});
  const data = Object.entries(categoryTotals).map(([category, amount]) => ({ category, amount }));

  return (
    <motion.div
      className="rounded-2xl p-5 shadow-lg ring-1 ring-black/10 bg-white dark:ring-white/10 dark:bg-gray-800"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="mb-4 font-semibold text-xl text-red-600 dark:text-red-400">Expenses by Category</h3>
      {data.length === 0 ? (
        <p className="text-slate-600 dark:text-gray-400">No expenses to show.</p>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} margin={{ left: 10, right: 10 }}>
            <XAxis dataKey="category" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              formatter={(v) => `₹${Number(v).toFixed(2)}`}
              contentStyle={{ backgroundColor: "#0f172a", borderRadius: "6px", border: "none", color: "white" }}
              labelStyle={{ color: "#cbd5e1" }}
            />
            <Bar dataKey="amount" fill="#f87171" barSize={48} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
};

// --------------------------------------
// Expense Pie Chart
// --------------------------------------
const ExpensePieChart = ({ expenses }) => {
  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category || "Others"] = (acc[e.category || "Others"] || 0) + e.amount;
    return acc;
  }, {});
  const data = Object.entries(categoryTotals).map(([category, amount]) => ({
    name: category,
    value: amount,
  }));
  const COLORS = ["#f87171", "#fb923c", "#facc15", "#4ade80", "#60a5fa", "#a78bfa", "#34d399"];

  return (
    <motion.div
      className="rounded-2xl p-5 shadow-lg ring-1 ring-black/10 bg-white dark:ring-white/10 dark:bg-gray-800"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="mb-4 font-semibold text-xl text-red-600 dark:text-red-400">Expenses Distribution</h3>
      {data.length === 0 ? (
        <p className="text-slate-600 dark:text-gray-400">No expenses to show.</p>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={86} label>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v) => `₹${Number(v).toFixed(2)}`}
              contentStyle={{ backgroundColor: "#0f172a", borderRadius: "6px", border: "none", color: "white" }}
              labelStyle={{ color: "#cbd5e1" }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
};

export default Transactions;
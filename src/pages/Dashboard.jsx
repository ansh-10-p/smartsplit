import React, { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../App";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  Wallet,
  TrendingUp,
  Divide,
  X,
  CreditCard,
  Loader2,
  ArrowRightCircle,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Users,
  Search,
  Filter,
  Calendar,
  Tag,
  UserCircle,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Eye,
  Trash2,
  ArrowRight,
  Receipt,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NumberFlow from "@number-flow/react";
import { ToastContainer } from "@/components/ui/toast-custom";
import { DashboardCard } from "@/components/DashboardCard";

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



// Empty State Component
function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm">{description}</p>
      {action}
    </motion.div>
  );
}

// Skeleton Loader
function SkeletonLoader() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex gap-4 flex-1">
            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
            </div>
          </div>
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-20" />
        </div>
      ))}
    </div>
  );
}

function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

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

  const groupExpenses = useMemo(() => expenses.filter(isGroupExpense), [expenses]);

  // Filters and search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPerson, setFilterPerson] = useState("all");
  const [filterDate, setFilterDate] = useState("all");
  const [loading, setLoading] = useState(false);

  // form/ui state
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  useEffect(() => {
    if (participants.length > 0 && !paidBy) {
      setPaidBy(participants[0].id);
    }
  }, [participants, paidBy]);

  const [splitType, setSplitType] = useState("equal");
  const [alloc, setAlloc] = useState({});

  // pay modal
  const [payModal, setPayModal] = useState({ open: false, from: null, to: null, amount: 0 });

  // toast - support multiple toasts
  const [toasts, setToasts] = useState([]);

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
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    if (type !== "loading") {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    }
    return id;
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
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
      category: "General",
    };

    setExpenses((s) => [e, ...s]);
    setTitle("");
    setAmount("");
    setAlloc({});
    setSplitType("equal");
    setIsAddExpenseOpen(false);
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

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return groupExpenses.filter((ex) => {
      // Search filter
      if (searchQuery && !ex.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      // Category filter
      if (filterCategory !== "all" && ex.category !== filterCategory) {
        return false;
      }
      // Person filter
      if (filterPerson !== "all" && ex.paidBy !== filterPerson) {
        return false;
      }
      // Date filter
      if (filterDate !== "all") {
        const expenseDate = new Date(ex.createdAt);
        const now = new Date();
        if (filterDate === "today") {
          if (expenseDate.toDateString() !== now.toDateString()) return false;
        } else if (filterDate === "week") {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (expenseDate < weekAgo) return false;
        } else if (filterDate === "month") {
          if (expenseDate.getMonth() !== now.getMonth()) return false;
        }
      }
      return true;
    });
  }, [groupExpenses, searchQuery, filterCategory, filterPerson, filterDate]);

  const totalExpenseAmount = groupExpenses.reduce((acc, ex) => acc + (Number(ex.amount) || 0), 0);
  const totalPending = settlements.reduce((acc, s) => acc + s.amount, 0);
  const totalSettled = totalExpenseAmount - totalPending;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/50 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-foreground transition-colors pb-20">
        {/* Modern Hero Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-cyan-600 text-white py-20 sm:py-24 lg:py-28">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff1a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff1a_1px,transparent_1px)] bg-[size:20px_20px]" />
          </div>

          {/* Multiple Gradient orbs with different animations */}
          <motion.div
            className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-cyan-500/30 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3],
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <motion.div
            className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
              x: [0, -30, 0],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />

          <motion.div
            className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-pink-500/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.15, 0.35, 0.15],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 80 }}
              className="space-y-6"
            >
              {/* Icon and Title */}
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-xl" />
                  <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 relative z-10" />
                </motion.div>
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight">
                  Dashboard
                </h1>
              </div>

              {/* Welcome Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="space-y-2"
              >
                <p className="text-xl sm:text-2xl md:text-3xl text-purple-100 font-medium">
                  Welcome back, <span className="font-bold text-white">{user?.username || "Friend"}</span>! 👋
                </p>
                <p className="text-base sm:text-lg text-purple-200/90 max-w-2xl">
                  Here's your complete financial overview and expense tracking dashboard.
                </p>
              </motion.div>

              {/* Quick Stats Preview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="flex flex-wrap gap-4 sm:gap-6 pt-4"
              >
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                  <Wallet className="w-5 h-5" />
                  <span className="text-sm font-medium">₹{totalExpenseAmount.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                  <Users className="w-5 h-5" />
                  <span className="text-sm font-medium">{participants.length} Participants</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                  <Receipt className="w-5 h-5" />
                  <span className="text-sm font-medium">{groupExpenses.length} Expenses</span>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Bottom wave decoration */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg className="w-full h-12 sm:h-16" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path
                d="M0,0 C300,80 600,80 900,40 C1050,20 1150,0 1200,0 L1200,120 L0,120 Z"
                fill="currentColor"
                className="text-slate-50 dark:text-slate-950"
              />
            </svg>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
          {/* Professional Stats Grid */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 mb-10"
          >
            <DashboardCard
              title="Total Expenses"
              value={totalExpenseAmount}
              icon={Wallet}
              gradient="from-purple-500 to-purple-600"
              accentGradient="from-purple-600 to-cyan-600"
              delay={0.1}
            />

            <DashboardCard
              title="Pending Payments"
              value={totalPending}
              icon={Clock}
              gradient="from-orange-500 to-orange-600"
              accentGradient="from-orange-500 to-red-500"
              delay={0.2}
            />

            <DashboardCard
              title="Settled Amount"
              value={totalSettled}
              icon={CheckCircle2}
              gradient="from-green-500 to-green-600"
              accentGradient="from-green-500 to-emerald-500"
              delay={0.3}
            />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Search and Filters */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          placeholder="Search expenses..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 border-slate-200 dark:border-slate-800 focus:ring-purple-500"
                        />
                      </div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={() => setIsAddExpenseOpen(true)}
                          className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 shadow-md hover:shadow-lg transition-all"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Expense
                        </Button>
                      </motion.div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Filter Chips */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Select value={filterDate} onValueChange={setFilterDate}>
                        <SelectTrigger className="w-[140px] h-9">
                          <Calendar className="w-4 h-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Time</SelectItem>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="week">This Week</SelectItem>
                          <SelectItem value="month">This Month</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={filterPerson} onValueChange={setFilterPerson}>
                        <SelectTrigger className="w-[140px] h-9">
                          <UserCircle className="w-4 h-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All People</SelectItem>
                          {participants.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {(searchQuery || filterDate !== "all" || filterPerson !== "all") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSearchQuery("");
                            setFilterDate("all");
                            setFilterPerson("all");
                            setFilterCategory("all");
                            showToast("Filters cleared", "info");
                          }}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Clear
                        </Button>
                      )}
                    </div>

                    <Separator className="my-4" />

                    {/* Recent Activity */}
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Recent Activity</h3>
                        <Badge variant="secondary" className="px-3 py-1">
                          {filteredExpenses.length} {filteredExpenses.length === 1 ? 'expense' : 'expenses'}
                        </Badge>
                      </div>

                      {loading ? (
                        <SkeletonLoader />
                      ) : filteredExpenses.length === 0 ? (
                        searchQuery || filterDate !== "all" || filterPerson !== "all" ? (
                          <EmptyState
                            icon={Search}
                            title="No expenses found"
                            description="Try adjusting your filters or search query"
                            action={
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSearchQuery("");
                                  setFilterDate("all");
                                  setFilterPerson("all");
                                }}
                              >
                                Clear Filters
                              </Button>
                            }
                          />
                        ) : (
                          <EmptyState
                            icon={Wallet}
                            title="No expenses yet"
                            description="Start tracking your group expenses by adding your first expense"
                            action={
                              <Button onClick={() => setIsAddExpenseOpen(true)} className="bg-gradient-to-r from-purple-600 to-cyan-600">
                                <Plus className="w-4 h-4 mr-2" />
                                Add First Expense
                              </Button>
                            }
                          />
                        )
                      ) : (
                        <div className="space-y-3">
                          {filteredExpenses.slice(0, 5).map((ex, index) => (
                            <motion.div
                              key={ex.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.08, type: "spring", stiffness: 100 }}
                              className="flex items-start justify-between p-4 border rounded-lg bg-card hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all group"
                            >
                              <div className="flex gap-3 flex-1">
                                <div className="mt-1 bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full">
                                  <Receipt className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium leading-none mb-1">{ex.title}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Paid by <span className="font-medium text-foreground">{participantMap[ex.paidBy]?.name}</span>
                                  </p>
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {ex.splits?.slice(0, 3).map((split) => (
                                      <Badge key={split.participantId} variant="secondary" className="text-xs">
                                        {participantMap[split.participantId]?.name}: ₹{Number(split.value).toFixed(0)}
                                      </Badge>
                                    ))}
                                    {ex.splits?.length > 3 && (
                                      <Badge variant="secondary" className="text-xs">
                                        +{ex.splits.length - 3} more
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-lg">₹{Number(ex.amount).toFixed(2)}</span>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => navigate(`/transactions`)}>
                                      <Eye className="w-4 h-4 mr-2" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => deleteExpense(ex.id)} className="text-red-600">
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </motion.div>
                          ))}
                          {filteredExpenses.length > 5 && (
                            <Button variant="outline" className="w-full" onClick={() => navigate("/transactions")}>
                              View All {filteredExpenses.length} Expenses
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-6"
            >
              {/* Balances */}
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5 text-purple-600" /> Balances
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {participants.length === 0 ? (
                    <EmptyState
                      icon={Users}
                      title="No participants"
                      description="Add people to start tracking balances"
                      action={
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const name = prompt("Enter participant name:");
                            if (name) addParticipant(name);
                          }}
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Add Person
                        </Button>
                      }
                    />
                  ) : (
                    participants.map((p, index) => {
                      const bal = balances[p.id] ?? 0;
                      const isPositive = bal > 0;
                      const isNegative = bal < 0;
                      return (
                        <motion.div
                          key={p.id}
                          className="flex items-center justify-between group p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <div className="flex items-center gap-2">
                            <motion.div
                              className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center text-sm font-semibold text-white shadow-md"
                              whileHover={{ scale: 1.1, rotate: 360 }}
                              transition={{ duration: 0.3 }}
                            >
                              {p.name.charAt(0)}
                            </motion.div>
                            <span className="font-medium">{p.name}</span>
                          </div>
                          <div
                            className={`font-semibold text-lg ${isPositive ? "text-green-600" : isNegative ? "text-red-500" : "text-muted-foreground"
                              }`}
                          >
                            {bal > 0 ? "+" : ""}₹{bal.toFixed(2)}
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      const name = prompt("Enter participant name:");
                      if (name) addParticipant(name);
                    }}
                  >
                    <UserPlus className="mr-2 h-4 w-4" /> Add Participant
                  </Button>
                </CardFooter>
              </Card>

              {/* Settlements */}
              <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-cyan-50 dark:from-purple-950/30 dark:to-cyan-950/30 border-purple-200 dark:border-purple-800 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-purple-700 dark:text-purple-400">
                    <ArrowRightCircle className="h-5 w-5" /> Settlements
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">Suggested payments to clear debts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {settlements.length === 0 ? (
                    <div className="text-center py-4">
                      <CheckCircle2 className="w-12 h-12 mx-auto text-green-600 mb-2" />
                      <p className="text-sm font-medium">All settled up! 🎉</p>
                      <p className="text-xs text-muted-foreground mt-1">No pending payments</p>
                    </div>
                  ) : (
                    settlements.map((s, i) => (
                      <motion.div
                        key={i}
                        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-all group"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ y: -2, scale: 1.02 }}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div className="text-sm">
                            <span className="font-medium">{participantMap[s.from]?.name}</span>
                            <span className="text-muted-foreground mx-1">→</span>
                            <span className="font-medium">{participantMap[s.to]?.name}</span>
                          </div>
                          <span className="font-bold">₹{s.amount.toFixed(2)}</span>
                        </div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            size="sm"
                            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-md"
                            onClick={() => openPayModal(s.from, s.to, s.amount)}
                          >
                            Settle Up
                          </Button>
                        </motion.div>
                      </motion.div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" onClick={() => {
                    showToast("Navigating to Analytics...", "info");
                    navigate("/analytics");
                  }}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => {
                    showToast("Opening Budget Planner...", "info");
                    navigate("/budget");
                  }}>
                    <Wallet className="w-4 h-4 mr-2" />
                    Budget Planner
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => {
                    showToast("Opening Groups Manager...", "info");
                    navigate("/groups");
                  }}>
                    <Users className="w-4 h-4 mr-2" />
                    Manage Groups
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Add Expense Dialog */}
        <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Expense</DialogTitle>
              <DialogDescription>Add a new shared expense to the group.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Dinner, Taxi, etc."
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="paidBy" className="text-right">
                  Paid By
                </Label>
                <Select value={paidBy} onValueChange={setPaidBy}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select who paid" />
                  </SelectTrigger>
                  <SelectContent>
                    {participants.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="splitType" className="text-right">
                  Split
                </Label>
                <Select value={splitType} onValueChange={setSplitType}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select split type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equal">Equal</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="custom">Custom Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(splitType === "percentage" || splitType === "custom") && (
                <div className="col-span-4 grid gap-2">
                  <Label className="mb-2">Allocations</Label>
                  {participants.map((p) => (
                    <div key={p.id} className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right text-xs text-muted-foreground">{p.name}</Label>
                      <Input
                        className="col-span-3 h-8"
                        type="number"
                        placeholder={splitType === "percentage" ? "%" : "₹"}
                        value={alloc[p.id] ?? ""}
                        onChange={(e) => setAlloc((a) => ({ ...a, [p.id]: Number(e.target.value) }))}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={addExpense} className="bg-gradient-to-r from-purple-600 to-cyan-600">
                Save Expense
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Pay Modal */}
        <Dialog open={payModal.open} onOpenChange={(open) => !open && !payModal.loading && closePayModal()}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Make Settlement</DialogTitle>
              <DialogDescription>
                Record a payment from {participantMap[payModal.from]?.name} to {participantMap[payModal.to]?.name}.
              </DialogDescription>
            </DialogHeader>

            <div className="py-6 flex flex-col items-center justify-center space-y-4">
              <div className="text-4xl font-bold tracking-tighter">₹{payModal.amount.toFixed(2)}</div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <span>{participantMap[payModal.from]?.name}</span>
                <ArrowRightCircle className="h-4 w-4" />
                <span>{participantMap[payModal.to]?.name}</span>
              </div>
            </div>

            <DialogFooter className="sm:justify-between gap-4">
              <Button
                variant="ghost"
                onClick={() => {
                  createSettlementExpense(payModal.from, payModal.to, payModal.amount);
                  showToast("Marked as paid (manual)", "success");
                  closePayModal();
                }}
                disabled={payModal.loading}
              >
                Mark as Paid Manually
              </Button>
              <Button onClick={handlePayNow} disabled={payModal.loading} className="flex-1 bg-gradient-to-r from-purple-600 to-cyan-600">
                {payModal.loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Pay Now (Simulated)
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Global Toast Container */}
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    </TooltipProvider >
  );
}

export default Dashboard;
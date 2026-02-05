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
  CreditCard,
  Loader2,
  ArrowRightCircle,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Users
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
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
  DialogClose
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

  const groupExpenses = useMemo(() => expenses.filter(isGroupExpense), [expenses]);

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

  const totalExpenseAmount = groupExpenses.reduce((acc, ex) => acc + (Number(ex.amount) || 0), 0);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-foreground transition-colors pb-20">
        {/* Hero Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white py-16 sm:py-24 mb-12">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent" />
          <div className="relative max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-cyan-200">
                Dashboard
              </h1>
              <p className="text-lg md:text-xl text-slate-300 max-w-2xl font-light">
                Welcome back, <span className="font-semibold text-white">{user?.username || "Friend"}</span>. Track expenses, settle up with friends, and keep your finances organized.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* Summary Cards with improved design */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-slate-200/60 dark:border-slate-700/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Total Expenses</CardTitle>
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Wallet className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold tracking-tight">₹{totalExpenseAmount.toFixed(2)}</div>
                  <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Across {groupExpenses.length} transactions
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-slate-200/60 dark:border-slate-700/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Active Participants</CardTitle>
                  <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                    <Users className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold tracking-tight">{participants.length}</div>
                  <p className="text-sm text-muted-foreground mt-2">Friends in your group</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-slate-200/60 dark:border-slate-700/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Pending Settlements</CardTitle>
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <ArrowRightCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold tracking-tight">{settlements.length}</div>
                  <p className="text-sm text-muted-foreground mt-2">Transactions to settle</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="mt-8 flex flex-col md:flex-row gap-8">
            {/* Main Content Area */}
            <div className="flex-1 space-y-8">

              {/* Actions Bar */}
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold tracking-tight">Recent Activity</h2>
                <div className="flex gap-2">
                  <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
                    <DialogTrigger asChild>
                      <Button className="shadow-lg shadow-indigo-500/20">
                        <Plus className="mr-2 h-4 w-4" /> Add Expense
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Add Expense</DialogTitle>
                        <DialogDescription>
                          Add a new shared expense to the group.
                        </DialogDescription>
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
                        <Button onClick={addExpense}>Save Expense</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Expenses List */}
              <Card>
                <CardHeader>
                  <CardTitle>Expenses</CardTitle>
                  <CardDescription>Recent transactions from your group.</CardDescription>
                </CardHeader>
                <CardContent>
                  {groupExpenses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                      <div className="rounded-full bg-slate-100 p-3 mb-3 dark:bg-slate-800">
                        <Wallet className="h-6 w-6 opacity-50" />
                      </div>
                      <p>No expenses yet.</p>
                      <Button variant="link" onClick={() => setIsAddExpenseOpen(true)}>Add your first expense</Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {groupExpenses.map((ex) => (
                        <div key={ex.id} className="flex items-start justify-between p-4 border rounded-lg bg-card hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                          <div className="flex gap-4">
                            <div className="mt-1 bg-primary/10 p-2 rounded-full hidden sm:block">
                              <ArrowUpRight className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium leading-none">{ex.title}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Paid by <span className="font-medium text-foreground">{participantMap[ex.paidBy]?.name}</span>
                              </p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {ex.splits?.map(split => (
                                  <Badge key={split.participantId} variant="secondary" className="text-[10px] font-normal">
                                    {participantMap[split.participantId]?.name}: {Number(split.value).toFixed(0)}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className="font-bold">₹{Number(ex.amount).toFixed(2)}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => deleteExpense(ex.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>

            {/* Sidebar */}
            <div className="w-full md:w-80 space-y-8">

              {/* Balances */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" /> Balances
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {participants.map((p) => {
                    const bal = balances[p.id] ?? 0;
                    const isPositive = bal > 0;
                    const isNegative = bal < 0;
                    return (
                      <div key={p.id} className="flex items-center justify-between group">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-semibold">
                            {p.name.charAt(0)}
                          </div>
                          <span className="font-medium">{p.name}</span>
                        </div>
                        <div className={`font-semibold ${isPositive ? "text-green-600" : isNegative ? "text-red-500" : "text-muted-foreground"}`}>
                          {bal > 0 ? "+" : ""}{bal.toFixed(2)}
                        </div>
                      </div>
                    )
                  })}
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
              <Card className="border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/30 dark:bg-indigo-900/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                    <Divide className="h-4 w-4" /> Settlements
                  </CardTitle>
                  <CardDescription>Suggested payments to clear debts.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {settlements.length === 0 ? (
                    <div className="text-sm text-muted-foreground text-center py-2">
                      All settled up! 🎉
                    </div>
                  ) : (
                    settlements.map((s, i) => (
                      <div key={i} className="bg-background/80 p-3 rounded-md border text-sm flex flex-col gap-2 shadow-sm">
                        <div className="flex justify-between items-center">
                          <span>
                            <span className="font-medium">{participantMap[s.from]?.name}</span> represents <br />
                            <span className="text-muted-foreground text-xs">pays</span> <span className="font-medium">{participantMap[s.to]?.name}</span>
                          </span>
                          <span className="font-bold text-base">₹{s.amount.toFixed(2)}</span>
                        </div>
                        <Button
                          size="sm"
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                          onClick={() => openPayModal(s.from, s.to, s.amount)}
                        >
                          Settle Up
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* AI Assistant Card */}
              <AIAssistantCard userName={user?.username || "Friend"} />
            </div>
          </div>
        </div>

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
              <div className="text-4xl font-bold tracking-tighter">
                ₹{payModal.amount.toFixed(2)}
              </div>
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
              <Button
                onClick={handlePayNow}
                disabled={payModal.loading}
                className="flex-1"
              >
                {payModal.loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Pay Now (Simulated)
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Global Toast */}
        <AnimatePresence>
          {toast && (
            <Toast key="t" message={toast.message} type={toast.type} onClose={() => setToast(null)} />
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
}
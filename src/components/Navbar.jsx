// src/components/Navbar.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../App";
import {
  PlusCircle,
  X,
  Receipt,
  Bell,
  Users,
  ArrowRight,
  Search,
  Home,
  LayoutDashboard,
  Clock,
  UsersRound,
  CreditCard,
  Bot,
  Settings,
  Sparkles,
  Menu,
  Sun,
  Moon,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const EXP_KEY_V1 = "smartsplit_expenses_v1";

function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const nav = useNavigate();
  const { pathname } = useLocation();

  // Dark mode (persisted)
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // UI state
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState("");
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Quick Add form (Expense)
  const [qaName, setQaName] = useState("");
  const [qaAmount, setQaAmount] = useState("");
  const [qaCategory, setQaCategory] = useState("Food");
  const [qaSaving, setQaSaving] = useState(false);

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cmd palette hotkey
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((s) => !s);
      } else if (e.key === "Escape") {
        setCmdOpen(false);
        setMobileOpen(false);
        setQuickAddOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Navigation links with icons
  const links = useMemo(
    () => [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/transactions", label: "Transactions", icon: CreditCard },
      { to: "/groups", label: "Groups", icon: UsersRound },
      { to: "/analytics", label: "Analytics", icon: Sparkles },
      { to: "/budget", label: "Budget", icon: Receipt },
      { to: "/ai-chat", label: "AI Assistant", icon: Bot },
    ],
    []
  );

  const username = user?.username || user?.name || "You";
  const avatarInitial = (username || "U").toString().charAt(0).toUpperCase();
  const balanceDisplay =
    typeof user?.balance === "number" ? `₹${user.balance.toFixed(2)}` : "—";

  const commands = [
    { id: "add", label: "Quick Add Expense", run: () => setQuickAddOpen(true) },
    { id: "dashboard", label: "Open Dashboard", run: () => nav("/dashboard") },
    { id: "analytics", label: "Open Analytics", run: () => nav("/analytics") },
    { id: "budget", label: "Open Budget", run: () => nav("/budget") },
    { id: "profile", label: "Open Profile", run: () => nav("/profile") },
    { id: "settings", label: "Open Settings", run: () => nav("/settings") },
    { id: "toggle-theme", label: "Toggle Dark Mode", run: () => setDarkMode((s) => !s) },
    {
      id: "logout",
      label: "Logout",
      run: () => {
        logout?.();
        nav("/");
      },
    },
  ];

  const filteredCommands = commands.filter((c) =>
    c.label.toLowerCase().includes(cmdQuery.toLowerCase())
  );

  // Quick add expense -> Transactions store
  const handleQuickAddExpense = async () => {
    if (!qaName.trim() || !qaAmount || Number(qaAmount) <= 0) {
      setToast({ t: "Enter a valid name and amount", type: "error" });
      return;
    }
    setQaSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    try {
      const expenses = JSON.parse(localStorage.getItem(EXP_KEY_V1) || "[]");
      const month = new Date().toLocaleString("default", { month: "short" });
      const e = {
        id: `exp_${Math.random().toString(36).slice(2, 9)}`,
        name: qaName.trim(),
        amount: Number(qaAmount),
        category: qaCategory,
        month,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(EXP_KEY_V1, JSON.stringify([...expenses, e]));
      setToast({ t: "Expense added", type: "success" });
      setQaName("");
      setQaAmount("");
      setQaCategory("Food");
      setQuickAddOpen(false);
    } catch {
      setToast({ t: "Failed to save", type: "error" });
    } finally {
      setQaSaving(false);
    }
  };

  // Hide navbar on landing, login, and signup pages
  if (pathname === "/" || pathname === "/login" || pathname === "/signup") return null;

  return (
    <>
      <motion.nav
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={classNames(
          "fixed top-0 left-0 w-full z-50 transition-all duration-300",
          "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl",
          "border-b",
          isScrolled
            ? "border-slate-200 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50"
            : "border-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="h-16 flex items-center justify-between gap-3">
            {/* Left: Brand */}
            <div className="flex items-center gap-6">
              <button
                className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                aria-label="Open menu"
                onClick={() => setMobileOpen((s) => !s)}
              >
                <Menu className="w-5 h-5" />
              </button>

              <Link to="/dashboard" className="flex items-center gap-2 group">
                <motion.div
                  whileHover={{ rotate: 8, scale: 1.06 }}
                  transition={{ type: "spring", stiffness: 260, damping: 12 }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-600 to-cyan-600 shadow-lg"
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </motion.div>
                <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                  SmartSplit
                </span>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-1">
                {links.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      classNames(
                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                        isActive
                          ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                      )
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <button
                onClick={() => setCmdOpen(true)}
                className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition group"
                title="Search (Ctrl/Cmd + K)"
              >
                <Search className="w-4 h-4" />
                <span className="text-sm">Search</span>
                <kbd className="ml-2 text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                  ⌘K
                </kbd>
              </button>

              {/* Quick Add */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => setQuickAddOpen(true)}
                  className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 shadow-lg"
                  size="sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add</span>
                </Button>
              </motion.div>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => nav("/notifications")}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
              </Button>

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDarkMode((s) => !s)}
                aria-label="Toggle theme"
              >
                {darkMode ? (
                  <Sun className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Moon className="h-5 w-5 text-slate-600" />
                )}
              </Button>

              {/* User Menu */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 px-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-gradient-to-br from-purple-600 to-cyan-600 text-white font-semibold">
                          {avatarInitial}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:inline text-sm font-medium">{username}</span>
                      <ChevronDown className="w-4 h-4 hidden md:block" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="font-semibold">{username}</span>
                        <span className="text-xs text-muted-foreground">{user?.email || "user@smartsplit.com"}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => nav("/profile")}>
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => nav("/settings")}>
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => nav("/help")}>
                      <Bell className="w-4 h-4 mr-2" />
                      Help Center
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        logout?.();
                        nav("/");
                      }}
                      className="text-red-600 dark:text-red-400"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={() => nav("/login")} size="sm">
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
            >
              <div className="px-4 py-3 space-y-1">
                {links.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      classNames(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                        isActive
                          ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      )
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </NavLink>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Command Palette */}
      <AnimatePresence>
        {cmdOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] grid place-items-center bg-black/60 backdrop-blur-sm"
            onClick={() => setCmdOpen(false)}
          >
            <motion.div
              initial={{ y: 16, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 16, opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-0 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                  autoFocus
                  value={cmdQuery}
                  onChange={(e) => setCmdQuery(e.target.value)}
                  placeholder="Search expenses, groups, people..."
                  className="flex-1 bg-transparent outline-none text-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                />
                <kbd className="text-xs text-slate-400 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 bg-white dark:bg-slate-800 shadow-sm">
                  Esc
                </kbd>
              </div>

              <div className="overflow-y-auto p-2">
                {/* 1. Commands */}
                {filteredCommands.length > 0 && (
                  <div className="mb-2">
                    <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Actions
                    </div>
                    {filteredCommands.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          c.run();
                          setCmdOpen(false);
                          setCmdQuery("");
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-300 transition-colors group"
                      >
                        <div className="p-1.5 bg-slate-200 dark:bg-slate-800 rounded text-slate-500 group-hover:bg-purple-100 group-hover:text-purple-600 transition-colors">
                          {c.id.includes("add") ? <PlusCircle className="w-4 h-4" /> :
                            c.id.includes("logout") ? <LogOut className="w-4 h-4" /> :
                              c.id.includes("theme") ? (darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />) :
                                <ArrowRight className="w-4 h-4" />}
                        </div>
                        {c.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* 2. Expenses Search Results */}
                {cmdQuery && (
                  (() => {
                    const expenses = JSON.parse(localStorage.getItem(EXP_KEY_V1) || "[]");
                    const matches = expenses.filter(e =>
                      e.name?.toLowerCase().includes(cmdQuery.toLowerCase()) ||
                      e.amount?.toString().includes(cmdQuery) ||
                      e.category?.toLowerCase().includes(cmdQuery.toLowerCase())
                    ).slice(0, 5);

                    if (matches.length === 0) return null;

                    return (
                      <div className="mb-2">
                        <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider flex justify-between">
                          <span>Expenses</span>
                          <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{matches.length} found</span>
                        </div>
                        {matches.map((e) => (
                          <button
                            key={e.id}
                            onClick={() => {
                              nav("/transactions"); // Ideally focused on this transaction
                              setCmdOpen(false);
                            }}
                            className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-sm transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 group-hover:text-purple-600">
                                <CreditCard className="w-4 h-4" />
                              </div>
                              <div className="flex flex-col items-start">
                                <span className="font-medium text-slate-900 dark:text-slate-100">{e.name}</span>
                                <span className="text-xs text-slate-500">{e.category} • {formatDate(e.createdAt)}</span>
                              </div>
                            </div>
                            <span className="font-semibold text-slate-900 dark:text-slate-100">₹{e.amount}</span>
                          </button>
                        ))}
                      </div>
                    );
                  })()
                )}

                {/* 3. Groups Search Results */}
                {cmdQuery && (
                  (() => {
                    const groups = JSON.parse(localStorage.getItem("smartsplit_groups_v1") || "[]");
                    const matches = groups.filter(g =>
                      g.name?.toLowerCase().includes(cmdQuery.toLowerCase())
                    ).slice(0, 3);

                    if (matches.length === 0) return null;

                    return (
                      <div className="mb-2">
                        <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Groups
                        </div>
                        {matches.map((g) => (
                          <button
                            key={g.id}
                            onClick={() => {
                              nav("/groups");
                              setCmdOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-sm transition-colors group"
                          >
                            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded text-blue-600">
                              <UsersRound className="w-4 h-4" />
                            </div>
                            <span className="font-medium text-slate-900 dark:text-slate-100">{g.name}</span>
                          </button>
                        ))}
                      </div>
                    );
                  })()
                )}

                {/* 4. People/Participants Search Results */}
                {cmdQuery && (
                  (() => {
                    const people = JSON.parse(localStorage.getItem("smartsplit_participants_v1") || "[]");
                    const matches = people.filter(p =>
                      p.name?.toLowerCase().includes(cmdQuery.toLowerCase())
                    ).slice(0, 3);

                    if (matches.length === 0) return null;

                    return (
                      <div className="mb-2">
                        <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          People
                        </div>
                        {matches.map((p) => (
                          <div
                            key={p.id}
                            className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-sm transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="text-[10px] bg-emerald-100 text-emerald-700">
                                  {p.name?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-slate-900 dark:text-slate-100">{p.name}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()
                )}

                {/* No Results State */}
                {cmdQuery && filteredCommands.length === 0 && (
                  // Checking if other sections are empty is complex inside render, typically we'd compute this outside
                  // For now, we assume if filteredCommands matches nothing and we typed something, it might be data search
                  // We'll rely on visual feedback if nothing shows up
                  null
                )}

                {!cmdQuery && (
                  <div className="px-4 py-8 text-center text-slate-500">
                    <div className="inline-flex p-3 rounded-full bg-slate-100 dark:bg-slate-800 mb-3">
                      <Search className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-sm">Type to search expenses, groups, pages, or actions...</p>
                  </div>
                )}
              </div>

              <div className="p-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-[10px] text-slate-400 flex justify-between px-4">
                <div className="flex gap-2">
                  <span><kbd className="font-sans">↑↓</kbd> to navigate</span>
                  <span><kbd className="font-sans">↵</kbd> to select</span>
                </div>
                <span>Global Search</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Add Modal */}
      <AnimatePresence>
        {quickAddOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] grid place-items-center bg-black/60 backdrop-blur-sm"
            onClick={() => !qaSaving && setQuickAddOpen(false)}
          >
            <motion.div
              initial={{ y: 18, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 18, opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <PlusCircle className="text-purple-600 dark:text-purple-400 w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-lg">Quick Add Expense</h3>
                </div>
                <button
                  onClick={() => !qaSaving && setQuickAddOpen(false)}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Expense Name</label>
                  <input
                    value={qaName}
                    onChange={(e) => setQaName(e.target.value)}
                    placeholder="e.g., Dinner at Restaurant"
                    className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Amount (₹)</label>
                  <input
                    value={qaAmount}
                    onChange={(e) => setQaAmount(e.target.value)}
                    placeholder="0.00"
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <select
                    value={qaCategory}
                    onChange={(e) => setQaCategory(e.target.value)}
                    className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-purple-500"
                  >
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
                </div>
                <Button
                  onClick={handleQuickAddExpense}
                  disabled={qaSaving}
                  className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
                >
                  {qaSaving ? "Saving..." : "Save Expense"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            className={classNames(
              "fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg z-[70] max-w-xs",
              toast.type === "success"
                ? "bg-green-600 text-white"
                : toast.type === "error"
                  ? "bg-red-600 text-white"
                  : "bg-blue-600 text-white"
            )}
            onClick={() => setToast(null)}
            role="status"
          >
            {toast.t}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
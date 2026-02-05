// src/components/Navbar.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../App";
import { PlusCircle, X, Receipt, Bell, Users, ArrowRight } from "lucide-react";
import { Lightning } from "phosphor-react";

const EXP_KEY_V1 = "smartsplit_expenses_v1";

function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
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
        setUserMenuOpen(false);
        setNotifOpen(false);
        setQuickAddOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Data
  const links = useMemo(
    () => [
      { to: "/", label: "Home" },
      { to: "/dashboard", label: "Dashboard" },
      { to: "/reminders", label: "Reminders" },
      { to: "/groups", label: "Groups" },
      { to: "/transactions", label: "Transactions" },
      { to: "/ai-chat", label: "AI Chat" },
      { to: "/settings", label: "Settings" },
    ],
    []
  );

  const username = user?.username || user?.name || "You";
  const avatarInitial = (username || "U").toString().charAt(0).toUpperCase();
  const balanceDisplay =
    typeof user?.balance === "number" ? `₹${user.balance.toFixed(2)}` : "—";

  const activeClass =
    "text-purple-300 font-semibold relative after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full after:bg-gradient-to-r after:from-purple-500 after:to-cyan-400";

  const commands = [
    { id: "add", label: "Quick Add", run: () => setQuickAddOpen(true) },
    { id: "dashboard", label: "Open Dashboard", run: () => nav("/dashboard") },
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

  // Hide navbar on landing (if you already do this elsewhere, ignore)
  if (pathname === "/") return null;

  return (
    <>
      <motion.nav
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={classNames(
          "fixed top-0 left-0 w-full z-50 transition-shadow",
          "bg-gradient-to-b from-[#0f1117]/90 to-[#0f1117]/70 dark:from-[#0b0d14]/90 dark:to-[#0b0d14]/70 backdrop-blur-xl",
          "border-b border-white/10",
          isScrolled ? "shadow-[0_10px_30px_-10px_rgba(0,0,0,0.45)]" : ""
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="h-16 flex items-center justify-between gap-3">
            {/* Left: Brand */}
            <div className="flex items-center gap-3">
              <button
                className="md:hidden p-2 rounded-lg hover:bg-white/10 transition"
                aria-label="Open menu"
                onClick={() => setMobileOpen((s) => !s)}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" className="text-gray-300">
                  <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>

              <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => nav("/dashboard")}>
                <motion.div
                  whileHover={{ rotate: 8, scale: 1.06 }}
                  transition={{ type: "spring", stiffness: 260, damping: 12 }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center ring-1 ring-white/15 relative overflow-hidden"
                  style={{
                    background:
                      "conic-gradient(from 180deg at 50% 50%, #7C3AED, #C084FC, #22D3EE, #7C3AED)",
                  }}
                >
                  <Lightning className="w-5 h-5 text-white" weight="fill" />
                  <span className="pointer-events-none absolute inset-0 opacity-30 blur-lg bg-white/10" />
                </motion.div>
                <div className="flex items-center gap-2">
                  <Link
                    to="/"
                    className="text-lg font-extrabold bg-gradient-to-r from-purple-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent"
                  >
                    SmartSplit
                  </Link>
                  <motion.span
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hidden sm:inline px-2 py-0.5 text-[10px] font-semibold rounded-full bg-purple-500/20 text-purple-300 ring-1 ring-purple-500/30"
                  >
                    Hackathon
                  </motion.span>
                </div>
              </div>
            </div>

            {/* Center: Links + Search */}
            <div className="hidden md:flex items-center gap-6">
              {links.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    classNames(
                      "text-sm text-gray-300 hover:text-purple-300 transition px-0.5 py-2 relative",
                      isActive && activeClass
                    )
                  }
                >
                  {label}
                </NavLink>
              ))}

              <button
                onClick={() => setCmdOpen(true)}
                className="group hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 transition"
                title="Search or jump (Ctrl/Cmd + K)"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" className="text-gray-400 group-hover:text-purple-300">
                  <path d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                </svg>
                <span className="text-sm">Search</span>
                <span className="ml-2 text-[10px] text-gray-400 rounded border border-white/10 px-1.5 py-0.5">⌘K</span>
              </button>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:block text-xs sm:text-sm bg-white/5 text-gray-100 px-3 py-1.5 rounded-lg ring-1 ring-white/10">
                <span className="block text-[10px] text-gray-400 leading-none">Balance</span>
                <span className="font-semibold leading-none">{balanceDisplay}</span>
              </div>

              {/* Add -> opens Quick Add modal */}
              <button
                onClick={() => setQuickAddOpen(true)}
                className="hidden sm:flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-3 py-2 rounded-lg transition shadow-sm"
                title="Quick Add"
              >
                <PlusCircle size={18} /> <span className="font-medium">Add</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => {
                    setNotifOpen((s) => !s);
                    setUserMenuOpen(false);
                  }}
                  className="p-2 rounded-lg hover:bg-white/10 transition relative"
                  aria-label="Notifications"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" className="text-gray-300">
                    <path
                      d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .53-.21 1.04-.59 1.41L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-fuchsia-400 rounded-full ring-2 ring-[#0f1117]" />
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-[#0f1117] border border-white/10 rounded-xl shadow-2xl p-2 z-50">
                    <div className="px-2 py-1 text-xs uppercase tracking-wider text-gray-400">Notifications</div>
                    <div className="divide-y divide-white/10">
                      {[
                        { t: "Raj settled ₹420 with you", ts: "2m ago" },
                        { t: "Asha added Grocery expense", ts: "1h ago" },
                        { t: "New group invite: Goa Trip", ts: "Yesterday" },
                      ].map((n, i) => (
                        <div key={i} className="p-3 hover:bg-white/5 rounded-lg">
                          <div className="text-sm text-gray-200">{n.t}</div>
                          <div className="text-xs text-gray-500">{n.ts}</div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setNotifOpen(false)}
                      className="mt-2 w-full text-center text-xs text-purple-300 hover:text-purple-200 py-1"
                    >
                      View all
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => setDarkMode((s) => !s)}
                aria-label="Toggle theme"
                className="p-2 rounded-lg hover:bg-white/10 transition"
                title="Toggle theme"
              >
                {darkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m8.485-8.485h1m-16 0h1M6.343 6.343l.707.707m12.728 0l-.707.707M6.343 17.657l.707-.707m12.728 0l-.707-.707M12 7a5 5 0 100 10 5 5 0 000-10z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
                  </svg>
                )}
              </button>

              <div className="relative">
                {user ? (
                  <>
                    <button
                      onClick={() => {
                        setUserMenuOpen((s) => !s);
                        setNotifOpen(false);
                      }}
                      className="flex items-center gap-2 focus:outline-none px-2 py-1 rounded-lg hover:bg-white/10"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-fuchsia-500 flex items-center justify-center text-white font-semibold">
                        {avatarInitial}
                      </div>
                      <span className="hidden md:inline text-gray-300">{username}</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" className="text-gray-400 hidden md:block">
                        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                      </svg>
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-[#0f1117] border border-white/10 rounded-xl shadow-2xl py-1 z-50">
                        <Link
                          to="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 text-gray-200 hover:bg-white/5"
                        >
                          Profile
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 text-gray-200 hover:bg-white/5"
                        >
                          Settings
                        </Link>
                        <button
                          onClick={() => {
                            logout?.();
                            setUserMenuOpen(false);
                            nav("/");
                          }}
                          className="block w-full text-left px-4 py-2 text-gray-200 hover:bg-white/5"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => nav("/login")}
                    className="text-purple-300 hover:text-purple-100 transition px-2 py-1 rounded-lg hover:bg-white/10"
                  >
                    Login
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile sheet */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#0f1117]/95 backdrop-blur-xl">
            <div className="px-4 py-3 flex items-center gap-2">
              <button
                onClick={() => setCmdOpen(true)}
                className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 transition"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" className="text-gray-400">
                  <path d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                </svg>
                <span className="text-sm">Search</span>
                <span className="ml-auto text-[10px] text-gray-500">Ctrl/Cmd K</span>
              </button>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setQuickAddOpen(true);
                }}
                className="px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white"
              >
                Add
              </button>
            </div>
            <div className="px-4 pb-3 space-y-1">
              {links.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    classNames(
                      "block px-3 py-2 rounded-lg text-gray-200 hover:bg-white/5",
                      isActive && "bg-white/10 text-purple-300"
                    )
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </motion.nav>

      {/* Command Palette */}
      <AnimatePresence>
        {cmdOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] grid place-items-center"
            onClick={() => setCmdOpen(false)}
          >
            <div className="absolute inset-0 bg-black/60" />
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0f1117] p-3 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 px-2">
                <svg width="18" height="18" viewBox="0 0 24 24" className="text-gray-400">
                  <path d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                </svg>
                <input
                  autoFocus
                  value={cmdQuery}
                  onChange={(e) => setCmdQuery(e.target.value)}
                  placeholder="Type a command…"
                  className="flex-1 bg-transparent outline-none text-gray-200 placeholder:text-gray-500 py-2"
                />
                <kbd className="text-[10px] text-gray-500 border border-white/10 rounded px-1.5 py-0.5">
                  Esc
                </kbd>
              </div>
              <div className="mt-2 max-h-64 overflow-auto rounded-xl border border-white/10">
                {filteredCommands.length === 0 ? (
                  <div className="p-4 text-sm text-gray-400">No matching commands</div>
                ) : (
                  <ul className="divide-y divide-white/10">
                    {filteredCommands.map((c) => (
                      <li key={c.id}>
                        <button
                          onClick={() => {
                            c.run();
                            setCmdOpen(false);
                            setCmdQuery("");
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-white/5 text-gray-200"
                        >
                          {c.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
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
            className="fixed inset-0 z-[60] grid place-items-center"
            onClick={() => !qaSaving && setQuickAddOpen(false)}
          >
            <div className="absolute inset-0 bg-black/60" />
            <motion.div
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 18, opacity: 0 }}
              className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0f1117] p-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <PlusCircle className="text-fuchsia-400" size={18} />
                  <div className="font-semibold">Quick Add</div>
                </div>
                <button
                  onClick={() => !qaSaving && setQuickAddOpen(false)}
                  className="p-1 rounded hover:bg-white/10"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-lg border border-white/10 p-3">
                  <div className="text-sm text-gray-400 mb-2">Expense</div>
                  <input
                    value={qaName}
                    onChange={(e) => setQaName(e.target.value)}
                    placeholder="Name (e.g., Chai)"
                    className="w-full mb-2 p-2 rounded bg-transparent border border-white/10 outline-none"
                  />
                  <input
                    value={qaAmount}
                    onChange={(e) => setQaAmount(e.target.value)}
                    placeholder="Amount (₹)"
                    type="number"
                    min="0"
                    className="w-full mb-2 p-2 rounded bg-transparent border border-white/10 outline-none"
                  />
                  <select
                    value={qaCategory}
                    onChange={(e) => setQaCategory(e.target.value)}
                    className="w-full mb-3 p-2 rounded bg-transparent border border-white/10 outline-none"
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
                  <button
                    onClick={handleQuickAddExpense}
                    disabled={qaSaving}
                    className="w-full px-3 py-2 rounded-md bg-purple-600 hover:bg-purple-500 disabled:opacity-60"
                  >
                    {qaSaving ? "Saving…" : "Save Expense"}
                  </button>
                </div>

                <div className="rounded-lg border border-white/10 p-3">
                  <div className="text-sm text-gray-400 mb-2">Shortcuts</div>
                  <button
                    onClick={() => {
                      setQuickAddOpen(false);
                      nav("/reminders?new=1");
                    }}
                    className="w-full mb-2 px-3 py-2 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Bell size={16} /> New Reminder
                    </span>
                    <ArrowRight size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setQuickAddOpen(false);
                      nav("/groups?new=1");
                    }}
                    className="w-full mb-2 px-3 py-2 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Users size={16} /> Create Group
                    </span>
                    <ArrowRight size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setQuickAddOpen(false);
                      nav("/transactions");
                    }}
                    className="w-full px-3 py-2 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Receipt size={16} /> Open Transactions
                    </span>
                    <ArrowRight size={16} />
                  </button>
                </div>
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
              "fixed bottom-6 right-6 px-4 py-2 rounded shadow-lg z-[70] max-w-xs",
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
// src/pages/Group.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusCircle,
  Users,
  Wallet,
  ArrowLeft,
  X,
  BarChart3,
  Filter,
  Download,
  CreditCard,
  Calculator,
  UserPlus,
  Search,
  Trash2,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../App";

const GROUP_KEY = "smartsplit_groups_v1";
const PART_KEY_V1 = "smartsplit_participants_v1";
const PART_KEY_LEGACY = "smartsplit_participants";
const EXP_KEY = "smartsplit_expenses_v1";

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function loadLocal(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveLocal(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function toFixed2(n) {
  return Math.round(n * 100) / 100;
}

export default function Group() {
  const { user } = useContext(AuthContext);
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();

  const [participants, setParticipants] = useState(() => {
    return (
      loadLocal(PART_KEY_V1, null) ||
      loadLocal(PART_KEY_LEGACY, null) || [
        { id: "p_you", name: user?.username || "You" },
        { id: "p_alice", name: "Alice" },
        { id: "p_bob", name: "Bob" },
      ]
    );
  });
  useEffect(() => saveLocal(PART_KEY_V1, participants), [participants]);

  const participantIdToParticipant = useMemo(() => {
    const map = {};
    participants.forEach((p) => (map[p.id] = p));
    return map;
  }, [participants]);

  const nameToParticipant = useMemo(() => {
    const map = {};
    participants.forEach((p) => (map[p.name.toLowerCase()] = p));
    return map;
  }, [participants]);

  const displayName = (keyOrName) => {
    if (!keyOrName) return "Unknown";
    const p = participantIdToParticipant[keyOrName];
    if (p) return p.name;
    return keyOrName;
  };

  const addParticipantByName = (rawName) => {
    const name = (rawName || "").trim();
    if (!name) return null;
    const exists =
      participants.find((p) => p.name.toLowerCase() === name.toLowerCase()) || null;
    if (exists) return exists;
    const p = { id: uid("p"), name };
    setParticipants((prev) => [p, ...prev]);
    return p;
  };

  const [groups, setGroups] = useState(() => loadLocal(GROUP_KEY, []));
  const [selectedGroup, setSelectedGroup] = useState(null);

  const [showAddGroup, setShowAddGroup] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showSettle, setShowSettle] = useState(false);
  const [showMembers, setShowMembers] = useState(false);

  const [filterOpen, setFilterOpen] = useState(false);
  const [filterMember, setFilterMember] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [toast, setToast] = useState(null);
  const showToast = (text, type = "info") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => {
    saveLocal(GROUP_KEY, groups);
  }, [groups]);

  useEffect(() => {
    const paid = params.get("paid");
    const gid = params.get("gid");
    if (paid === "1") {
      showToast("Payment recorded", "success");
      if (gid) {
        const byId = groups.find((g) => `${g.id}` === `${gid}`);
        if (byId) setSelectedGroup(byId);
      }
      params.delete("paid");
      params.delete("gid");
      setParams(params, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const groupMemberKeys = (group) => group.members || [];
  const expensePayerKey = (e) => e.payerId || e.payer;
  const settlementFromKey = (s) => s.fromId || s.from;
  const settlementToKey = (s) => s.toId || s.to;

  const calcBalances = (group) => {
    const members = groupMemberKeys(group);
    const balance = {};
    members.forEach((m) => (balance[m] = 0));

    (group.expenses || []).forEach((e) => {
      const payerKey = expensePayerKey(e);
      const amount = Number(e.amount) || 0;
      if (!balance.hasOwnProperty(payerKey)) balance[payerKey] = 0;
      balance[payerKey] += amount;

      const type = e.splitType || "equal";
      if (type === "equal") {
        const per = toFixed2(amount / members.length);
        members.forEach((m) => {
          if (!balance.hasOwnProperty(m)) balance[m] = 0;
          balance[m] -= per;
        });
      } else if (type === "custom") {
        const custom = e.customSplits || {};
        members.forEach((m) => {
          if (!balance.hasOwnProperty(m)) balance[m] = 0;
          balance[m] -= Number(custom[m] || 0);
        });
      } else if (type === "percentage") {
        const perc = e.percentageSplits || {};
        members.forEach((m) => {
          const pct = Number(perc[m] || 0);
          const share = toFixed2((pct / 100) * amount);
          if (!balance.hasOwnProperty(m)) balance[m] = 0;
          balance[m] -= share;
        });
      } else if (type === "shares") {
        const shares = e.shares || {};
        const totalShares = Object.values(shares).reduce((s, v) => s + Number(v || 0), 0);
        members.forEach((m) => {
          const sh = Number(shares[m] || 0);
          const share = totalShares > 0 ? toFixed2((sh / totalShares) * amount) : 0;
          if (!balance.hasOwnProperty(m)) balance[m] = 0;
          balance[m] -= share;
        });
      }
    });

    (group.settlements || []).forEach((s) => {
      const from = settlementFromKey(s);
      const to = settlementToKey(s);
      const amt = Number(s.amount) || 0;
      if (!balance.hasOwnProperty(from)) balance[from] = 0;
      if (!balance.hasOwnProperty(to)) balance[to] = 0;
      balance[from] -= amt;
      balance[to] += amt;
    });

    Object.keys(balance).forEach((k) => (balance[k] = toFixed2(balance[k])));

    return balance;
  };

  const computeSuggestedSettlements = (balanceMap) => {
    const entries = Object.entries(balanceMap).map(([k, amt]) => ({ k, amt: toFixed2(amt) }));
    let debtors = entries.filter((e) => e.amt < -0.01).sort((a, b) => a.amt - b.amt);
    let creditors = entries.filter((e) => e.amt > 0.01).sort((a, b) => b.amt - a.amt);
    const res = [];
    while (debtors.length && creditors.length) {
      const d = debtors[0];
      const c = creditors[0];
      const settle = Math.min(Math.abs(d.amt), c.amt);
      res.push({ from: d.k, to: c.k, amount: toFixed2(settle) });
      d.amt += settle;
      c.amt -= settle;
      if (Math.abs(d.amt) < 0.01) debtors.shift();
      if (Math.abs(c.amt) < 0.01) creditors.shift();
    }
    return res;
  };

  const totalSpent = (group) =>
    (group.expenses || []).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const paySettlementViaUPI = (group, fromKey, toKey, amount) => {
    const fromParticipant =
      participantIdToParticipant[fromKey] || nameToParticipant[fromKey?.toLowerCase()];
    const toParticipant =
      participantIdToParticipant[toKey] || nameToParticipant[toKey?.toLowerCase()];

    const from = fromParticipant
      ? { id: fromParticipant.id, name: fromParticipant.name }
      : { name: displayName(fromKey) };
    const to = toParticipant
      ? { id: toParticipant.id, name: toParticipant.name }
      : { name: displayName(toKey) };

    nav("/upi", {
      state: {
        from,
        to,
        amount,
        note: `Group Settlement • ${group.name}`,
        groupId: group.id,
        returnTo: "/groups",
      },
    });
  };

  const exportGroupCSV = (group) => {
    const lines = [];
    lines.push(`Group,${escapeCsv(group.name)},Category,${escapeCsv(group.category || "")}`);
    lines.push("");
    lines.push("Expenses:");
    lines.push("id,title,amount,payer,splitType,createdAt,receiptUrl");
    (group.expenses || []).forEach((e) => {
      const payer = displayName(expensePayerKey(e));
      lines.push(
        [
          e.id,
          escapeCsv(e.title),
          Number(e.amount || 0).toFixed(2),
          escapeCsv(payer),
          e.splitType || "equal",
          new Date(e.createdAt || Date.now()).toISOString(),
          escapeCsv(e.receiptUrl || ""),
        ].join(",")
      );
    });
    lines.push("");
    lines.push("Settlements:");
    lines.push("id,from,to,amount,createdAt");
    (group.settlements || []).forEach((s) => {
      lines.push(
        [
          s.id,
          escapeCsv(displayName(settlementFromKey(s))),
          escapeCsv(displayName(settlementToKey(s))),
          Number(s.amount || 0).toFixed(2),
          new Date(s.createdAt || Date.now()).toISOString(),
        ].join(",")
      );
    });

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${group.name.replace(/\s+/g, "_")}_group.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  function escapeCsv(s) {
    if (s == null) return "";
    const str = String(s);
    if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
    return str;
  }

  const createGroup = (name, category, memberIds) => {
    const g = {
      id: uid("grp"),
      name: name.trim() || "New Group",
      category,
      members: Array.from(new Set(memberIds)),
      expenses: [],
      settlements: [],
      createdAt: Date.now(),
    };
    setGroups((prev) => [g, ...prev]);
    setShowAddGroup(false);
    setSelectedGroup(g);
  };

  const addExpense = (groupId, payload) => {
    setGroups((prev) => {
      const updated = prev.map((g) =>
        `${g.id}` === `${groupId}`
          ? {
              ...g,
              expenses: [
                {
                  id: uid("exp"),
                  title: payload.title,
                  amount: Number(payload.amount),
                  payerId: payload.payerId,
                  splitType: payload.splitType,
                  customSplits: payload.customSplits,
                  percentageSplits: payload.percentageSplits,
                  shares: payload.shares,
                  receiptUrl: payload.receiptUrl || "",
                  createdAt: Date.now(),
                },
                ...g.expenses,
              ],
            }
          : g
      );
      const sel = updated.find((gg) => `${gg.id}` === `${groupId}`);
      setSelectedGroup(sel || null);
      return updated;
    });
    setShowAddExpense(false);
  };

  const settlePayment = (groupId, fromKey, toKey, amount) => {
    setGroups((prev) => {
      const updated = prev.map((g) =>
        `${g.id}` === `${groupId}`
          ? {
              ...g,
              settlements: [
                {
                  id: uid("set"),
                  fromId: fromKey,
                  toId: toKey,
                  amount: Number(amount),
                  createdAt: Date.now(),
                },
                ...g.settlements,
              ],
            }
          : g
      );
      const sel = updated.find((gg) => `${gg.id}` === `${groupId}`);
      setSelectedGroup(sel || null);
      return updated;
    });
    setShowSettle(false);
  };

  const addMemberToGroup = (groupId, memberId) => {
    setGroups((prev) => {
      const updated = prev.map((g) =>
        `${g.id}` === `${groupId}`
          ? { ...g, members: Array.from(new Set([...(g.members || []), memberId])) }
          : g
      );
      const sel = updated.find((gg) => `${gg.id}` === `${groupId}`);
      setSelectedGroup(sel || null);
      return updated;
    });
  };

  const removeMemberFromGroup = (groupId, memberId) => {
    setGroups((prev) => {
      const updated = prev.map((g) =>
        `${g.id}` === `${groupId}`
          ? { ...g, members: (g.members || []).filter((m) => `${m}` !== `${memberId}`) }
          : g
      );
      const sel = updated.find((gg) => `${gg.id}` === `${groupId}`);
      setSelectedGroup(sel || null);
      return updated;
    });
  };

  const settleAllSuggested = (group) => {
    const balances = calcBalances(group);
    const suggestions = computeSuggestedSettlements(balances);
    if (!suggestions.length) {
      showToast("Nothing to settle", "info");
      return;
    }
    if (!window.confirm(`Create ${suggestions.length} settlement record(s)?`)) return;
    setGroups((prev) => {
      const updated = prev.map((g) =>
        `${g.id}` === `${group.id}`
          ? {
              ...g,
              settlements: [
                ...suggestions.map((s) => ({
                  id: uid("set"),
                  fromId: s.from,
                  toId: s.to,
                  amount: s.amount,
                  createdAt: Date.now(),
                })),
                ...g.settlements,
              ],
            }
          : g
      );
      const sel = updated.find((gg) => `${gg.id}` === `${group.id}`);
      setSelectedGroup(sel || null);
      return updated;
    });
    showToast("Settlement records created", "success");
  };

  const filteredExpenses = useMemo(() => {
    if (!selectedGroup) return [];
    const q = searchQuery.toLowerCase();
    const member = filterMember;
    return (selectedGroup.expenses || []).filter((e) => {
      const titleMatch = !q || (e.title || "").toLowerCase().includes(q);
      if (!titleMatch) return false;
      if (member === "all") return true;
      const payerKey = expensePayerKey(e);
      if (`${member}` === `${payerKey}`) return true;
      const hasCustom = e.customSplits && e.customSplits[member] > 0;
      const hasPerc = e.percentageSplits && e.percentageSplits[member] > 0;
      const hasShare = e.shares && e.shares[member] > 0;
      return hasCustom || hasPerc || hasShare;
    });
  }, [selectedGroup, searchQuery, filterMember]);

  return (
    <div className="p-6 min-h-screen pt-20 bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200 text-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 dark:text-slate-100 transition-colors">
      {!selectedGroup && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users /> Groups
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddGroup(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md text-white"
              >
                <PlusCircle size={16} /> New Group
              </button>
            </div>
          </div>

          {groups.length === 0 ? (
            <div className="text-center text-slate-600 dark:text-slate-400 mt-10">No groups yet. Create one!</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((g) => (
                <motion.div
                  key={g.id}
                  layout
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedGroup(g)}
                  className="cursor-pointer p-4 rounded-xl bg-white border border-gray-200 shadow hover:border-blue-600 transition dark:bg-gray-900/70 dark:border-gray-800"
                >
                  <div className="font-semibold text-lg">{g.name}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">{g.category}</div>
                  <div className="text-sm">
                    Members: {groupMemberKeys(g).map((m) => displayName(m)).join(", ")}
                  </div>
                  <div className="mt-2 text-blue-600 dark:text-blue-400 font-semibold">₹{totalSpent(g)}</div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {selectedGroup && (
        <div>
          <button
            onClick={() => setSelectedGroup(null)}
            className="flex items-center gap-2 mb-4 text-slate-700 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
                <Wallet /> {selectedGroup.name}
              </h2>
              <div className="text-slate-700 dark:text-slate-400">
                {selectedGroup.category} •{" "}
                {groupMemberKeys(selectedGroup).map((m) => displayName(m)).join(", ")}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowAddExpense(true)}
                className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded-md flex items-center gap-2 text-white"
              >
                <PlusCircle size={14} /> Add Expense
              </button>
              <button
                onClick={() => setShowSettle(true)}
                className="bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded-md flex items-center gap-2 text-white"
              >
                <Wallet size={14} /> Record Settlement
              </button>
              <button
                onClick={() => settleAllSuggested(selectedGroup)}
                className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md flex items-center gap-2 text-white"
              >
                <Calculator size={14} /> Settle All
              </button>
              <button
                onClick={() => exportGroupCSV(selectedGroup)}
                className="bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-900 px-3 py-2 rounded-md flex items-center gap-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white dark:border-gray-700"
              >
                <Download size={14} /> Export CSV
              </button>
              <button
                onClick={() => setFilterOpen((s) => !s)}
                className="bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-900 px-3 py-2 rounded-md flex items-center gap-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white dark:border-gray-700"
              >
                <Filter size={14} /> Filters
              </button>
              <button
                onClick={() => setShowMembers(true)}
                className="bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-900 px-3 py-2 rounded-md flex items-center gap-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white dark:border-gray-700"
              >
                <UserPlus size={14} /> Manage Members
              </button>
            </div>
          </div>

          <AnimatePresence>
            {filterOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mt-3 p-3 rounded-lg bg-white border border-gray-200 flex flex-wrap items-center gap-3 dark:bg-gray-900/70 dark:border-gray-800"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-700 dark:text-slate-400">Member:</span>
                  <select
                    value={filterMember}
                    onChange={(e) => setFilterMember(e.target.value)}
                    className="p-2 rounded bg-white border border-gray-300 dark:bg-gray-950 dark:border-gray-800"
                  >
                    <option value="all">All</option>
                    {groupMemberKeys(selectedGroup).map((m) => (
                      <option key={m} value={m}>
                        {displayName(m)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2 flex-1 min-w-[220px]">
                  <Search size={16} className="text-slate-500 dark:text-slate-400" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search expenses..."
                    className="flex-1 p-2 rounded bg-white border border-gray-300 dark:bg-gray-950 dark:border-gray-800"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid md:grid-cols-2 gap-6 mt-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Expenses</h3>
              {filteredExpenses.length === 0 && (
                <div className="text-slate-600 dark:text-slate-400 text-sm">No expenses for current filter.</div>
              )}
              {filteredExpenses.map((e) => {
                const payer = displayName(expensePayerKey(e));
                return (
                  <div
                    key={e.id}
                    className="p-3 rounded-lg bg-white border border-gray-200 mb-2 shadow-sm dark:bg-gray-900/60 dark:border-gray-800"
                  >
                    <div className="flex justify-between gap-3">
                      <div>
                        <div className="font-semibold">{e.title}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          {payer} paid ₹{Number(e.amount || 0).toFixed(2)} • {e.splitType || "equal"}
                        </div>
                        {e.receiptUrl ? (
                          <a
                            href={e.receiptUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-cyan-700 underline dark:text-cyan-300"
                          >
                            Receipt
                          </a>
                        ) : null}
                      </div>
                      <div className="text-blue-700 dark:text-blue-400 font-medium">
                        ₹{Number(e.amount || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })}

              <h3 className="text-lg font-semibold mt-6 mb-2">Settlements</h3>
              {(selectedGroup.settlements || []).length === 0 && (
                <div className="text-slate-600 dark:text-slate-400 text-sm">No settlements yet.</div>
              )}
              {(selectedGroup.settlements || []).map((s) => (
                <div
                  key={s.id}
                  className="p-3 rounded-lg bg-white border border-gray-200 mb-2 text-sm shadow-sm dark:bg-gray-900/60 dark:border-gray-800"
                >
                  {displayName(settlementFromKey(s))} paid {displayName(settlementToKey(s))} ₹
                  {Number(s.amount || 0).toFixed(2)}
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <BarChart3 size={16} /> Balances
              </h3>

              {(() => {
                const bal = calcBalances(selectedGroup);
                return Object.entries(bal).map(([m, val]) => (
                  <div
                    key={m}
                    className={`p-3 rounded-lg mb-2 border ${
                      val > 0
                        ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/40 dark:border-green-700 dark:text-green-300"
                        : val < 0
                        ? "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/40 dark:border-red-700 dark:text-red-300"
                        : "bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-900/60 dark:border-gray-800 dark:text-slate-300"
                    }`}
                  >
                    {displayName(m)}:{" "}
                    {val > 0
                      ? `Gets ₹${val.toFixed(2)}`
                      : val < 0
                      ? `Owes ₹${(-val).toFixed(2)}`
                      : "Settled"}
                  </div>
                ));
              })()}

              <div className="mt-4 text-sm text-slate-700 dark:text-slate-400">
                Total Spent: ₹{totalSpent(selectedGroup)}
              </div>

              <div className="mt-6">
                <h4 className="text-md font-semibold mb-2">Suggested Settlements</h4>
                {(() => {
                  const bal = calcBalances(selectedGroup);
                  const sugg = computeSuggestedSettlements(bal);
                  if (!sugg.length)
                    return <div className="text-slate-600 dark:text-slate-400 text-sm">All settled! 🎉</div>;
                  return (
                    <ul className="space-y-2">
                      {sugg.map((s, i) => (
                        <li
                          key={`${s.from}-${s.to}-${i}`}
                          className="p-3 rounded-lg bg-white border border-gray-200 flex items-center justify-between gap-3 shadow-sm dark:bg-gray-900/60 dark:border-gray-800"
                        >
                          <div className="text-sm">
                            {displayName(s.from)} pays {displayName(s.to)}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">₹{s.amount.toFixed(2)}</span>
                            <button
                              onClick={() =>
                                paySettlementViaUPI(selectedGroup, s.from, s.to, s.amount)
                              }
                              className="px-3 py-1.5 rounded-md bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1.5"
                            >
                              <CreditCard size={16} /> Pay via UPI
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showAddGroup && (
          <Modal onClose={() => setShowAddGroup(false)}>
            <AddGroupForm
              onCreate={createGroup}
              participants={participants}
              addParticipantByName={addParticipantByName}
            />
          </Modal>
        )}

        {showAddExpense && selectedGroup && (
          <Modal onClose={() => setShowAddExpense(false)}>
            <AddExpenseForm
              onAdd={(payload) => addExpense(selectedGroup.id, payload)}
              group={selectedGroup}
              participants={participants}
              participantIdToParticipant={participantIdToParticipant}
              displayName={displayName}
            />
          </Modal>
        )}

        {showSettle && selectedGroup && (
          <Modal onClose={() => setShowSettle(false)}>
            <SettleForm
              onSettle={(fromKey, toKey, amount) =>
                settlePayment(selectedGroup.id, fromKey, toKey, amount)
              }
              group={selectedGroup}
              displayName={displayName}
            />
          </Modal>
        )}

        {showMembers && selectedGroup && (
          <Modal onClose={() => setShowMembers(false)}>
            <ManageMembersForm
              group={selectedGroup}
              participants={participants}
              displayName={displayName}
              addParticipantByName={addParticipantByName}
              onAdd={(pid) => addMemberToGroup(selectedGroup.id, pid)}
              onRemove={(pid) => removeMemberFromGroup(selectedGroup.id, pid)}
            />
          </Modal>
        )}
      </AnimatePresence>

      {toast && (
        <div
          className={`fixed bottom-6 right-6 max-w-sm px-4 py-2 rounded shadow-md cursor-pointer z-[60] ${
            toast.type === "success"
              ? "bg-green-600 text-white"
              : toast.type === "error"
              ? "bg-red-600 text-white"
              : "bg-blue-600 text-white"
          }`}
          onClick={() => setToast(null)}
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white border border-gray-200 p-6 rounded-xl w-full max-w-lg relative max-h-[85vh] overflow-y-auto dark:bg-gray-900/95 dark:border-gray-800"
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
      >
        <button
          onClick={onClose}
          className="sticky -top-2 float-right text-slate-700 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
        >
          <X size={18} />
        </button>
        <div className="clear-both" />
        {children}
      </motion.div>
    </motion.div>
  );
}

function AddGroupForm({ onCreate, participants, addParticipantByName }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Friends");
  const [selected, setSelected] = useState([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [newMember, setNewMember] = useState("");

  const toggleMember = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const filtered = participants.filter((p) =>
    p.name.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const addNewMember = () => {
    const p = addParticipantByName(newMember);
    if (p) {
      setSelected((prev) => (prev.includes(p.id) ? prev : [p.id, ...prev]));
      setNewMember("");
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Create Group</h2>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Group name"
        className="w-full mb-3 p-2 rounded bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full mb-3 p-2 rounded bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700"
      >
        <option>Friends</option>
        <option>Office</option>
        <option>Trip</option>
        <option>Society</option>
      </select>

      <div className="mb-2 text-sm text-slate-700 dark:text-slate-300">Add new member</div>
      <div className="flex gap-2 mb-3">
        <input
          value={newMember}
          onChange={(e) => setNewMember(e.target.value)}
          placeholder="Name (press Add)"
          className="flex-1 p-2 rounded bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700"
        />
        <button onClick={addNewMember} className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white">
          Add
        </button>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <Search size={16} className="text-slate-500 dark:text-slate-400" />
        <input
          value={memberSearch}
          onChange={(e) => setMemberSearch(e.target.value)}
          placeholder="Search existing members..."
          className="flex-1 p-2 rounded bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-56 overflow-auto">
        {filtered.map((p) => (
          <button
            key={p.id}
            onClick={() => toggleMember(p.id)}
            className={`px-3 py-1 rounded-md border text-left ${
              selected.includes(p.id)
                ? "bg-blue-600 border-blue-500 text-white"
                : "bg-white border-gray-300 dark:bg-gray-800 dark:border-gray-700"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      <button
        onClick={() => onCreate(name, category, selected)}
        className="mt-4 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md w-full text-white"
      >
        Create
      </button>
    </div>
  );
}

function AddExpenseForm({ onAdd, group, participants, participantIdToParticipant, displayName }) {
  const memberKeys = group.members || [];
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const defaultPayerId =
    participantIdToParticipant[memberKeys[0]]?.id ||
    participants.find((p) => p.name === displayName(memberKeys[0]))?.id ||
    participants[0]?.id;
  const [payerId, setPayerId] = useState(defaultPayerId);

  const [splitType, setSplitType] = useState("equal");
  const [customSplits, setCustomSplits] = useState({});
  const [percentageSplits, setPercentageSplits] = useState({});
  const [shares, setShares] = useState({});
  const [receiptUrl, setReceiptUrl] = useState("");

  const handleNumChange = (setter, key) => (e) =>
    setter((prev) => ({ ...prev, [key]: Number(e.target.value) }));

  const submit = () => {
    const amt = Number(amount);
    if (!title.trim() || !amt || amt <= 0) return;
    if (!payerId) return;

    if (splitType === "custom") {
      const sum = memberKeys.reduce((s, m) => s + Number(customSplits[m] || 0), 0);
      if (Math.abs(sum - amt) > 0.5) return;
    }
    if (splitType === "percentage") {
      const sum = memberKeys.reduce((s, m) => s + Number(percentageSplits[m] || 0), 0);
      if (Math.round(sum) !== 100) return;
    }
    if (splitType === "shares") {
      const sum = memberKeys.reduce((s, m) => s + Number(shares[m] || 0), 0);
      if (sum <= 0) return;
    }

    onAdd({
      title: title.trim(),
      amount: amt,
      payerId,
      splitType,
      customSplits,
      percentageSplits,
      shares,
      receiptUrl: receiptUrl.trim(),
    });
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Add Expense</h2>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="w-full mb-3 p-2 rounded bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700"
      />
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
        className="w-full mb-3 p-2 rounded bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700"
      />
      <label className="text-sm text-slate-700 dark:text-slate-400">Paid by:</label>
      <select
        value={payerId}
        onChange={(e) => setPayerId(e.target.value)}
        className="w-full mb-3 p-2 rounded bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700"
      >
        {memberKeys.map((m) => {
          const p =
            participantIdToParticipant[m] ||
            participants.find((pp) => pp.name === displayName(m));
          return (
            <option key={p?.id || m} value={p?.id || ""}>
              {p?.name || displayName(m)}
            </option>
          );
        })}
      </select>

      <select
        value={splitType}
        onChange={(e) => setSplitType(e.target.value)}
        className="w-full mb-3 p-2 rounded bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700"
      >
        <option value="equal">Equal Split</option>
        <option value="custom">Custom Amounts</option>
        <option value="percentage">Percentages</option>
        <option value="shares">Shares / Weights</option>
      </select>

      {splitType === "custom" &&
        memberKeys.map((m) => (
          <div key={m} className="flex justify-between items-center mb-2">
            <div>{displayName(m)}</div>
            <input
              type="number"
              onChange={handleNumChange(setCustomSplits, m)}
              placeholder="₹"
              className="w-24 p-1 rounded bg-white border border-gray-300 text-right dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
        ))}

      {splitType === "percentage" &&
        memberKeys.map((m) => (
          <div key={m} className="flex justify-between items-center mb-2">
            <div>{displayName(m)}</div>
            <input
              type="number"
              onChange={handleNumChange(setPercentageSplits, m)}
              placeholder="%"
              className="w-24 p-1 rounded bg-white border border-gray-300 text-right dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
        ))}

      {splitType === "shares" &&
        memberKeys.map((m) => (
          <div key={m} className="flex justify-between items-center mb-2">
            <div>{displayName(m)}</div>
            <input
              type="number"
              onChange={handleNumChange(setShares, m)}
              placeholder="shares"
              className="w-24 p-1 rounded bg-white border border-gray-300 text-right dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
        ))}

      <input
        value={receiptUrl}
        onChange={(e) => setReceiptUrl(e.target.value)}
        placeholder="Receipt URL (optional)"
        className="w-full mt-2 p-2 rounded bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700"
      />

      <button
        onClick={submit}
        className="mt-4 bg-green-600 hover:bg-green-700 px-3 py-2 rounded-md w-full text-white"
      >
        Add Expense
      </button>
    </div>
  );
}

function SettleForm({ onSettle, group, displayName }) {
  const memberKeys = group.members || [];
  const defaultFrom = memberKeys[0];
  const defaultTo = memberKeys[1] || memberKeys[0];
  const [fromKey, setFromKey] = useState(defaultFrom);
  const [toKey, setToKey] = useState(defaultTo);
  const [amount, setAmount] = useState("");

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Record Settlement</h2>
      <label className="text-sm text-slate-700 dark:text-slate-400">From</label>
      <select
        value={fromKey}
        onChange={(e) => setFromKey(e.target.value)}
        className="w-full mb-3 p-2 rounded bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700"
      >
        {memberKeys.map((m) => (
          <option key={m} value={m}>
            {displayName(m)}
          </option>
        ))}
      </select>

      <label className="text-sm text-slate-700 dark:text-slate-400">To</label>
      <select
        value={toKey}
        onChange={(e) => setToKey(e.target.value)}
        className="w-full mb-3 p-2 rounded bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700"
      >
        {memberKeys.map((m) => (
          <option key={m} value={m}>
            {displayName(m)}
          </option>
        ))}
      </select>

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full mb-3 p-2 rounded bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700"
      />
      <button
        onClick={() => onSettle(fromKey, toKey, Number(amount || 0))}
        className="mt-2 bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded-md w-full text-white"
      >
        Save
      </button>
    </div>
  );
}

function ManageMembersForm({
  group,
  participants,
  displayName,
  addParticipantByName,
  onAdd,
  onRemove,
}) {
  const [search, setSearch] = useState("");
  const [newMember, setNewMember] = useState("");

  const memberIds = group.members || [];
  const present = new Set(memberIds.map((m) => `${m}`));

  const filtered = participants.filter(
    (p) =>
      !present.has(p.id) && p.name.toLowerCase().includes(search.toLowerCase())
  );

  const addExisting = (id) => onAdd(id);
  const addNew = () => {
    const p = addParticipantByName(newMember);
    if (p) onAdd(p.id);
    setNewMember("");
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Manage Members</h2>

      <div className="mb-3">
        <div className="text-sm text-slate-700 dark:text-slate-400 mb-1">Current Members</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {memberIds.map((m) => (
            <div
              key={m}
              className="px-3 py-2 rounded-md bg-white border border-gray-300 flex items-center justify-between gap-2 dark:bg-gray-800 dark:border-gray-700"
            >
              <span className="truncate">{displayName(m)}</span>
              <button
                onClick={() => onRemove(m)}
                className="text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300"
                title="Remove"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-gray-200 dark:bg-gray-800 my-4" />

      <div className="mb-3">
        <div className="text-sm text-slate-700 dark:text-slate-400 mb-1">Add Existing</div>
        <div className="flex items-center gap-2 mb-2">
          <Search size={16} className="text-slate-500 dark:text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search people..."
            className="flex-1 p-2 rounded bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700"
          />
        </div>
        <div className="max-h-40 overflow-auto grid grid-cols-2 sm:grid-cols-3 gap-2">
          {filtered.length === 0 ? (
            <div className="text-sm text-slate-600 dark:text-slate-500 col-span-full">
              No matches. Add a new member below.
            </div>
          ) : (
            filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => addExisting(p.id)}
                className="px-3 py-2 rounded-md bg-white border border-gray-300 text-left hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
              >
                {p.name}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="h-px bg-gray-200 dark:bg-gray-800 my-4" />

      <div>
        <div className="text-sm text-slate-700 dark:text-slate-400 mb-1">Add New</div>
        <div className="flex gap-2">
          <input
            value={newMember}
            onChange={(e) => setNewMember(e.target.value)}
            placeholder="Name"
            className="flex-1 p-2 rounded bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700"
          />
          <button
            onClick={addNew}
            className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
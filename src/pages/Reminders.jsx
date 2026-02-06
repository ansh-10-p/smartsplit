// src/pages/Reminders.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../App";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  CalendarDays,
  CreditCard,
  ImagePlus,
  Trash2,
  CheckCircle2,
  Clock,
  MoreHorizontal,
} from "lucide-react";

const PART_KEY = "smartsplit_participants_v1";
const EXP_KEY = "smartsplit_expenses_v1";
const REM_KEY = "smartsplit_reminders_v1";

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleString();
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

// Fetch fresh meme from API with fallbacks
async function fetchRandomMemeUrl() {
  try {
    const r = await fetch("https://meme-api.com/gimme", { cache: "no-store" });
    const j = await r.json();
    if (j?.url) return j.url;
  } catch { }
  try {
    const r2 = await fetch("https://api.imgflip.com/get_memes", { cache: "no-store" });
    const j2 = await r2.json();
    if (j2?.success && Array.isArray(j2.data?.memes) && j2.data.memes.length > 0) {
      const m = j2.data.memes[Math.floor(Math.random() * j2.data.memes.length)];
      return m.url;
    }
  } catch { }
  return "https://i.imgflip.com/30b1gx.jpg";
}

export default function Reminders() {
  const { user } = useContext(AuthContext);
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();

  const [participants, setParticipants] = useState(() => {
    return (
      loadLocal(PART_KEY, null) || [
        { id: "p1", name: "Raj" },
        { id: "p2", name: "Sarah" },
        { id: "p3", name: "Asha" },
      ]
    );
  });

  const [reminders, setReminders] = useState(() => loadLocal(REM_KEY, []));
  const [toast, setToast] = useState(null);

  const participantIdToParticipant = useMemo(() => {
    const map = {};
    participants.forEach((p) => (map[p.id] = p));
    return map;
  }, [participants]);

  const myDisplayName = user?.username || user?.name || "You";
  const myParticipant =
    participants.find((p) => p.name.toLowerCase() === myDisplayName.toLowerCase()) || null;
  const myParticipantId = myParticipant?.id || null;

  useEffect(() => saveLocal(REM_KEY, reminders), [reminders]);
  useEffect(() => saveLocal(PART_KEY, participants), [participants]);

  // New reminder form
  const [toParticipantId, setToParticipantId] = useState(participants[0]?.id || "");
  const [amount, setAmount] = useState("");
  const [dueAt, setDueAt] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 2);
    d.setMinutes(0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [message, setMessage] = useState("Hey! Could you settle this when you get a minute? 🙂");
  const [includeMeme, setIncludeMeme] = useState(true);
  const [memeUrl, setMemeUrl] = useState("");
  const [autoSchedule, setAutoSchedule] = useState(true);

  // Fetch meme on mount/toggle
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (includeMeme) {
        const url = await fetchRandomMemeUrl();
        if (mounted) setMemeUrl(url);
      } else {
        setMemeUrl("");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [includeMeme]);

  // Auto-send when due (every minute)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setReminders((current) => {
        let changed = false;
        const updated = current.map((r) => {
          if (r.status === "pending" && r.autoSchedule && r.dueAt <= now) {
            changed = true;
            sendReminderEffect(r, true);
            return { ...r, status: "sent", lastSentAt: now, timesSent: (r.timesSent || 0) + 1 };
          }
          return r;
        });
        if (changed) showToast("Auto-sent due reminders");
        return updated;
      });
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Handle return from Pay screen (?paid=1&rid=...)
  useEffect(() => {
    const rid = params.get("rid");
    thePaid: {
      const paid = params.get("paid");
      if (!(rid && paid === "1")) break thePaid;
      setReminders((cur) => cur.map((r) => (r.id === rid ? { ...r, status: "paid" } : r)));
      params.delete("rid");
      params.delete("paid");
      setParams(params, { replace: true });
      showToast("Payment recorded for reminder", "success");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function showToast(text, type = "info") {
    setToast({ text, type });
    setTimeout(() => setToast(null), 2500);
  }

  async function createReminder() {
    if (!toParticipantId) return showToast("Select a participant", "error");
    if (!amount || Number(amount) <= 0) return showToast("Enter a positive amount", "error");
    const dueMs = new Date(dueAt).getTime();
    if (isNaN(dueMs)) return showToast("Pick a valid due date/time", "error");

    const finalMeme = includeMeme ? await fetchRandomMemeUrl() : null;

    const reminder = {
      id: uid("rem"),
      toId: toParticipantId,
      amount: Number(amount),
      dueAt: dueMs,
      message: message.trim(),
      memeUrl: finalMeme,
      createdAt: Date.now(),
      status: "pending",
      lastSentAt: null,
      timesSent: 0,
      autoSchedule,
    };
    setReminders((s) => [reminder, ...s]);
    showToast("Reminder created", "success");
  }

  function deleteReminder(id) {
    setReminders((s) => s.filter((r) => r.id !== id));
    showToast("Reminder deleted", "success");
  }

  function snoozeReminder(id, minutes = 30) {
    const ms = minutes * 60 * 1000;
    setReminders((current) =>
      current.map((r) => (r.id === id ? { ...r, dueAt: Date.now() + ms, status: "pending" } : r))
    );
    showToast(`Snoozed for ${minutes}m`, "success");
  }

  // Notification with click => Pay screen
  function sendReminderEffect(reminder, silent = false) {
    const recipientName = participantIdToParticipant[reminder.toId]?.name || "Friend";
    const title = `Pay ₹${reminder.amount.toFixed(2)} to ${myDisplayName}`;
    const body = `${recipientName}, ${reminder.message}`;
    const icon = reminder.memeUrl || undefined;

    const payUrl = `${window.location.origin}/upi?amount=${encodeURIComponent(
      reminder.amount
    )}&fromName=${encodeURIComponent(recipientName)}&toName=${encodeURIComponent(
      myDisplayName
    )}&note=${encodeURIComponent("SmartSplit Reminder")}&rid=${encodeURIComponent(
      reminder.id
    )}&returnTo=${encodeURIComponent(window.location.pathname)}`;

    try {
      if ("Notification" in window) {
        const make = () => {
          const n = new Notification(title, { body, icon });
          n.onclick = () => {
            try {
              window.focus();
            } catch { }
            window.open(payUrl, "_blank", "noopener,noreferrer");
            n.close();
          };
        };
        if (Notification.permission === "granted") make();
        else if (Notification.permission !== "denied")
          Notification.requestPermission().then((perm) => perm === "granted" && make());
      }
    } catch { }
    if (!silent) showToast("Reminder sent (notification opens Pay Now)", "success");
  }

  // Send + immediately go to Pay
  function sendAndPay(id) {
    const r = reminders.find((x) => x.id === id);
    if (!r) return;
    sendReminderEffect(r);
    payNow(id);
  }

  // Mark paid (records settlement)
  function markPaid(id) {
    const reminder = reminders.find((r) => r.id === id);
    if (!reminder) return;
    if (!myParticipantId) return showToast("Add yourself in Participants to record payment", "error");

    const toId = reminder.toId;
    const settlement = {
      id: uid("exp"),
      title: `Settlement ${participantIdToParticipant[toId]?.name || "Friend"} → ${myDisplayName}`,
      amount: reminder.amount,
      paidBy: toId,
      splits: [{ participantId: myParticipantId, value: reminder.amount }],
      createdAt: Date.now(),
      meta: { settlement: true, source: "reminders" },
    };
    const existing = loadLocal(EXP_KEY, []);
    saveLocal(EXP_KEY, [settlement, ...existing]);

    setReminders((current) => current.map((r) => (r.id === id ? { ...r, status: "paid" } : r)));
    showToast("Marked as paid and recorded", "success");
  }

  // Open Pay screen; pass rid and returnTo to auto-mark on return
  function payNow(id) {
    const reminder = reminders.find((r) => r.id === id);
    if (!reminder) return;
    const to = participantIdToParticipant[reminder.toId];
    nav("/upi", {
      state: {
        from: to,
        to: { id: myParticipantId, name: myDisplayName },
        amount: reminder.amount,
        note: "SmartSplit Reminder",
        rid: reminder.id,
        returnTo: "/reminders",
      },
    });
  }

  const sortedReminders = useMemo(() => {
    return [...reminders].sort((a, b) => a.dueAt - b.dueAt);
  }, [reminders]);

  const now = Date.now();

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 pb-10 bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200 text-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 dark:text-white transition-colors">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-700 via-fuchsia-600 to-cyan-600 bg-clip-text text-transparent dark:from-purple-400 dark:via-fuchsia-400 dark:to-cyan-300">
            Payment Reminders
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Meme-powered nudges that go straight to Pay Now.
          </p>
        </header>

        {/* Create Reminder */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200 shadow-xl dark:bg-gray-900/80 dark:border-gray-800 relative overflow-hidden"
        >
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/5 pointer-events-none" />

          <h2 className="text-xl font-bold flex items-center gap-2 relative z-10">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="p-2 rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white shadow-lg"
            >
              <Bell size={20} />
            </motion.div>
            New Reminder
          </h2>

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-slate-700 dark:text-slate-400">To</label>
              <select
                value={toParticipantId}
                onChange={(e) => setToParticipantId(e.target.value)}
                className="p-3 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-950 dark:border-gray-700"
              >
                {participants
                  .filter((p) => p.id !== myParticipantId)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-slate-700 dark:text-slate-400">Amount (₹)</label>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
                min="0"
                placeholder="0.00"
                className="p-3 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-950 dark:border-gray-700"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-slate-700 dark:text-slate-400">Due Date</label>
              <div className="flex items-center gap-2">
                <CalendarDays size={18} className="text-slate-600 dark:text-slate-400" />
                <input
                  type="datetime-local"
                  value={dueAt}
                  onChange={(e) => setDueAt(e.target.value)}
                  className="flex-1 p-3 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-950 dark:border-gray-700"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-slate-700 dark:text-slate-400">Message</label>
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Friendly note"
                className="p-3 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-950 dark:border-gray-700"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={includeMeme}
                onChange={(e) => setIncludeMeme(e.target.checked)}
              />
              Include meme (fresh from API)
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={autoSchedule}
                onChange={(e) => setAutoSchedule(e.target.checked)}
              />
              Auto-send at due time
            </label>

            {includeMeme && (
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => setMemeUrl(await fetchRandomMemeUrl())}
                  className="px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white dark:border-gray-700"
                >
                  <span className="inline-flex items-center gap-2">
                    <ImagePlus size={16} /> Random Meme
                  </span>
                </button>
                {memeUrl ? (
                  <img
                    src={memeUrl}
                    alt="meme"
                    className="h-14 w-24 object-cover rounded-md border border-gray-300 dark:border-gray-700"
                  />
                ) : null}
              </div>
            )}

            <button
              onClick={createReminder}
              className="ml-auto px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white"
            >
              Create Reminder
            </button>
          </div>
        </motion.section>

        {/* Reminders List */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200 shadow-xl dark:bg-gray-900/80 dark:border-gray-800 relative overflow-hidden"
        >
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 pointer-events-none" />

          <h2 className="text-xl font-bold flex items-center gap-2 mb-6 relative z-10">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="p-2 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-600 text-white shadow-lg"
            >
              <Clock size={20} />
            </motion.div>
            Upcoming & Overdue
          </h2>

          {sortedReminders.length === 0 ? (
            <p className="mt-3 text-slate-600 dark:text-slate-400 text-center py-8">No reminders yet.</p>
          ) : (
            <AnimatePresence>
              <ul className="mt-4 space-y-4 relative z-10">
                {sortedReminders.map((r, idx) => {
                  const recipient = participantIdToParticipant[r.toId];
                  const overdue = r.dueAt < now && r.status !== "paid";
                  return (
                    <motion.li
                      key={r.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ scale: 1.01, x: 4 }}
                      className="rounded-2xl border border-gray-200 bg-white/90 backdrop-blur-sm p-5 flex flex-col gap-4 dark:border-gray-700 dark:bg-gray-900/90 shadow-lg hover:shadow-xl transition-all duration-200 relative overflow-hidden"
                    >
                      {/* Gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 relative z-10">
                        <div className="flex items-start gap-4">
                          {r.memeUrl ? (
                            <motion.img
                              whileHover={{ scale: 1.05 }}
                              src={r.memeUrl}
                              alt="meme"
                              className="h-16 w-28 object-cover rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-md"
                            />
                          ) : (
                            <div className="h-16 w-28 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 grid place-items-center text-xs text-slate-600 dark:text-slate-400 shadow-md">
                              No meme
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-lg text-slate-900 dark:text-white">
                              {recipient?.name || "Friend"} owes ₹{r.amount.toFixed(2)}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                              Due {formatDate(r.dueAt)}
                            </div>
                            <div className="mt-2">
                              <motion.span
                                whileHover={{ scale: 1.05 }}
                                className={`inline-block text-xs px-3 py-1.5 rounded-full font-semibold shadow-sm ${r.status === "paid"
                                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                                    : r.status === "sent"
                                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                                      : overdue
                                        ? "bg-gradient-to-r from-red-500 to-pink-500 text-white"
                                        : "bg-gradient-to-r from-gray-400 to-gray-500 text-white"
                                  }`}
                              >
                                {r.status === "paid"
                                  ? "✓ Paid"
                                  : r.status === "sent"
                                    ? "→ Sent"
                                    : overdue
                                      ? "⚠ Overdue"
                                      : "○ Pending"}
                              </motion.span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:ml-4 relative z-10">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => sendAndPay(r.id)}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium shadow-md"
                            title="Send reminder and open Pay Now"
                          >
                            Send & Pay
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => payNow(r.id)}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white flex items-center gap-2 font-medium shadow-md"
                            title="Open UPI Pay"
                          >
                            <CreditCard size={16} /> Pay Now
                          </motion.button>

                          <details className="ml-auto">
                            <summary className="list-none">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-900 flex items-center gap-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white dark:border-gray-600 shadow-sm"
                              >
                                <MoreHorizontal size={16} /> More
                              </motion.button>
                            </summary>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => snoozeReminder(r.id, 30)}
                                className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white dark:border-gray-600"
                                title="Snooze 30m"
                              >
                                Snooze
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => markPaid(r.id)}
                                className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white flex items-center gap-1.5"
                                title="Mark as Paid"
                              >
                                <CheckCircle2 size={16} /> Mark Paid
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => deleteReminder(r.id)}
                                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </motion.button>
                            </div>
                          </details>
                        </div>
                      </div>

                      <details className="relative z-10">
                        <summary className="text-sm text-slate-700 cursor-pointer dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                          Details
                        </summary>
                        <div className="mt-2 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                          {r.message && <div className="mb-1 italic">"{r.message}"</div>}
                          <div>Due: {formatDate(r.dueAt)}</div>
                          {r.lastSentAt && <div>Last sent: {formatDate(r.lastSentAt)}</div>}
                          {r.timesSent ? <div>Times sent: {r.timesSent}</div> : null}
                        </div>
                      </details>
                    </motion.li>
                  );
                })}
              </ul>
            </AnimatePresence>
          )}
        </motion.section>
      </div>

      {toast && (
        <div
          className={`fixed bottom-6 right-6 max-w-sm px-4 py-2 rounded shadow-md cursor-pointer z-50 ${toast.type === "success"
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
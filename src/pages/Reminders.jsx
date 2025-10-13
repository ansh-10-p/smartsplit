import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../App";
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
  } catch {}
  try {
    const r2 = await fetch("https://api.imgflip.com/get_memes", { cache: "no-store" });
    const j2 = await r2.json();
    if (j2?.success && Array.isArray(j2.data?.memes) && j2.data.memes.length > 0) {
      const m = j2.data.memes[Math.floor(Math.random() * j2.data.memes.length)];
      return m.url;
    }
  } catch {}
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
    const paid = params.get("paid");
    if (rid && paid === "1") {
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
            } catch {}
            window.open(payUrl, "_blank", "noopener,noreferrer");
            n.close();
          };
        };
        if (Notification.permission === "granted") make();
        else if (Notification.permission !== "denied")
          Notification.requestPermission().then((perm) => perm === "granted" && make());
      }
    } catch {}
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
    <div className="min-h-screen pt-20 px-4 sm:px-6 pb-10 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-800 text-white">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 via-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">
            Payment Reminders
          </h1>
          <p className="text-sm text-slate-400">Meme-powered nudges that go straight to Pay Now.</p>
        </header>

        {/* Create Reminder */}
        <section className="p-5 rounded-2xl bg-gray-900/80 border border-gray-800">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Bell className="text-purple-400" size={18} /> New Reminder
          </h2>

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-slate-400">To</label>
              <select
                value={toParticipantId}
                onChange={(e) => setToParticipantId(e.target.value)}
                className="p-3 rounded-md bg-gray-950 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              <label className="text-sm text-slate-400">Amount (₹)</label>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
                min="0"
                placeholder="0.00"
                className="p-3 rounded-md bg-gray-950 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-slate-400">Due Date</label>
              <div className="flex items-center gap-2">
                <CalendarDays size={18} className="text-slate-400" />
                <input
                  type="datetime-local"
                  value={dueAt}
                  onChange={(e) => setDueAt(e.target.value)}
                  className="flex-1 p-3 rounded-md bg-gray-950 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-slate-400">Message</label>
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Friendly note"
                className="p-3 rounded-md bg-gray-950 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={includeMeme}
                onChange={(e) => setIncludeMeme(e.target.checked)}
              />
              Include meme (fresh from API)
            </label>

            <label className="flex items-center gap-2 text-sm">
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
                  className="px-3 py-1.5 rounded-md bg-gray-800 hover:bg-gray-700 flex items-center gap-2"
                >
                  <ImagePlus size={16} /> Random Meme
                </button>
                {memeUrl ? (
                  <img
                    src={memeUrl}
                    alt="meme"
                    className="h-14 w-24 object-cover rounded-md border border-gray-700"
                  />
                ) : null}
              </div>
            )}

            <button
              onClick={createReminder}
              className="ml-auto px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:brightness-110"
            >
              Create Reminder
            </button>
          </div>
        </section>

        {/* Reminders List */}
        <section className="p-5 rounded-2xl bg-gray-900/80 border border-gray-800">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="text-cyan-400" size={18} /> Upcoming & Overdue
          </h2>

          {sortedReminders.length === 0 ? (
            <p className="mt-3 text-slate-400">No reminders yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {sortedReminders.map((r) => {
                const recipient = participantIdToParticipant[r.toId];
                const overdue = r.dueAt < now && r.status !== "paid";
                return (
                  <li
                    key={r.id}
                    className="rounded-xl border border-gray-800 bg-gray-950 p-4 flex flex-col gap-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-start gap-3">
                        {r.memeUrl ? (
                          <img
                            src={r.memeUrl}
                            alt="meme"
                            className="h-14 w-24 object-cover rounded-md border border-gray-800"
                          />
                        ) : (
                          <div className="h-14 w-24 rounded-md bg-gray-800 grid place-items-center text-xs text-slate-400">
                            No meme
                          </div>
                        )}
                        <div>
                          <div className="font-semibold">
                            {recipient?.name || "Friend"} owes ₹{r.amount.toFixed(2)}
                          </div>
                          <div className="text-sm text-slate-400">
                            Due {formatDate(r.dueAt)}
                          </div>
                          <div className="mt-1">
                            <span
                              className={`inline-block text-xs px-2 py-0.5 rounded ${
                                r.status === "paid"
                                  ? "bg-green-600/30 text-green-200"
                                  : r.status === "sent"
                                  ? "bg-blue-600/30 text-blue-200"
                                  : overdue
                                  ? "bg-red-600/30 text-red-200"
                                  : "bg-gray-600/30 text-gray-200"
                              }`}
                            >
                              {r.status === "paid"
                                ? "Paid"
                                : r.status === "sent"
                                ? "Sent"
                                : overdue
                                ? "Overdue"
                                : "Pending"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 sm:ml-4">
                        <button
                          onClick={() => sendAndPay(r.id)}
                          className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700"
                          title="Send reminder and open Pay Now"
                        >
                          Send & Pay
                        </button>
                        <button
                          onClick={() => payNow(r.id)}
                          className="px-3 py-1.5 rounded-md bg-purple-600 hover:bg-purple-700 flex items-center gap-1.5"
                          title="Open UPI Pay"
                        >
                          <CreditCard size={16} /> Pay Now
                        </button>

                        <details className="ml-auto">
                          <summary className="list-none">
                            <button className="px-3 py-1.5 rounded-md bg-gray-800 hover:bg-gray-700 flex items-center gap-1.5">
                              <MoreHorizontal size={16} /> More
                            </button>
                          </summary>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <button
                              onClick={() => snoozeReminder(r.id, 30)}
                              className="px-3 py-1.5 rounded-md bg-gray-800 hover:bg-gray-700"
                              title="Snooze 30m"
                            >
                              Snooze
                            </button>
                            <button
                              onClick={() => markPaid(r.id)}
                              className="px-3 py-1.5 rounded-md bg-green-600 hover:bg-green-700 flex items-center gap-1.5"
                              title="Mark as Paid"
                            >
                              <CheckCircle2 size={16} /> Mark Paid
                            </button>
                            <button
                              onClick={() => deleteReminder(r.id)}
                              className="px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </details>
                      </div>
                    </div>

                    <details>
                      <summary className="text-sm text-slate-400 cursor-pointer">Details</summary>
                      <div className="mt-2 text-sm text-slate-300">
                        {r.message && <div className="mb-1">“{r.message}”</div>}
                        <div>Due: {formatDate(r.dueAt)}</div>
                        {r.lastSentAt && <div>Last sent: {formatDate(r.lastSentAt)}</div>}
                        {r.timesSent ? <div>Times sent: {r.timesSent}</div> : null}
                      </div>
                    </details>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {toast && (
        <div
          className={`fixed bottom-6 right-6 max-w-sm px-4 py-2 rounded shadow-md cursor-pointer z-50 ${
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
import React, { useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

const EXP_KEY = "smartsplit_expenses_v1";
const PART_KEY = "smartsplit_participants_v1";
const GROUP_KEY = "smartsplit_groups_v1";

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

export default function UpiPay() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();

  const state = location.state || {};
  const participants = loadLocal(PART_KEY, []);
  const participantIdToParticipant = useMemo(() => {
    const map = {};
    participants.forEach((p) => (map[p.id] = p));
    return map;
  }, [participants]);

  const fromState = state.from || null; // debtor
  const toState = state.to || null;     // creditor
  const fromNameParam = params.get("fromName");
  const toNameParam = params.get("toName");

  const fromName =
    fromState?.name ||
    (fromState?.id && participantIdToParticipant[fromState.id]?.name) ||
    fromNameParam ||
    "Friend";
  const toName =
    toState?.name ||
    (toState?.id && participantIdToParticipant[toState.id]?.name) ||
    toNameParam ||
    "You";

  const resolveByName = (name) => {
    if (!name) return null;
    const n = name.toLowerCase().trim();
    return participants.find((p) => p.name.toLowerCase().trim() === n) || null;
  };

  const resolvedFrom =
    fromState?.id ? participantIdToParticipant[fromState.id] || null : resolveByName(fromName);
  const resolvedTo =
    toState?.id ? participantIdToParticipant[toState.id] || null : resolveByName(toName);

  const amount =
    Number(state.amount ?? params.get("amount") ?? 0) > 0
      ? Number(state.amount ?? params.get("amount"))
      : 0;
  const note = state.note ?? params.get("note") ?? "SmartSplit Payment";

  const returnTo = state.returnTo || params.get("returnTo") || "/dashboard";
  const groupId = state.groupId || params.get("groupId") || null;

  const [upiId, setUpiId] = useState(params.get("upi") || "example@upi");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const upiLink = useMemo(() => {
    const pa = encodeURIComponent(upiId);
    const pn = encodeURIComponent(toName);
    const am = encodeURIComponent(amount.toFixed(2));
    const tn = encodeURIComponent(note);
    return `upi://pay?pa=${pa}&pn=${pn}&am=${am}&cu=INR&tn=${tn}`;
  }, [upiId, toName, amount, note]);

  function showToast(text, type = "info") {
    setToast({ text, type });
    setTimeout(() => setToast(null), 2200);
  }
  function copyLink() {
    navigator.clipboard.writeText(upiLink).then(() => showToast("UPI link copied", "success"));
  }

  // Global expense record (like dashboard settlement)
  function recordGlobalSettlement() {
    const fromId = resolvedFrom?.id;
    const toId = resolvedTo?.id;
    if (!fromId || !toId) return true; // still allow group-only record
    const e = {
      id: uid("exp"),
      title: `Settlement ${fromName} → ${toName}`,
      amount,
      paidBy: fromId,
      splits: [{ participantId: toId, value: amount }],
      createdAt: Date.now(),
      meta: { settlement: true, source: "upi" },
    };
    const existing = loadLocal(EXP_KEY, []);
    saveLocal(EXP_KEY, [e, ...existing]);
    return true;
  }

  // If a groupId is present, also add settlement to that group in local storage
  function recordGroupSettlement() {
    if (!groupId) return true;
    const groups = loadLocal(GROUP_KEY, []);
    const idx = groups.findIndex((g) => `${g.id}` === `${groupId}`);
    if (idx === -1) return false;
    const fromKey = resolvedFrom?.id || fromName; // store id if known, else name
    const toKey = resolvedTo?.id || toName;
    const settlement = {
      id: uid("set"),
      fromId: fromKey,
      toId: toKey,
      amount,
      createdAt: Date.now(),
    };
    const g = groups[idx];
    const next = {
      ...g,
      settlements: [settlement, ...(g.settlements || [])],
    };
    const updated = [...groups];
    updated[idx] = next;
    saveLocal(GROUP_KEY, updated);
    return true;
  }

  async function simulatePay() {
    if (!amount || amount <= 0) {
      showToast("Invalid amount", "error");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);

    const okGlobal = recordGlobalSettlement();
    const okGroup = recordGroupSettlement();
    if (okGlobal && okGroup) {
      showToast("Payment successful", "success");
      const url = new URL(returnTo, window.location.origin);
      if (groupId) url.searchParams.set("gid", groupId);
      url.searchParams.set("paid", "1");
      setTimeout(() => navigate(url.pathname + url.search), 600);
    } else {
      showToast("Unable to record payment", "error");
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-800 text-white">
      <div className="max-w-lg mx-auto rounded-2xl border border-gray-800 bg-gray-900/80 p-6">
        <h1 className="text-2xl font-bold">Pay via UPI</h1>
        <p className="text-sm text-slate-400 mt-1">
          {fromName} paying {toName}
        </p>

        <div className="mt-6 space-y-5">
          <div>
            <div className="text-xs text-slate-400">Amount</div>
            <div className="text-3xl font-extrabold">₹{amount.toFixed(2)}</div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-400">UPI ID</label>
            <input
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="example@upi"
              className="p-3 rounded-md bg-gray-950 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <button onClick={copyLink} className="px-3 py-2 rounded-md bg-gray-800 hover:bg-gray-700">
              Copy UPI Link
            </button>
            <a href={upiLink} className="px-3 py-2 rounded-md bg-cyan-600 hover:bg-cyan-700">
              Open in UPI App
            </a>
          </div>

          <div className="mt-1">
            <div className="text-sm text-slate-400 mb-2">Scan to pay</div>
            <img
              alt="qr"
              className="w-40 h-40 rounded-md border border-gray-700"
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                upiLink
              )}`}
            />
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-3 py-2 rounded-md bg-gray-800 hover:bg-gray-700"
              disabled={loading}
            >
              Back
            </button>
            <button
              onClick={simulatePay}
              className="flex-1 px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Processing..." : "Mark Paid"}
            </button>
          </div>

          <p className="text-xs text-slate-500">
            Concept screen for demo purposes. Actual UPI payment is handled by your UPI app.
          </p>
        </div>
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
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Moon,
  Sun,
  Laptop,
  Bell,
  Palette,
  User,
  Languages,
  Shield,
  Database,
  Calendar,
  Download,
  Upload,
  Trash2,
  SlidersHorizontal,
  RefreshCw,
  Mic,
  Sparkles,
  EyeOff,
} from "lucide-react";

// Storage keys used across the app
const SETTINGS_KEY = "smartsplit_settings_v1";
const EXP_KEY_V1 = "smartsplit_expenses_v1";
const INC_KEY_V1 = "smartsplit_incomes_v1";
const PART_KEY_V1 = "smartsplit_participants_v1";
const REM_KEY_V1 = "smartsplit_reminders_v1";
const GROUP_KEY_V1 = "smartsplit_groups_v1";
const GAMIFY_KEY = "smartsplit_gamification_v1";

// Helpers
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
function bytesForString(str) {
  // rough UTF-16 estimate
  return str ? str.length * 2 : 0;
}
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
function getLocalStorageUsage() {
  let total = 0;
  const items = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    const v = localStorage.getItem(k);
    const size = bytesForString(k) + bytesForString(v || "");
    items.push({ key: k, size });
    total += size;
  }
  items.sort((a, b) => b.size - a.size);
  return { total, items };
}

const DEFAULT_SETTINGS = {
  profile: {
    name: "",
    email: "",
    phone: "",
    upiId: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    language: "en-IN",
    leaderboardAlias: "",
  },
  appearance: {
    theme: "system", // system | light | dark
    accent: "#8b5cf6",
    density: "cozy", // compact | cozy
    reducedMotion: false,
    highContrast: false,
    fontScale: 100, // %
  },
  payments: {
    confirmSettlement: true,
    autoRecordAfterPay: true,
    roundingMode: "bankers", // bankers | up | down
    minDebtThreshold: 1, // ignore small debts under this amount
    defaultUPI: "",
  },
  reminders: {
    enableNotifications: true,
    defaultLeadMinutes: 60,
    frequencyCapPerDay: 5,
    dailySummary: false,
    quietFrom: "22:00",
    quietTo: "07:00",
    memeReminders: true,
  },
  expenses: {
    defaultSplitType: "equal", // equal | percentage | shares | custom
    categories: [
      { name: "Food", color: "#f87171", budget: 0 },
      { name: "Shopping", color: "#fb923c", budget: 0 },
      { name: "Travel", color: "#60a5fa", budget: 0 },
      { name: "Rent", color: "#facc15", budget: 0 },
      { name: "Utilities", color: "#34d399", budget: 0 },
      { name: "Others", color: "#a3a3a3", budget: 0 },
    ],
  },
  ai: {
    aiCategorizationEnabled: true,
    aiConfidenceThreshold: 0.4,
    aiAskBeforeApply: false,
    aiLearnFromCorrections: true,
  },
  voice: {
    voiceEnabled: true,
    voiceLanguage: "en-IN",
    voiceAutoSubmit: true,
  },
  gamification: {
    showGamification: true,
    allowLeaderboard: true,
  },
  privacy: {
    hideBalances: false,
    blurOnSwitch: false,
    autoLockMinutes: 0,
    localEncryption: false, // demo toggle only
  },
  integrations: {
    commandPalette: true,
    pwaInstallPrompt: true,
  },
  developer: {
    enableDebug: false,
  },
};

export default function Settings() {
  const fileRef = useRef(null);

  const [settings, setSettings] = useState(() => {
    const stored = load(SETTINGS_KEY, null);
    if (!stored) return DEFAULT_SETTINGS;
    // shallow merge defaults to allow forward-compat
    return deepMerge(DEFAULT_SETTINGS, stored);
  });

  const storageUsage = useMemo(() => getLocalStorageUsage(), [settings]);

  useEffect(() => {
    save(SETTINGS_KEY, settings);
  }, [settings]);

  // Apply appearance settings to document
  useEffect(() => {
    applyTheme(settings.appearance.theme);
  }, [settings.appearance.theme]);

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", settings.appearance.accent);
    document.documentElement.style.setProperty("--font-scale", `${settings.appearance.fontScale}%`);
    document.documentElement.dataset.density = settings.appearance.density;
    if (settings.appearance.reducedMotion) {
      document.documentElement.classList.add("reduced-motion");
    } else {
      document.documentElement.classList.remove("reduced-motion");
    }
    if (settings.appearance.highContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
  }, [
    settings.appearance.accent,
    settings.appearance.fontScale,
    settings.appearance.density,
    settings.appearance.reducedMotion,
    settings.appearance.highContrast,
  ]);

  const onChange = (path, value) => {
    setSettings((s) => setPath({ ...s }, path, value));
  };

  const addCategory = () => {
    onChange("expenses.categories", [
      ...settings.expenses.categories,
      { name: "New", color: "#a3a3a3", budget: 0 },
    ]);
  };
  const removeCategory = (i) => {
    const next = settings.expenses.categories.slice();
    next.splice(i, 1);
    onChange("expenses.categories", next);
  };

  // Export/Import JSON
  const exportAll = () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      settings,
      participants: load(PART_KEY_V1, []),
      expenses: load(EXP_KEY_V1, []),
      incomes: load(INC_KEY_V1, []),
      reminders: load(REM_KEY_V1, []),
      groups: load(GROUP_KEY_V1, []),
      gamification: load(GAMIFY_KEY, {}),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `smartsplit_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importAll = async (file) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (data.settings) setSettings((s) => deepMerge(DEFAULT_SETTINGS, data.settings));
      if (data.participants) save(PART_KEY_V1, data.participants);
      if (data.expenses) save(EXP_KEY_V1, data.expenses);
      if (data.incomes) save(INC_KEY_V1, data.incomes);
      if (data.reminders) save(REM_KEY_V1, data.reminders);
      if (data.groups) save(GROUP_KEY_V1, data.groups);
      if (data.gamification) save(GAMIFY_KEY, data.gamification);
      alert("Import complete. Some pages may need a refresh.");
    } catch (e) {
      alert("Import failed: " + e.message);
    }
  };

  // Clear demo data
  const clearDemoData = () => {
    if (!window.confirm("This will remove local demo data. Continue?")) return;
    [EXP_KEY_V1, INC_KEY_V1, REM_KEY_V1, GROUP_KEY_V1].forEach((k) => localStorage.removeItem(k));
    alert("Demo data cleared");
  };

  // Test Notification
  const testNotification = async () => {
    if (!("Notification" in window)) {
      alert("Notifications not supported in this browser.");
      return;
    }
    const perm =
      Notification.permission === "granted"
        ? "granted"
        : await Notification.requestPermission();
    if (perm !== "granted") {
      alert("Notification permission not granted.");
      return;
    }
    const n = new Notification("SmartSplit Test", {
      body: "This is a test notification.",
    });
    setTimeout(() => n.close(), 3000);
  };

  // Export reminders as ICS
  const exportICS = () => {
    const reminders = load(REM_KEY_V1, []);
    const ics = buildICS(reminders);
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `smartsplit_reminders_${Date.now()}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Gamification reset
  const resetGamification = () => {
    if (!window.confirm("Reset your points and streak?")) return;
    save(GAMIFY_KEY, { points: 0, streak: 0, lastActiveISO: null, badges: [] });
    alert("Gamification reset.");
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-800 text-white">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-extrabold">Settings</h1>
          <button
            onClick={() => setSettings(DEFAULT_SETTINGS)}
            className="px-3 py-1.5 rounded-md bg-gray-800 hover:bg-gray-700 flex items-center gap-2 text-sm"
            title="Reset to defaults"
          >
            <RefreshCw size={16} /> Reset
          </button>
        </header>

        {/* Profile */}
        <Section title="Profile" icon={<User className="text-cyan-300" />}>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Name"
              value={settings.profile.name}
              onChange={(v) => onChange("profile.name", v)}
              placeholder="Your name"
            />
            <Input
              label="Email"
              value={settings.profile.email}
              onChange={(v) => onChange("profile.email", v)}
              placeholder="you@example.com"
            />
            <Input
              label="Phone"
              value={settings.profile.phone}
              onChange={(v) => onChange("profile.phone", v)}
              placeholder="+91…"
            />
            <Input
              label="Default UPI ID"
              value={settings.profile.upiId}
              onChange={(v) => onChange("profile.upiId", v)}
              placeholder="example@upi"
            />
            <Select
              label="Timezone"
              value={settings.profile.timezone}
              onChange={(v) => onChange("profile.timezone", v)}
              options={[settings.profile.timezone, "UTC", "Asia/Kolkata", "America/New_York", "Europe/Berlin"].map(
                (z) => ({ label: z, value: z })
              )}
            />
            <Select
              label="Language"
              value={settings.profile.language}
              onChange={(v) => onChange("profile.language", v)}
              options={[
                { label: "English (India)", value: "en-IN" },
                { label: "English (US)", value: "en-US" },
              ]}
            />
            <Input
              label="Leaderboard Alias"
              value={settings.profile.leaderboardAlias}
              onChange={(v) => onChange("profile.leaderboardAlias", v)}
              placeholder="Alias for leaderboard"
            />
          </div>
        </Section>

        {/* Appearance */}
        <Section title="Appearance" icon={<Palette className="text-purple-300" />}>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-slate-300 mb-2">Theme</div>
              <div className="flex items-center gap-2">
                <ThemeButton
                  active={settings.appearance.theme === "system"}
                  onClick={() => onChange("appearance.theme", "system")}
                  icon={<Laptop size={16} />}
                  label="System"
                />
                <ThemeButton
                  active={settings.appearance.theme === "light"}
                  onClick={() => onChange("appearance.theme", "light")}
                  icon={<Sun size={16} />}
                  label="Light"
                />
                <ThemeButton
                  active={settings.appearance.theme === "dark"}
                  onClick={() => onChange("appearance.theme", "dark")}
                  icon={<Moon size={16} />}
                  label="Dark"
                />
              </div>
            </div>

            <div>
              <div className="text-sm text-slate-300 mb-2">Accent</div>
              <input
                type="color"
                value={settings.appearance.accent}
                onChange={(e) => onChange("appearance.accent", e.target.value)}
                className="w-12 h-10 rounded-md border border-gray-700 bg-gray-800"
                aria-label="accent color"
              />
            </div>

            <Select
              label="Density"
              value={settings.appearance.density}
              onChange={(v) => onChange("appearance.density", v)}
              options={[
                { label: "Compact", value: "compact" },
                { label: "Cozy", value: "cozy" },
              ]}
            />
          </div>

          <div className="mt-4 grid sm:grid-cols-3 gap-4">
            <Toggle
              label="Reduced motion"
              checked={settings.appearance.reducedMotion}
              onChange={(v) => onChange("appearance.reducedMotion", v)}
            />
            <Toggle
              label="High contrast"
              checked={settings.appearance.highContrast}
              onChange={(v) => onChange("appearance.highContrast", v)}
            />
            <div>
              <div className="text-sm text-slate-300 mb-1">Font size</div>
              <input
                type="range"
                min={90}
                max={130}
                step={5}
                value={settings.appearance.fontScale}
                onChange={(e) => onChange("appearance.fontScale", Number(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-slate-400">{settings.appearance.fontScale}%</div>
            </div>
          </div>
        </Section>

        {/* Notifications & Reminders */}
        <Section title="Notifications & Reminders" icon={<Bell className="text-blue-300" />}>
          <div className="grid sm:grid-cols-3 gap-4">
            <Toggle
              label="Enable notifications"
              checked={settings.reminders.enableNotifications}
              onChange={(v) => onChange("reminders.enableNotifications", v)}
            />
            <Toggle
              label="Daily summary"
              checked={settings.reminders.dailySummary}
              onChange={(v) => onChange("reminders.dailySummary", v)}
            />
            <Toggle
              label="Meme reminders"
              checked={settings.reminders.memeReminders}
              onChange={(v) => onChange("reminders.memeReminders", v)}
            />
            <Input
              label="Default lead time (mins)"
              type="number"
              value={String(settings.reminders.defaultLeadMinutes)}
              onChange={(v) => onChange("reminders.defaultLeadMinutes", Number(v || 0))}
            />
            <Input
              label="Frequency cap per day"
              type="number"
              value={String(settings.reminders.frequencyCapPerDay)}
              onChange={(v) => onChange("reminders.frequencyCapPerDay", Number(v || 0))}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Quiet hours from"
                type="time"
                value={settings.reminders.quietFrom}
                onChange={(v) => onChange("reminders.quietFrom", v)}
              />
              <Input
                label="Quiet hours to"
                type="time"
                value={settings.reminders.quietTo}
                onChange={(v) => onChange("reminders.quietTo", v)}
              />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            <button onClick={testNotification} className="btn">
              <Bell size={16} /> Test Notification
            </button>
            <button onClick={exportICS} className="btn">
              <Calendar size={16} /> Export Reminders (ICS)
            </button>
          </div>
        </Section>

        {/* Payments & Settlements */}
        <Section title="Payments & Settlements" icon={<SlidersHorizontal className="text-emerald-300" />}>
          <div className="grid sm:grid-cols-3 gap-4">
            <Toggle
              label="Confirm before recording settlement"
              checked={settings.payments.confirmSettlement}
              onChange={(v) => onChange("payments.confirmSettlement", v)}
            />
            <Toggle
              label="Auto-record after Pay Now"
              checked={settings.payments.autoRecordAfterPay}
              onChange={(v) => onChange("payments.autoRecordAfterPay", v)}
            />
            <Select
              label="Rounding mode"
              value={settings.payments.roundingMode}
              onChange={(v) => onChange("payments.roundingMode", v)}
              options={[
                { label: "Bankers (nearest even)", value: "bankers" },
                { label: "Round up", value: "up" },
                { label: "Round down", value: "down" },
              ]}
            />
            <Input
              label="Ignore debts under (₹)"
              type="number"
              value={String(settings.payments.minDebtThreshold)}
              onChange={(v) => onChange("payments.minDebtThreshold", Number(v || 0))}
            />
            <Input
              label="Default UPI ID"
              value={settings.payments.defaultUPI}
              onChange={(v) => onChange("payments.defaultUPI", v)}
              placeholder="example@upi"
            />
          </div>
        </Section>

        {/* Expenses & Categories */}
        <Section title="Expenses & Categories" icon={<Sparkles className="text-fuchsia-300" />}>
          <div className="grid sm:grid-cols-3 gap-4">
            <Select
              label="Default split type"
              value={settings.expenses.defaultSplitType}
              onChange={(v) => onChange("expenses.defaultSplitType", v)}
              options={[
                { label: "Equal", value: "equal" },
                { label: "Percentages", value: "percentage" },
                { label: "Shares / Weights", value: "shares" },
                { label: "Custom amounts", value: "custom" },
              ]}
            />
          </div>

          <div className="mt-3">
            <div className="text-sm text-slate-300 mb-2">Categories</div>
            <div className="grid sm:grid-cols-2 gap-3">
              {settings.expenses.categories.map((c, i) => (
                <div key={i} className="rounded-lg border border-gray-800 bg-gray-900/60 p-3 flex items-center gap-3">
                  <input
                    type="color"
                    value={c.color}
                    onChange={(e) => {
                      const next = settings.expenses.categories.slice();
                      next[i] = { ...c, color: e.target.value };
                      onChange("expenses.categories", next);
                    }}
                    className="w-10 h-10 rounded-md border border-gray-700"
                  />
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <Input
                      label="Name"
                      value={c.name}
                      onChange={(v) => {
                        const next = settings.expenses.categories.slice();
                        next[i] = { ...c, name: v };
                        onChange("expenses.categories", next);
                      }}
                    />
                    <Input
                      label="Monthly Budget (₹)"
                      type="number"
                      value={String(c.budget || 0)}
                      onChange={(v) => {
                        const next = settings.expenses.categories.slice();
                        next[i] = { ...c, budget: Number(v || 0) };
                        onChange("expenses.categories", next);
                      }}
                    />
                  </div>
                  <button
                    onClick={() => removeCategory(i)}
                    className="p-2 rounded-md hover:bg-gray-800"
                    title="Remove"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={addCategory} className="btn mt-3">
              + Add Category
            </button>
          </div>
        </Section>

        {/* AI & Voice */}
        <Section title="AI & Voice" icon={<Mic className="text-cyan-300" />}>
          <div className="grid sm:grid-cols-3 gap-4">
            <Toggle
              label="AI categorization"
              checked={settings.ai.aiCategorizationEnabled}
              onChange={(v) => onChange("ai.aiCategorizationEnabled", v)}
            />
            <Toggle
              label="Ask before applying AI category"
              checked={settings.ai.aiAskBeforeApply}
              onChange={(v) => onChange("ai.aiAskBeforeApply", v)}
            />
            <Toggle
              label="Learn from corrections"
              checked={settings.ai.aiLearnFromCorrections}
              onChange={(v) => onChange("ai.aiLearnFromCorrections", v)}
            />
            <div>
              <div className="text-sm text-slate-300 mb-1">AI confidence threshold</div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={settings.ai.aiConfidenceThreshold}
                onChange={(e) => onChange("ai.aiConfidenceThreshold", Number(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-slate-400">
                {Math.round(settings.ai.aiConfidenceThreshold * 100)}%
              </div>
            </div>

            <Toggle
              label="Voice input"
              checked={settings.voice.voiceEnabled}
              onChange={(v) => onChange("voice.voiceEnabled", v)}
            />
            <Toggle
              label="Voice auto-submit"
              checked={settings.voice.voiceAutoSubmit}
              onChange={(v) => onChange("voice.voiceAutoSubmit", v)}
            />
            <Select
              label="Voice language"
              value={settings.voice.voiceLanguage}
              onChange={(v) => onChange("voice.voiceLanguage", v)}
              options={[
                { label: "English (India)", value: "en-IN" },
                { label: "English (US)", value: "en-US" },
              ]}
            />
          </div>
        </Section>

        {/* Gamification */}
        <Section title="Gamification" icon={<EyeOff className="text-amber-300" />}>
          <div className="grid sm:grid-cols-3 gap-4">
            <Toggle
              label="Show points & streak"
              checked={settings.gamification.showGamification}
              onChange={(v) => onChange("gamification.showGamification", v)}
            />
            <Toggle
              label="Allow leaderboard entry"
              checked={settings.gamification.allowLeaderboard}
              onChange={(v) => onChange("gamification.allowLeaderboard", v)}
            />
          </div>
          <button onClick={resetGamification} className="btn mt-3">
            Reset my gamification
          </button>
        </Section>

        {/* Privacy & Security */}
        <Section title="Privacy & Security" icon={<Shield className="text-rose-300" />}>
          <div className="grid sm:grid-cols-3 gap-4">
            <Toggle
              label="Hide balances by default"
              checked={settings.privacy.hideBalances}
              onChange={(v) => onChange("privacy.hideBalances", v)}
            />
            <Toggle
              label="Blur on app switch"
              checked={settings.privacy.blurOnSwitch}
              onChange={(v) => onChange("privacy.blurOnSwitch", v)}
            />
            <Input
              label="Auto-lock after (mins)"
              type="number"
              value={String(settings.privacy.autoLockMinutes)}
              onChange={(v) => onChange("privacy.autoLockMinutes", Number(v || 0))}
            />
            <Toggle
              label="Local encryption (demo)"
              checked={settings.privacy.localEncryption}
              onChange={(v) => onChange("privacy.localEncryption", v)}
            />
          </div>
        </Section>

        {/* Data & Storage */}
        <Section title="Data & Storage" icon={<Database className="text-sky-300" />}>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={exportAll} className="btn">
              <Download size={16} /> Export JSON
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importAll(f);
                e.target.value = "";
              }}
            />
            <button onClick={() => fileRef.current?.click()} className="btn">
              <Upload size={16} /> Import JSON
            </button>
            <button onClick={clearDemoData} className="btn-danger">
              <Trash2 size={16} /> Clear demo data
            </button>
          </div>

          <div className="mt-4 rounded-lg border border-gray-800 bg-gray-900/60 p-3">
            <div className="text-sm text-slate-300 mb-2">Storage usage</div>
            <div className="text-xs text-slate-400">Total: {formatBytes(storageUsage.total)}</div>
            <ul className="mt-2 grid sm:grid-cols-2 gap-2">
              {storageUsage.items.slice(0, 8).map((it) => (
                <li key={it.key} className="text-xs text-slate-400 truncate">
                  {it.key}: {formatBytes(it.size)}
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* Developer & Integrations */}
        <Section title="Developer & Integrations" icon={<Languages className="text-teal-300" />}>
          <div className="grid sm:grid-cols-3 gap-4">
            <Toggle
              label="Command palette"
              checked={settings.integrations.commandPalette}
              onChange={(v) => onChange("integrations.commandPalette", v)}
            />
            <Toggle
              label="PWA install prompt"
              checked={settings.integrations.pwaInstallPrompt}
              onChange={(v) => onChange("integrations.pwaInstallPrompt", v)}
            />
            <Toggle
              label="Debug logs"
              checked={settings.developer.enableDebug}
              onChange={(v) => onChange("developer.enableDebug", v)}
            />
          </div>
        </Section>
      </div>
    </div>
  );
}

/* UI helpers */
function Section({ title, icon, children }) {
  return (
    <section className="rounded-2xl border border-gray-800 bg-gray-900/70 p-5">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}
function Input({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label className="text-sm">
      <div className="text-slate-300 mb-1">{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-2 rounded-md bg-gray-950 border border-gray-800"
      />
    </label>
  );
}
function Select({ label, value, onChange, options }) {
  return (
    <label className="text-sm">
      <div className="text-slate-300 mb-1">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 rounded-md bg-gray-950 border border-gray-800"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-md border border-gray-800 bg-gray-950 px-3 py-2">
      <span className="text-sm text-slate-300">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`w-10 h-6 rounded-full p-0.5 transition ${
          checked ? "bg-cyan-500" : "bg-gray-700"
        }`}
        aria-pressed={checked}
      >
        <span
          className={`block w-5 h-5 rounded-full bg-white transition ${
            checked ? "translate-x-4" : ""
          }`}
        />
      </button>
    </label>
  );
}
function ThemeButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md border ${
        active ? "border-cyan-500 bg-cyan-500/10" : "border-gray-800 bg-gray-900/60 hover:bg-gray-900"
      } flex items-center gap-2 text-sm`}
      title={label}
    >
      {icon} {label}
    </button>
  );
}

/* logic helpers */
function deepMerge(base, override) {
  if (Array.isArray(base)) return Array.isArray(override) ? override : base.slice();
  if (typeof base === "object" && base) {
    const out = { ...base };
    for (const k of Object.keys(override || {})) {
      out[k] =
        typeof base[k] === "object" && base[k] && typeof override[k] === "object"
          ? deepMerge(base[k], override[k])
          : override[k];
    }
    return out;
  }
  return override === undefined ? base : override;
}
function setPath(obj, path, value) {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (!cur[p] || typeof cur[p] !== "object") cur[p] = {};
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
  return obj;
}
function applyTheme(mode) {
  const root = document.documentElement;
  const sysDark =
    window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (mode === "dark" || (mode === "system" && sysDark)) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}
function buildICS(reminders) {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//SmartSplit//EN"];
  reminders.forEach((r, i) => {
    const start = new Date(r.dueAt || Date.now()).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const summary = `Pay ₹${r.amount?.toFixed ? r.amount.toFixed(2) : r.amount || ""}`;
    lines.push(
      "BEGIN:VEVENT",
      `UID:rem-${i}-${Date.now()}@smartsplit`,
      `DTSTAMP:${start}`,
      `DTSTART:${start}`,
      `SUMMARY:${escapeICS(summary)}`,
      `DESCRIPTION:${escapeICS(r.message || "")}`,
      "END:VEVENT"
    );
  });
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
function escapeICS(s) {
  return String(s || "").replace(/[,;]/g, (m) => (m === "," ? "\\," : "\\;"));
}

/* styles */
const style = document.createElement("style");
style.innerHTML = `
:root {
  --accent: #8b5cf6;
  --font-scale: 100%;
}
:root[data-density="compact"] * { --tw-space-y-reverse: 0; }
.reduced-motion * { transition-duration: 0ms !important; animation-duration: 0ms !important; }
.high-contrast { filter: contrast(1.1); }
.btn { display:inline-flex; align-items:center; gap:.5rem; padding:.5rem .75rem; border-radius:.5rem; background-color:rgb(31 41 55); border:1px solid rgb(31 41 55); }
.btn:hover { background-color:rgb(55 65 81); }
.btn-danger { display:inline-flex; align-items:center; gap:.5rem; padding:.5rem .75rem; border-radius:.5rem; background-color:#7f1d1d; border:1px solid #7f1d1d; }
.btn-danger:hover { background-color:#991b1b; }
`;
if (!document.getElementById("settings-inline-style")) {
  style.id = "settings-inline-style";
  document.head.appendChild(style);
}
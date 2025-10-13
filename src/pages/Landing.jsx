// src/pages/LandingPage.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const features = [
  { icon: "⚡", title: "AI Expense Categorization", desc: "Automatically tags your expenses so you spend less time sorting and more time living." },
  { icon: "🔔", title: "Fun & Friendly Reminders", desc: "Never miss a payment with gentle, timely nudges your friends will actually appreciate." },
  { icon: "💸", title: "One‑Tap Pay Mock", desc: "Simplify settling up with a single tap — mock UPI payments to practice before real ones." },
];

const howItWorks = [
  { step: "1", title: "Create a group", desc: "Add friends and set your default split preferences." },
  { step: "2", title: "Add expenses", desc: "Scan receipts or use AI/voice to add in seconds." },
  { step: "3", title: "Settle smart", desc: "Get minimal transactions and one‑tap Pay mocks." },
];

const faqs = [
  { q: "Is this free?", a: "Yes, this demo is fully local and free to try." },
  { q: "Does UPI really work?", a: "It’s a safe mock for demo; open your UPI app with a prefilled link." },
  { q: "Will my data sync?", a: "This demo stores data locally. Export/import from Settings anytime." },
];

const testimonials = [
  { name: "Raj Patel", text: "SmartSplit made managing our group trips effortless. Love the neon vibe too!" },
  { name: "Sarah Williams", text: "Finally, an app that understands group expenses without the headache. Highly recommend!" },
];

function MoneyBagIcon({ isDark }) {
  const fillColor = isDark ? "#8b5cf6" : "#0ea5e9";
  return (
    <svg className="w-64 h-64 hover:scale-110 transition-transform duration-500" viewBox="0 0 64 64" fill="none">
      <path d="M32 2C26 2 22 6 22 12v2H18c-3 0-5 3-5 6v24c0 3 2 6 5 6h28c3 0 5-3 5-6V20c0-3-2-6-5-6h-4v-2c0-6-4-10-10-10z" fill={fillColor} stroke={fillColor} strokeWidth="2" />
      <path d="M22 20h20v8H22v-8z" fill="#fff" opacity="0.2" />
      <circle cx="32" cy="20" r="2" fill="#fff" />
    </svg>
  );
}

export default function LandingPage() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const gradients = {
    dark: "from-purple-400 via-fuchsia-300 to-cyan-300",
    light: "from-cyan-600 via-sky-600 to-emerald-600",
  };

  const textMuted = darkMode ? "text-slate-300" : "text-slate-600";
  const cardBg =
    "rounded-xl border transition-shadow duration-300 " +
    (darkMode ? "bg-white/10 border-white/10 hover:shadow-purple-500/20 backdrop-blur-md" : "bg-white border-gray-200 hover:shadow-cyan-400/20");

  return (
    <div className={`${darkMode ? "bg-[#07061A] text-white" : "bg-gradient-to-b from-white via-sky-50 to-emerald-50 text-gray-900"} min-h-screen`}>
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className={`absolute w-[80vmax] h-[80vmax] rounded-full blur-[120px] opacity-40 -top-40 -left-40 ${darkMode ? "bg-fuchsia-700/30" : "bg-cyan-400/25"}`} />
        <div className={`absolute w-[60vmax] h-[60vmax] rounded-full blur-[120px] opacity-30 bottom-0 right-0 ${darkMode ? "bg-cyan-600/30" : "bg-purple-500/20"}`} />
      </div>

      {/* Floating theme toggle */}
      <button
        onClick={() => setDarkMode((s) => !s)}
        aria-label="Toggle theme"
        className={`fixed right-5 top-5 z-10 px-3 py-2 rounded-lg ring-1 ${darkMode ? "ring-white/20 hover:bg-white/10" : "ring-black/10 hover:bg-black/5"}`}
      >
        {darkMode ? "🌞 Light" : "🌙 Dark"}
      </button>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${darkMode ? "from-purple-900/10 via-fuchsia-900/5 to-cyan-900/10" : "from-cyan-100 via-blue-50 to-emerald-100"}`} />
        <div className="relative max-w-6xl mx-auto px-6 pt-28 pb-16 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className={`text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r ${darkMode ? gradients.dark : gradients.light}`}>
              Split Smart. Pay Easy.
            </h1>
            <p className={`${textMuted} text-lg max-w-lg`}>
              Manage group expenses with AI categorization, playful reminders, and one‑tap mock payments. Neon‑nice, friction‑free.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/signup"
                className="px-6 py-3 rounded-xl font-semibold shadow text-white bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:brightness-110"
              >
                Get Started
              </Link>
              <Link
                to="/dashboard"
                className={`px-6 py-3 rounded-xl ring-1 ${darkMode ? "ring-white/15 hover:bg-white/10" : "ring-black/10 hover:bg-white"}`}
              >
                Live Demo
              </Link>
            </div>
            <p className={`text-xs ${textMuted}`}>Tip: Press Ctrl/Cmd + K for quick commands.</p>
          </div>
          <div className="flex items-center justify-center">
            <MoneyBagIcon isDark={darkMode} />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { n: "5k+", t: "Groups managed" },
            { n: "₹2Cr+", t: "Expenses tracked" },
            { n: "98%", t: "Settle success (mock)" },
          ].map((s) => (
            <div key={s.t} className={`${cardBg} p-6 text-center`}>
              <div className={`text-3xl font-extrabold ${darkMode ? "text-purple-300" : "text-cyan-600"}`}>{s.n}</div>
              <div className={textMuted}>{s.t}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature cards */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold mb-8 text-center">Why SmartSplit?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className={`${cardBg} p-6`}>
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
              <p className={textMuted}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold mb-8 text-center">How it works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {howItWorks.map((s) => (
            <div key={s.step} className={`${cardBg} p-6`}>
              <div className={`w-8 h-8 rounded-full grid place-items-center font-bold mb-3 ${darkMode ? "bg-purple-600 text-black" : "bg-cyan-500 text-white"}`}>
                {s.step}
              </div>
              <h4 className="font-semibold mb-1">{s.title}</h4>
              <p className={textMuted}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold mb-8 text-center">What users say</h2>
        <div className="space-y-6">
          {testimonials.map((t) => (
            <blockquote key={t.name} className={`${cardBg} p-6 italic`}>
              <p>“{t.text}”</p>
              <footer className="mt-3 text-right not-italic font-semibold">— {t.name}</footer>
            </blockquote>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold mb-8 text-center">FAQ</h2>
        <div className="space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className={`${cardBg} p-4`}>
              <summary className="cursor-pointer font-medium">{f.q}</summary>
              <p className={`${textMuted} mt-2`}>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-6xl mx-auto px-6 pt-6 pb-14">
        <div className={`${cardBg} p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4`}>
          <div>
            <h3 className="text-2xl font-bold">Ready to split smarter?</h3>
            <p className={textMuted}>Start free — export/import anytime from Settings.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/signup" className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:brightness-110">
              Create account
            </Link>
            <Link to="/reminders" className={`px-6 py-3 rounded-xl ring-1 ${darkMode ? "ring-white/15 hover:bg-white/10" : "ring-black/10 hover:bg-white"}`}>
              Try reminders
            </Link>
          </div>
        </div>
      </section>

      <footer className={`text-center text-sm py-8 ${textMuted}`}>© 2025 SmartSplit</footer>
    </div>
  );
}

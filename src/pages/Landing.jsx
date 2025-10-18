// src/pages/LandingPage.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TestimonialsCarousel from "../components/TestimonialsCarousel";
import { Lightning, Bell, CreditCard, Sun, Moon } from "phosphor-react";

const features = [
  { icon: Lightning, title: "AI Expense Categorization", desc: "Automatically tags your expenses so you spend less time sorting and more time living." },
  { icon: Bell, title: "Fun & Friendly Reminders", desc: "Never miss a payment with gentle, timely nudges your friends will actually appreciate." },
  { icon: CreditCard, title: "One‑Tap Pay Mock", desc: "Simplify settling up with a single tap — mock UPI payments to practice before real ones." },
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
        {darkMode ? <><Sun className="w-4 h-4 mr-2" />Light</> : <><Moon className="w-4 h-4 mr-2" />Dark</>}
      </button>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${darkMode ? "from-purple-900/10 via-fuchsia-900/5 to-cyan-900/10" : "from-cyan-100 via-blue-50 to-emerald-100"}`} />
        <div className="relative max-w-6xl mx-auto px-6 pt-28 pb-16 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className={`text-6xl md:text-7xl font-thin font-serif bg-clip-text text-transparent bg-gradient-to-r ${darkMode ? gradients.dark : gradients.light} leading-tight tracking-medium`}>
              Split Smart. Pay Easy.
            </h1>
            <p className={`${textMuted} text-lg max-w-lg leading-relaxed`}>
              Manage group expenses with AI categorization, playful reminders, and one‑tap mock payments. Neon‑nice, friction‑free.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/signup"
                className={`px-6 py-3 rounded-xl font-semibold shadow transition-all duration-200 ${darkMode
                  ? "bg-purple-600 hover:bg-purple-500 text-white"
                  : "bg-cyan-600 hover:bg-cyan-500 text-white"
                  }`}
              >
                Get Started
              </Link>
              <Link
                to="/dashboard"
                className={`px-6 py-3 rounded-xl ring-1 transition-all duration-200 ${darkMode
                  ? "ring-white/15 hover:bg-white/10 text-white"
                  : "ring-gray-300 hover:bg-gray-50 text-gray-700"
                  }`}
              >
                Live Demo
              </Link>
            </div>
            <p className={`text-xs ${textMuted} pt-2`}>Tip: Press Ctrl/Cmd + K for quick commands.</p>
          </div>
          <div className="flex items-center justify-center">
            <MoneyBagIcon isDark={darkMode} />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid sm:grid-cols-3 gap-8">
          {[
            { n: "5k+", t: "Groups managed" },
            { n: "₹2Cr+", t: "Expenses tracked" },
            { n: "98%", t: "Settle success (mock)" },
          ].map((s) => (
            <div key={s.t} className={`${cardBg} p-8 text-center space-y-2`}>
              <div className={`text-4xl font-extrabold ${darkMode
                ? "bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent"
                : "bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent"
                }`}>{s.n}</div>
              <div className={`${textMuted} text-lg`}>{s.t}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature cards */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-4xl font-light font-serif mb-12 text-center tracking-wide">Why SmartSplit?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f) => (
            <div key={f.title} className={`${cardBg} p-8 space-y-4`}>
              <div className="mb-4">
                <f.icon className="w-12 h-12 text-purple-400" weight="fill" />
              </div>
              <h3 className="text-xl font-light mb-3 tracking-wide">{f.title}</h3>
              <p className={`${textMuted} leading-relaxed`}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-4xl font-light font-serif mb-12 text-center tracking-wide">How it works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {howItWorks.map((s) => (
            <div key={s.step} className={`${cardBg} p-8 space-y-4`}>
              <div className={`w-10 h-10 rounded-full grid place-items-center font-bold text-lg ${darkMode
                ? "bg-purple-600 text-white"
                : "bg-cyan-600 text-white"
                }`}>
                {s.step}
              </div>
              <h4 className="font-light text-lg mb-2 tracking-wide">{s.title}</h4>
              <p className={`${textMuted} leading-relaxed`}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-4xl font-light font-serif mb-12 text-center tracking-wide">What users say</h2>
        <TestimonialsCarousel darkMode={darkMode} />
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-4xl font-light font-serif mb-12 text-center tracking-wide">FAQ</h2>
        <div className="space-y-4">
          {faqs.map((f) => (
            <details key={f.q} className={`${cardBg} p-6`}>
              <summary className="cursor-pointer font-light text-lg mb-2 tracking-wide">{f.q}</summary>
              <p className={`${textMuted} mt-3 leading-relaxed`}>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-6xl mx-auto px-6 pt-8 pb-16">
        <div className={`${cardBg} p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6`}>
          <div className="space-y-3">
            <h3 className="text-3xl font-light font-serif tracking-wide">Ready to split smarter?</h3>
            <p className={`${textMuted} text-lg`}>Start free — export/import anytime from Settings.</p>
          </div>
          <div className="flex gap-4">
            <Link
              to="/signup"
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${darkMode
                ? "bg-purple-600 hover:bg-purple-500 text-white"
                : "bg-cyan-600 hover:bg-cyan-500 text-white"
                }`}
            >
              Create account
            </Link>
            <Link
              to="/reminders"
              className={`px-6 py-3 rounded-xl ring-1 transition-all duration-200 ${darkMode
                ? "ring-white/15 hover:bg-white/10 text-white"
                : "ring-gray-300 hover:bg-gray-50 text-gray-700"
                }`}
            >
              Try reminders
            </Link>
          </div>
        </div>
      </section>

      <footer className={`text-center text-sm py-8 ${textMuted}`}>© 2025 SmartSplit</footer>
    </div>
  );
}

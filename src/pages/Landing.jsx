import React from "react";
import { useNavigate } from "react-router-dom";
import AnimatedGrid from "../components/AnimatedGrid";
import { motion } from "framer-motion";

export default function Landing(){
  const nav = useNavigate();
  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedGrid />

      <main className="flex items-center justify-center min-h-[80vh] px-6">
        <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <motion.h1 initial={{ x:-30, opacity:0 }} animate={{ x:0, opacity:1 }} transition={{duration:0.6}}
                       className="text-5xl font-extrabold leading-tight bg-clip-text text-transparent neon-text"
                       style={{backgroundImage: "linear-gradient(90deg,#7C3AED,#C084FC,#10B981)"}}>
              Split Smart. <br/> Pay Easy.
            </motion.h1>

            <p className="mt-4 text-slate-300 max-w-lg">
              SmartSplit helps groups manage shared expenses with AI categorization, fun reminders, and one-tap UPI mock pay — all in a neon, delightful UI.
            </p>

            <div className="mt-8 flex gap-4">
              <button onClick={() => nav('/signup')}
                      className="px-6 py-3 rounded-xl btn-neon shadow-neon-lg hover:scale-105 transition transform tilt-on-cursor">
                Start Splitting Now <span className="emoji-bounce">⚡</span>
              </button>
              <button onClick={() => nav('/login')}
                      className="px-6 py-3 border border-slate-600 rounded-xl hover:bg-slate-800 transition tilt-on-cursor">
                Login <span className="emoji-pulse">🔐</span>
              </button>
            </div>

            <div className="mt-6 text-xs text-slate-500">Tip: Press <kbd className="px-2 py-1 rounded bg-slate-800">Ctrl/Cmd + K</kbd> to open commands</div>
          </div>

          <div className="relative">
            <div className="glass p-4 rounded-2xl tilt-on-cursor">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-slate-300">Recent</div>
                <div className="text-xs text-slate-500">AI Tagged</div>
              </div>

              <ul className="space-y-3">
                <li className="p-3 bg-gradient-to-r from-[#07112a]/30 to-transparent rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-semibold">Dinner</div>
                      <div className="text-xs text-slate-400">Paid by Raj — Food</div>
                    </div>
                    <div className="text-lg font-semibold">₹420</div>
                  </div>
                </li>
                <li className="p-3 bg-gradient-to-r from-[#07112a]/30 to-transparent rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-semibold">Rent (Aug)</div>
                      <div className="text-xs text-slate-400">Paid by Asha — Rent</div>
                    </div>
                    <div className="text-lg font-semibold">₹12,000</div>
                  </div>
                </li>
              </ul>
            </div>

            <div className="absolute -right-10 -top-8 w-44 h-44 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#10B981] opacity-30 blur-3xl animate-floaty"></div>
          </div>
        </div>
      </main>

      {/* Features */}
      <section className="px-6 py-12">
        <div className="max-w-6xl mx-auto grid gap-6 md:grid-cols-3">
          {[{
            t:"One-tap Splits", d:"Equal, percentage, or custom splits with instant previews", emoji:"⚡", anim:"emoji-bounce"
          },{
            t:"Smart Insights", d:"AI tags expenses and highlights what matters", emoji:"🤖", anim:"emoji-pulse"
          },{
            t:"Settle Up Fast", d:"Generate UPI deeplinks or share summaries", emoji:"💸", anim:"emoji-float"
          }].map((f,i)=> (
            <motion.div key={i} initial={{opacity:0, y:8}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{delay:i*0.05}}
              className="glass p-5 rounded-xl matrix-rain">
              <div className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                <span className={f.anim}>{f.emoji}</span>
                {f.t}
              </div>
              <div className="text-slate-300 text-sm">{f.d}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 pb-12">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {[
            { step:"1", title:"Add Expense", desc:"Enter amount, who paid, and participants", emoji:"📝", anim:"emoji-scale" },
            { step:"2", title:"Choose Split", desc:"Equal/percentage/custom with rounding", emoji:"⚖️", anim:"emoji-rotate" },
            { step:"3", title:"Settle Up", desc:"See who owes whom and pay instantly", emoji:"💰", anim:"emoji-glow" },
          ].map((s,i)=> (
            <motion.div key={i} initial={{opacity:0, y:8}} whileInView={{opacity:1, y:0}} viewport={{once:true}}
              className="p-5 rounded-xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 tech-glitch">
              <div className="text-3xl font-extrabold text-white flex items-center gap-2">
                <span className={s.anim}>{s.emoji}</span>
                {s.step}
              </div>
              <div className="text-white font-semibold mt-2">{s.title}</div>
              <div className="text-slate-300 text-sm">{s.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Social proof */}
      <section className="px-6 pb-12">
        <div className="max-w-5xl mx-auto grid gap-4">
          <div className="text-center text-xl text-white font-semibold">Trusted by roommates, friends, and teams</div>
          <div className="grid md:grid-cols-3 gap-4">
            {["“Dead simple for rent splits”","“The meme reminders are hilarious”","“Finally no awkward nudges”"].map((q,i)=> (
              <div key={i} className="glass p-4 rounded-xl text-slate-300 text-sm flex items-center gap-2">
                <span className="emoji-shake">💬</span>
                {q}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 pb-16">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-3xl md:text-4xl font-extrabold text-white">Make group money simple.</div>
          <div className="text-slate-300 mt-2">Join SmartSplit and never argue about who owes what again.</div>
          <div className="mt-6">
            <button onClick={() => nav('/signup')} className="px-8 py-3 rounded-xl btn-neon text-black flex items-center gap-2 mx-auto">
              Get Started <span className="emoji-spin">🚀</span>
            </button>
          </div>
        </div>
      </section>

      <footer className="py-6 text-center text-slate-400">Built with ❤️ for Hackathon 2025</footer>
    </div>
  );
}

import React, { useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import AnimatedGrid from "../components/AnimatedGrid";
import { Link } from "react-router-dom";

/* Simple client-side expenses state for UI demo */
export default function Dashboard(){
  const [participants, setParticipants] = useState([
    { id: "p1", name: "Raj", points: 120 },
    { id: "p2", name: "Sarah", points: 90 },
    { id: "p3", name: "Asha", points: 70 }
  ]);
  const [expenses, setExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);

  // form
  const [title,setTitle] = useState("");
  const [amount,setAmount] = useState("");
  const [paidBy,setPaidBy] = useState(participants[0].id);
  const [splitType,setSplitType] = useState("equal");
  const [alloc, setAlloc] = useState({});

  function addExpense(){
    if(!title || !amount) return alert("Enter valid");
    const amt = Number(amount);
    let splits = [];
    if(splitType === "equal"){
      const per = +(amt/participants.length).toFixed(2);
      splits = participants.map(p=>({id:p.id, value: per}));
    } else if(splitType === "custom"){
      splits = participants.map(p => ({id:p.id, value: alloc[p.id] || 0}));
      const s = splits.reduce((a,b)=>a+b.value,0);
      if(Math.abs(s-amt) > 0.5) return alert("Custom splits must sum to total");
    }
    setExpenses(e => [{id:Date.now(), title, amount:amt, paidBy, splits}, ...e]);
    setShowForm(false);
    setTitle(""); setAmount(""); setAlloc({});
  }

  const balances = useMemo(()=>{
    const map = {};
    participants.forEach(p => map[p.id] = 0);
    expenses.forEach(ex => {
      map[ex.paidBy] += ex.amount;
      ex.splits.forEach(s => map[s.id] -= s.value);
    });
    return map;
  }, [expenses, participants]);

  return (
    <div className="min-h-screen">
      <AnimatedGrid />
      <Navbar />
      <main className="p-6 max-w-6xl mx-auto">
        <div className="flex items-start gap-6">
          <section className="flex-1 glass p-4 rounded-2xl tilt-on-cursor">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span className="emoji-bounce">💰</span>
                Expenses
              </h3>
              <div className="flex items-center gap-3">
                <button onClick={()=>setShowForm(f=>!f)} className="px-3 py-2 rounded border flex items-center gap-1">
                  <span className="emoji-scale">➕</span> Add
                </button>
                <Link to="/summary" className="px-3 py-2 rounded btn-neon text-black flex items-center gap-1">
                  <span className="emoji-glow">📋</span> View Summary
                </Link>
              </div>
            </div>

            {showForm && (
              <div className="p-3 bg-slate-900/30 rounded mb-4">
                <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="w-full p-2 rounded bg-transparent border mb-2"/>
                <input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Amount" type="number" className="w-full p-2 rounded bg-transparent border mb-2"/>
                <select value={paidBy} onChange={e=>setPaidBy(e.target.value)} className="w-full p-2 rounded bg-transparent border mb-2">
                  {participants.map(p => <option value={p.id} key={p.id}>{p.name}</option>)}
                </select>
                <div className="flex gap-2 mb-2">
                  <select value={splitType} onChange={e=>setSplitType(e.target.value)} className="p-2 rounded bg-transparent border">
                    <option value="equal">Equal</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                {splitType === "custom" && participants.map(p=>(
                  <input key={p.id} value={alloc[p.id] || ""} onChange={e=>setAlloc({...alloc, [p.id]: Number(e.target.value)})}
                         placeholder={`${p.name} share`} className="w-full p-2 rounded bg-transparent border mb-2"/>
                ))}
                <div className="flex gap-2">
                  <button onClick={addExpense} className="px-4 py-2 btn-neon rounded">Add Expense</button>
                  <button onClick={()=>setShowForm(false)} className="px-4 py-2 rounded border">Cancel</button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {expenses.length === 0 && <div className="text-slate-400">No expenses yet — add one to start splitting</div>}
              {expenses.map(ex=>(
                <div key={ex.id} className="p-3 rounded-lg bg-gradient-to-r from-[#07112a]/40 to-transparent flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{ex.title}</div>
                    <div className="text-xs text-slate-400">Paid by {participants.find(p=>p.id===ex.paidBy)?.name}</div>
                  </div>
                  <div className="text-lg font-semibold">₹{ex.amount}</div>
                </div>
              ))}
            </div>
          </section>

          <aside className="w-80 glass p-4 rounded-2xl tilt-on-cursor">
            <h4 className="font-semibold mb-3">Summary</h4>
            <div className="space-y-2">
              {Object.entries(balances).map(([id,amt])=>(
                <div key={id} className="flex justify-between text-sm">
                  <div>{participants.find(p=>p.id===id).name}</div>
                  <div className={amt >=0 ? "text-green-300":"text-rose-400"}>₹{amt.toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <h5 className="text-sm font-medium flex items-center gap-2">
                <span className="emoji-spin">🏆</span>
                Leaderboard
              </h5>
              <ul className="mt-2 text-sm">
                {[...participants].sort((a,b)=>b.points-a.points).map(p=>(
                  <li key={p.id} className="flex justify-between py-1">{p.name}<span>{p.points} pts</span></li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

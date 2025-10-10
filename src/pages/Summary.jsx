import React from "react";
import Navbar from "../components/Navbar";

/* For UI demo: mock settlement pairs */
export default function Summary(){
  const mock = [
    { from: "Raj", to: "Asha", amount: 300 },
    { from: "Sarah", to: "Raj", amount: 150 },
  ];
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Summary — Who owes whom</h2>
        <div className="grid gap-3">
          {mock.map((s,i)=>(
            <div key={i} className="glass p-4 rounded-lg flex items-center justify-between tilt-on-cursor">
              <div>
                <div className="text-sm opacity-80">{s.from} → {s.to}</div>
                <div className="font-semibold">₹{s.amount}</div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-2 rounded border">Remind</button>
                <a href="/upi" className="px-3 py-2 rounded btn-neon text-black">Pay</a>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";

/* Mock UPI screen (UI only) with query params */
export default function UpiPay(){
  const [params] = useSearchParams();
  const payTo = params.get('to') || 'Friend';
  const amount = +(params.get('amount') || 0);
  const note = params.get('description') || 'Settlement';
  const [showConfetti, setShowConfetti] = useState(false);

  const deeplink = useMemo(() => {
    // Generic UPI deeplink format (mock)
    const upiId = `${payTo.replace(/\s+/g,'').toLowerCase()}@upi`;
    const url = new URL('upi://pay');
    url.searchParams.set('pa', upiId);
    url.searchParams.set('pn', payTo);
    url.searchParams.set('am', amount.toFixed(2));
    url.searchParams.set('cu', 'INR');
    url.searchParams.set('tn', note);
    return url.toString();
  }, [payTo, amount, note]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="p-6 max-w-md mx-auto">
        <div className="glass p-6 rounded-2xl text-center tilt-on-cursor">
          <h3 className="text-xl font-bold mb-2">UPI Pay (Mock)</h3>
          <p className="text-slate-300 mb-4">Pay {payTo} ₹{amount.toFixed(2)} securely</p>

          <div className="bg-slate-900/40 p-4 rounded mb-4">
            <div className="text-sm opacity-70">To</div>
            <div className="font-semibold">{payTo}</div>
            <div className="mt-2 text-2xl">₹{amount.toFixed(2)}</div>
            <div className="text-xs opacity-70 mt-1">Note: {note}</div>
          </div>

          <a href={deeplink}
             onClick={(e)=>{ e.preventDefault(); setShowConfetti(true); setTimeout(()=>setShowConfetti(false), 1400); }}
             className="block w-full py-3 rounded-xl btn-neon text-black text-center">Pay via UPI</a>

          <div className="mt-3 text-sm text-slate-400">This is a concept screen — in a real app, open UPI app via deeplink or show QR.</div>
        </div>
        {showConfetti && (
          <div className="confetti">
            {Array.from({ length: 60 }).map((_, i) => (
              <span key={i} style={{
                left: Math.random()*100+"%",
                background: `hsl(${Math.random()*360},90%,60%)`,
                animationDelay: (Math.random()*0.4)+"s",
              }} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Bell, CheckCircle, Users, TrendingUp, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NumberFlow from "@number-flow/react";
import Confetti from "react-confetti";
import { usePayment } from "../hooks/usePayment";
// import { useWindowSize } from "react-use"; // Removed to avoid extra dependency // Assuming react-use is installed or we use simple window dimensions

/* For demo: compute a quick mock summary from localStorage expenses */
function computeMock() {
  const expenses = JSON.parse(localStorage.getItem("smartsplit_expenses_v1") || "[]");
  const participants = JSON.parse(localStorage.getItem("smartsplit_participants_v1") || "[]");
  if (!participants.length) return [];
  const map = {};
  participants.forEach(p => map[p.id] = 0);
  expenses.forEach(e => {
    map[e.paidBy] += e.amount;
    e.splits.forEach(s => map[s.participantId] -= s.value);
  });
  // create simple settlements
  const entries = Object.entries(map).map(([id, amt]) => ({ id, amt: Math.round(amt * 100) / 100 }));
  let debtors = entries.filter(e => e.amt < -0.01).sort((a, b) => a.amt - b.amt);
  let creditors = entries.filter(e => e.amt > 0.01).sort((a, b) => b.amt - a.amt);
  const res = [];
  while (debtors.length && creditors.length) {
    const d = debtors[0], c = creditors[0];
    const settle = Math.min(Math.abs(d.amt), c.amt);
    res.push({ from: d.id, to: c.id, amount: Math.round(settle * 100) / 100 });
    d.amt += settle; c.amt -= settle;
    if (Math.abs(d.amt) < 0.01) debtors.shift();
    if (Math.abs(c.amt) < 0.01) creditors.shift();
  }
  return { participants, res, totalSettlements: res.reduce((sum, s) => sum + s.amount, 0) };
}

export default function Summary() {
  const data = computeMock();
  const { handlePayment, isLoading, error } = usePayment();
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Update window size for confetti
  React.useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const onPayClick = (settlement) => {
    const fromName = data.participants.find(p => p.id === settlement.from)?.name || "User";
    const toName = data.participants.find(p => p.id === settlement.to)?.name || "Recipient";

    handlePayment(
      settlement.amount,
      `Settlement: ${fromName} -> ${toName}`,
      (response) => {
        // On Success
        console.log("Payment ID:", response.razorpay_payment_id);
        setPaymentSuccess(true);
        setTimeout(() => setPaymentSuccess(false), 8000); // Stop confetti after 8s
      },
      (errorMsg) => {
        alert(errorMsg);
      }
    );
  };

  if (!data.participants) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pb-20">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-slate-200/60 dark:border-slate-700/60 shadow-lg">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                <Users className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Data Available</h3>
              <p className="text-muted-foreground">Add some expenses to see settlement summary</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { participants, res, totalSettlements } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pb-20 overflow-hidden">
      {paymentSuccess && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={500} />}

      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white py-16 sm:py-20 mb-8">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent" />
        <div className="relative max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-2xl mb-4 shadow-lg">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-cyan-200">
              Settlement Summary
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl font-light">
              Simplified settlements - who owes whom
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <Card className="backdrop-blur-sm bg-gradient-to-br from-purple-50/80 to-purple-100/80 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200/60 dark:border-purple-700/60 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Settlements</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                      <NumberFlow value={res.length} />
                    </p>
                  </div>
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <CheckCircle className="w-8 h-8 text-purple-600" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <Card className="backdrop-blur-sm bg-gradient-to-br from-green-50/80 to-green-100/80 dark:from-green-900/20 dark:to-green-800/20 border-green-200/60 dark:border-green-700/60 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                      ₹<NumberFlow value={totalSettlements} format={{ notation: "compact" }} />
                    </p>
                  </div>
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <Card className="backdrop-blur-sm bg-gradient-to-br from-cyan-50/80 to-cyan-100/80 dark:from-cyan-900/20 dark:to-cyan-800/20 border-cyan-200/60 dark:border-cyan-700/60 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Participants</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-700 bg-clip-text text-transparent">
                      <NumberFlow value={participants.length} />
                    </p>
                  </div>
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Users className="w-8 h-8 text-cyan-600" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Settlements */}
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-slate-200/60 dark:border-slate-700/60 shadow-lg">
          <CardHeader>
            <CardTitle>Required Settlements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {res.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-600" />
                <p className="text-lg font-semibold">Everything is settled!</p>
                <p className="text-sm text-muted-foreground">No pending payments</p>
              </div>
            ) : (
              res.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ x: 4 }}
                >
                  <Card className="backdrop-blur-sm bg-slate-50/80 dark:bg-slate-800/50 border-slate-200/60 dark:border-slate-700/60 hover:shadow-md transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="text-xs">
                              {participants.find(p => p.id === s.from)?.name}
                            </Badge>
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            <Badge variant="secondary" className="text-xs">
                              {participants.find(p => p.id === s.to)?.name}
                            </Badge>
                          </div>
                          <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                            ₹<NumberFlow value={s.amount} />
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => alert('Reminder sent (mock)')}
                            >
                              <Bell className="w-4 h-4 mr-2" />
                              Remind
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              size="sm"
                              onClick={() => onPayClick(s)}
                              disabled={isLoading}
                              className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 shadow-md hover:shadow-lg transition-all"
                            >
                              {isLoading ? "Processing..." : "Pay Now"}
                              {!isLoading && <CreditCard className="w-4 h-4 ml-2" />}
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

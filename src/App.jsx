import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Summary from "./pages/Summary";
import UpiPay from "./pages/UpiPay";
import AddExpense from "./pages/AddExpense";
import BalanceSummary from "./pages/BalanceSummary";
import Analytics from "./pages/Analytics";
import Groups from "./pages/Groups";
import CursorGlow from "./components/CursorGlow";
import CommandPalette from "./components/CommandPalette";

export default function App(){
  const location = useLocation();
  return (
    <div className="min-h-screen">
      <CursorGlow />
      <CommandPalette />
      <AnimatePresence mode="wait">
        <motion.div key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: "easeOut" }}>
          <Routes location={location}>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/summary" element={<Summary />} />
            <Route path="/upi" element={<UpiPay />} />
            <Route path="/add-expense" element={<AddExpense />} />
            <Route path="/balance-summary" element={<BalanceSummary />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="*" element={<div className="p-6 text-center text-slate-300">Page not found</div>} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
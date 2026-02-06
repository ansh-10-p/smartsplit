import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Summary from "./pages/Summary";
import UpiPay from "./pages/UpiPay";
import Transactions from "./pages/Transactions";
import Group from "./pages/Group";
import Reminders from "./pages/Reminders";
import Settings from "./pages/Settings";
import AIChat from "./pages/AIChat";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import Help from "./pages/Help";
import Budget from "./pages/Budget";

// Components
import Navbar from "./components/Navbar";
import CursorGlow from "./components/CursorGlow";
import CommandPalette from "./components/CommandPalette";
import AnimatedGrid from "./components/AnimatedGrid";
import OnboardingFlow from "./components/OnboardingFlow";

// Context
export const AuthContext = React.createContext({
  user: null,
  login: () => { },
  logout: () => { },
});

export default function App() {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("smartsplit_user") || "null")
  );
  const navigate = useNavigate();
  const location = useLocation();
  const hideNavbar = location.pathname === "/" || location.pathname === "/login" || location.pathname === "/signup";

  useEffect(() => {
    localStorage.setItem("smartsplit_user", JSON.stringify(user));
  }, [user]);

  const login = (u) => {
    setUser(u);
    navigate("/dashboard");
  };

  const logout = () => {
    setUser(null);
    navigate("/");
  };

  const PrivateRoute = ({ element }) => {
    const storedUser = JSON.parse(
      localStorage.getItem("smartsplit_user") || "null"
    );
    return storedUser ? element : <Login />;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <div className="min-h-screen text-slate-100 relative">
        <AnimatedGrid />
        <CursorGlow />
        {/* We moved CommandPalette to Navbar but keeping component import if needed elsewhere, 
            though typically we want one global one. 
            The Navbar now has the advanced one, so we should rely on that or disable this one if it duplicates.
            Assuming the existing CommandPalette component was the old one, we can keep it for now 
            or remove it if Navbar covers it. 
            Let's keep it to avoid breaking changes but rely on Navbar's implementation for logged in users.
         */}
        {/* <CommandPalette /> */}

        <OnboardingFlow />

        {!hideNavbar && <Navbar />}

        <div className={hideNavbar ? "" : "pt-20"}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <Routes location={location}>
                {/* Settings / Reminders / UPI */}
                <Route path="/settings" element={<Settings />} />
                <Route path="/reminders" element={<Reminders />} />
                <Route path="/upi" element={<UpiPay />} />

                {/* Public */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Protected */}
                <Route
                  path="/dashboard"
                  element={<PrivateRoute element={<Dashboard />} />}
                />
                <Route
                  path="/summary"
                  element={<PrivateRoute element={<Summary />} />}
                />
                <Route
                  path="/transactions"
                  element={<PrivateRoute element={<Transactions />} />}
                />
                <Route
                  path="/groups"
                  element={<PrivateRoute element={<Group />} />}
                />
                <Route
                  path="/ai-chat"
                  element={<PrivateRoute element={<AIChat />} />}
                />
                <Route
                  path="/analytics"
                  element={<PrivateRoute element={<Analytics />} />}
                />
                <Route
                  path="/profile"
                  element={<PrivateRoute element={<Profile />} />}
                />
                <Route
                  path="/notifications"
                  element={<PrivateRoute element={<Notifications />} />}
                />
                <Route
                  path="/budget"
                  element={<PrivateRoute element={<Budget />} />}
                />
                <Route path="/help" element={<Help />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </AuthContext.Provider>
  );
}

import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";

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

// Components
import Navbar from "./components/Navbar";
import CursorGlow from "./components/CursorGlow";
import CommandPalette from "./components/CommandPalette";
import AnimatedGrid from "./components/AnimatedGrid";

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
  const hideNavbar = location.pathname === "/";

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
        <CommandPalette />

        {!hideNavbar && <Navbar />}

        <div className={hideNavbar ? "" : "pt-20"}>
          <Routes>
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

            {/* (If you had a duplicate /upi route below, it’s safe to keep just one) */}
          </Routes>
        </div>
      </div>
    </AuthContext.Provider>
  );
}
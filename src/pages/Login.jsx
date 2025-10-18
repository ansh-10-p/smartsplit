import React, { useContext, useState } from "react";
import { AuthContext } from "../App";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const nav = useNavigate();

  function handle(e) {
    e.preventDefault();
    // check local users in localStorage
    const stored = JSON.parse(localStorage.getItem("smartsplit_users") || "[]");
    const found = stored.find(u => u.email === email && u.password === pass);
    if (found) { login({ name: found.name, email: found.email }); }
    else {
      alert("User not found — try signing up or use any credentials to create an account.");
      // Allow quick demo creation:
      const create = window.confirm("Create a demo account with this email?");
      if (create) {
        const newUser = { name: email.split("@")[0], email, password: pass };
        stored.push(newUser);
        localStorage.setItem("smartsplit_users", JSON.stringify(stored));
        login({ name: newUser.name, email: newUser.email });
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={handle} className="w-full max-w-md glass p-6 rounded-2xl">
        <h2 className="text-3xl font-light font-serif mb-6 tracking-wide">Login to SmartSplit</h2>
        <input required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full p-3 rounded bg-transparent border border-slate-700 mb-3" />
        <input required value={pass} onChange={e => setPass(e.target.value)} placeholder="Password" type="password" className="w-full p-3 rounded bg-transparent border border-slate-700 mb-4" />
        <button className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-all duration-200">Login</button>
        <div className="mt-3 text-sm text-slate-400">No backend — user accounts stored locally for demo.</div>
      </form>
    </div>
  );
}

import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../App";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const nav = useNavigate();
  const { login } = useContext(AuthContext);

  function handle(e) {
    e.preventDefault();
    if (!name || !email || !pass) return alert("fill all fields");
    const users = JSON.parse(localStorage.getItem("smartsplit_users") || "[]");
    if (users.some(u => u.email === email)) return alert("User exists — please login.");
    const newUser = { name, email, password: pass };
    users.push(newUser);
    localStorage.setItem("smartsplit_users", JSON.stringify(users));
    login({ name, email });
    nav("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={handle} className="w-full max-w-md glass p-6 rounded-2xl">
        <h2 className="text-3xl font-light font-serif mb-6 tracking-wide">Create your account</h2>
        <input required value={name} onChange={e => setName(e.target.value)} placeholder="Full name" className="w-full p-3 rounded bg-transparent border border-slate-700 mb-3" />
        <input required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full p-3 rounded bg-transparent border border-slate-700 mb-3" />
        <input required value={pass} onChange={e => setPass(e.target.value)} placeholder="Password" type="password" className="w-full p-3 rounded bg-transparent border border-slate-700 mb-4" />
        <button className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-all duration-200">Sign Up</button>
      </form>
    </div>
  );
}

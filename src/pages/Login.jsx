import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";

export default function Login(){
  const [email,setEmail] = useState("");
  const [pass,setPass] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const nav = useNavigate();
  
  function fakeLogin(e){
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate loading animation
    setTimeout(() => {
      nav("/dashboard");
    }, 1500);
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <form onSubmit={fakeLogin} className="glass p-8 rounded-2xl">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-center mb-6"
            >
              <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
              <p className="text-slate-300">Sign in to your SmartSplit account</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="space-y-4"
            >
              <div>
                <input 
                  required 
                  value={email} 
                  onChange={e=>setEmail(e.target.value)} 
                  placeholder="Email"
                  className="w-full p-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
              </div>
              
              <div>
                <input 
                  required 
                  value={pass} 
                  onChange={e=>setPass(e.target.value)} 
                  placeholder="Password" 
                  type="password"
                  className="w-full p-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-6"
            >
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-xl btn-neon text-white font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-4 text-center"
            >
              <p className="text-sm text-slate-400">
                No backend — this is a UI mockup. Login routes to Dashboard.
              </p>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import LandingNavbar from "../../components/landing/LandingNavbar";
import Button from "../../components/landing/Button";
import Card from "../../components/landing/Card";
import { Lock, Mail, ChevronLeft, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Login({ navigate }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Basic validation
      if (!email || !password || !role) {
        throw new Error("Please fill in all fields.");
      }

      const response = await fetch(
        "http://localhost:8000/api/v1/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, role }),
        }
      );

      if (!response.ok) {
        throw new Error("Invalid credentials or role.");
      }

      const data = await response.json();

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("token_type", data.token_type);
      localStorage.setItem("role", role.toLowerCase());

      if (role === "REVIEWER") navigate("/reviewer");
      else if (role === "UPLOADER") navigate("/uploader");
      else if (role === "APPROVER") navigate("/approver");
      else if (role === "ADMIN") navigate("/admin");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-950 flex flex-col font-sans text-slate-300">
      <LandingNavbar navigate={navigate} />

      <div className="flex-1 flex items-center justify-center p-6 pt-32 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-brand-accent/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-brand-cyan/10 rounded-full blur-[150px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="!p-8 md:!p-10 border-brand-800 bg-brand-900/60 backdrop-blur-xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
              <p className="text-slate-400 text-sm">Sign in to your DLM Agent account</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm"
              >
                <AlertCircle size={18} />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="email"
                    className="w-full bg-brand-950 border border-brand-800 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-brand-accent transition-colors"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="password"
                    className="w-full bg-brand-950 border border-brand-800 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-brand-accent transition-colors"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">Select Role</label>
                <div className="relative">
                  <select
                    className="w-full bg-brand-950 border border-brand-800 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-brand-accent transition-colors appearance-none"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="">Choose a role...</option>
                    <option value="ADMIN">Administrator</option>
                    <option value="UPLOADER">Uploader</option>
                    <option value="REVIEWER">Reviewer</option>
                    <option value="APPROVER">Approver</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full !py-3 !text-lg !font-semibold shadow-xl shadow-indigo-500/20"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <button onClick={() => navigate("/")} className="text-slate-500 hover:text-white transition-colors text-sm flex items-center justify-center gap-2 mx-auto">
                <ChevronLeft size={16} /> Back to Home
              </button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

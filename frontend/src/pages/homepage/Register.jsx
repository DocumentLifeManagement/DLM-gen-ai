import React, { useState } from "react";
import LandingNavbar from "../../components/landing/LandingNavbar";
import Button from "../../components/landing/Button";
import Card from "../../components/landing/Card";
import { Lock, Mail, ChevronLeft, AlertCircle, User as UserIcon, Eye, EyeOff, UserPlus } from "lucide-react";
import { motion } from "framer-motion";

export default function Register({ navigate }) {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            if (!fullName || !email || !password) {
                throw new Error("Please fill in all fields.");
            }

            const response = await fetch("http://localhost:8000/api/v1/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ full_name: fullName, email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Registration failed.");
            }

            localStorage.setItem("access_token", data.access_token);
            localStorage.setItem("token_type", data.token_type);
            localStorage.setItem("role", data.role.toLowerCase());

            navigate("/uploader");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-brand-accent/30 selection:text-white flex flex-col">
            {/* Navbar - Fixed at top */}
            <LandingNavbar navigate={navigate} />

            {/* Interactive Background Elements */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <motion.div 
                    animate={{
                        scale: [1, 1.2, 1],
                        x: [0, 50, 0],
                        y: [0, -30, 0],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-accent/10 rounded-full blur-[80px]" 
                />
                <motion.div 
                    animate={{
                        scale: [1, 1.3, 1],
                        x: [0, -60, 0],
                        y: [0, 40, 0],
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand-cyan/10 rounded-full blur-[80px]" 
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] mix-blend-overlay" />
            </div>

            {/* Centered Form Container */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pt-32 pb-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-[460px]"
                >
                    <Card className="!p-8 md:!p-10 border-brand-800/50 bg-[#0f172a]/95 backdrop-blur-2xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)] relative group overflow-visible rounded-[2.5rem]">
                        {/* Interactive Top Glow */}
                        <div className="absolute -top-px left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-brand-accent to-transparent opacity-60" />
                        
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-black text-white tracking-tight mb-2">Create Account</h1>
                            <p className="text-slate-400 text-sm font-medium">Join our community in just a few steps</p>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-xs"
                            >
                                <AlertCircle size={18} className="shrink-0" />
                                <span className="font-medium">{error}</span>
                            </motion.div>
                        )}

                        <form onSubmit={handleRegister} className="space-y-5">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Full Name</label>
                                <div className="relative group/input">
                                    <input
                                        type="text"
                                        className="w-full bg-[#020617]/50 border border-brand-800 rounded-2xl py-3.5 px-6 text-white placeholder-slate-600 focus:outline-none focus:border-brand-cyan/50 focus:ring-4 focus:ring-brand-cyan/5 transition-all outline-none text-[14px] font-medium"
                                        placeholder="Enter your full legal name"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Email Address</label>
                                <div className="relative group/input">
                                    <input
                                        type="email"
                                        className="w-full bg-[#020617]/50 border border-brand-800 rounded-2xl py-3.5 px-6 text-white placeholder-slate-600 focus:outline-none focus:border-brand-cyan/50 focus:ring-4 focus:ring-brand-cyan/5 transition-all outline-none text-[14px] font-medium"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Password</label>
                                <div className="relative group/input">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="w-full bg-[#020617]/50 border border-brand-800 rounded-2xl py-3.5 px-6 pr-14 text-white placeholder-slate-600 focus:outline-none focus:border-brand-cyan/50 focus:ring-4 focus:ring-brand-cyan/5 transition-all outline-none text-[14px] font-medium"
                                        placeholder="••••••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <motion.div
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                            >
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="w-full !py-3.5 !text-[16px] !font-black shadow-[0_20px_40px_-10px_rgba(34,211,238,0.4)] mt-3 relative overflow-hidden group rounded-2xl"
                                    disabled={loading}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                                    ) : (
                                        "Register Account"
                                    )}
                                </Button>
                            </motion.div>
                        </form>

                        <div className="mt-10 pt-8 border-t border-white/5 text-center space-y-4">
                            <p className="text-slate-400 text-xs tracking-wide">
                                Already have an account?{" "}
                                <button 
                                    onClick={() => navigate("/login")} 
                                    className="text-brand-cyan hover:text-white transition-colors font-bold underline underline-offset-8 decoration-brand-cyan/30 hover:decoration-white"
                                >
                                    Sign into account
                                </button>
                            </p>
                            <button 
                                onClick={() => navigate("/")} 
                                className="text-slate-500 hover:text-white transition-all text-xs font-semibold flex items-center justify-center gap-2 mx-auto group/back"
                            >
                                <ChevronLeft size={16} className="group-hover/back:-translate-x-1 transition-transform" /> Back to Homepage
                            </button>
                        </div>
                    </Card>
                </motion.div>
            </main>
        </div>
    );
}

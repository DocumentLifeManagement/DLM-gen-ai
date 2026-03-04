import React, { useState } from "react";
import LandingNavbar from "../../components/landing/LandingNavbar";
import Button from "../../components/landing/Button";
import Card from "../../components/landing/Card";
import { Lock, Mail, ChevronLeft, AlertCircle, User as UserIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function Register({ navigate }) {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
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
        <div className="min-h-screen bg-brand-950 flex flex-col font-sans text-slate-300">
            <LandingNavbar navigate={navigate} />

            <div className="flex-1 flex items-center justify-center p-4 pt-24 relative overflow-hidden h-screen">
                {/* Background Gradients */}
                <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-brand-accent/10 rounded-full blur-[150px] pointer-events-none" />
                <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-brand-cyan/10 rounded-full blur-[150px] pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    <Card className="!p-6 md:!p-8 border-brand-800 bg-brand-900/60 backdrop-blur-xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold text-white mb-1">Create Account</h1>
                            <p className="text-slate-400 text-xs">Sign up to get started as an Uploader</p>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-xs"
                            >
                                <AlertCircle size={16} />
                                {error}
                            </motion.div>
                        )}

                        <form onSubmit={handleRegister} className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">Full Name</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input
                                        type="text"
                                        className="w-full bg-brand-950 border border-brand-800 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-brand-accent transition-colors"
                                        placeholder="John Doe"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                    />
                                </div>
                            </div>

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

                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full !py-3 !text-lg !font-semibold shadow-xl shadow-indigo-500/20"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    "Create Account"
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 pt-4 border-t border-white/5 text-center flex flex-col items-center gap-2">
                            <span className="text-slate-400 text-xs">Already have an account? <button onClick={() => navigate("/login")} className="text-brand-accent hover:text-white transition-colors font-medium">Sign in</button></span>
                            <button onClick={() => navigate("/")} className="text-slate-500 hover:text-white transition-colors text-xs flex items-center justify-center gap-2 mt-1">
                                <ChevronLeft size={14} /> Back to Home
                            </button>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}

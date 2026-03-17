import React, { useState, useEffect } from "react";
import { CopyCheck, Menu, X, ChevronRight } from "lucide-react"; // Using CopyCheck as a document/lifecycle icon placeholder
import Button from "./Button";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";

export default function LandingNavbar({ navigate }) {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { label: "Home", path: "/" },
        { label: "About Us", path: "/about" },
        { label: "Contact Us", path: "/contact" },
    ];

    const currentPath = window.location.pathname;

    return (
        <nav
            className={clsx(
                "fixed top-0 left-0 right-0 z-[1000] transition-all duration-500 border-b",
                scrolled
                    ? "bg-[#020617]/90 backdrop-blur-2xl border-white/10 py-3 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]"
                    : "bg-[#020617]/50 backdrop-blur-sm border-transparent py-5"
            )}
        >
            <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
                {/* Logo */}
                <div
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => navigate("/")}
                >
                    <div className="w-11 h-11 bg-gradient-to-br from-brand-accent to-brand-cyan rounded-xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-300">
                        <CopyCheck size={26} />
                    </div>
                    <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-500 tracking-tight">
                        DLM Agent
                    </span>
                </div>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-10 ml-auto">
                    {navLinks.map((link) => (
                        <button
                            key={link.label}
                            onClick={() => navigate(link.path)}
                            className={clsx(
                                "text-[15px] font-bold transition-all duration-300 relative py-2 tracking-wide",
                                currentPath === link.path
                                    ? "text-white"
                                    : "text-slate-400 hover:text-white"
                            )}
                        >
                            {link.label}
                            {currentPath === link.path && (
                                <motion.div
                                    layoutId="nav-underline"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-accent shadow-[0_0_12px_rgba(99,102,241,0.6)]"
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* CTA */}
                <div className="hidden md:flex items-center gap-6 ml-10">
                    <button
                        onClick={() => navigate("/login")}
                        className="text-[15px] font-bold text-slate-400 hover:text-white transition-colors tracking-wide"
                    >
                        Sign In
                    </button>
                    <Button
                        variant="primary"
                        onClick={() => navigate("/register")}
                        className="!py-2.5 !px-6 !text-sm !font-bold rounded-xl"
                    >
                        Get Started
                        <ChevronRight size={18} />
                    </Button>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-white"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-brand-950 border-b border-white/10 overflow-hidden"
                    >
                        <div className="flex flex-col p-6 gap-4">
                            {navLinks.map((link) => (
                                <button
                                    key={link.label}
                                    onClick={() => {
                                        navigate(link.path);
                                        setMobileMenuOpen(false);
                                    }}
                                    className={clsx(
                                        "py-2 text-left transition-colors",
                                        currentPath === link.path ? "text-brand-accent font-bold" : "text-slate-300"
                                    )}
                                >
                                    {link.label}
                                </button>
                            ))}
                            <div className="h-px bg-white/10 my-2" />
                            <button
                                onClick={() => navigate("/login")}
                                className="text-slate-300 hover:text-white py-2 text-left"
                            >
                                Sign In
                            </button>
                            <Button
                                variant="primary"
                                onClick={() => navigate("/register")}
                                className="w-full justify-center"
                            >
                                Sign Up
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}

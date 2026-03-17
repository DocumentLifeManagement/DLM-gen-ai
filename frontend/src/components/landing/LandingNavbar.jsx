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
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                scrolled
                    ? "bg-brand-950/80 backdrop-blur-md border-b border-white/5 py-4"
                    : "bg-transparent py-6"
            )}
        >
            <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
                {/* Logo */}
                <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => navigate("/")}
                >
                    <div className="w-10 h-10 bg-gradient-to-br from-brand-accent to-brand-cyan rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                        <CopyCheck size={24} />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        DLM Agent
                    </span>
                </div>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8 ml-auto">
                    {navLinks.map((link) => (
                        <button
                            key={link.label}
                            onClick={() => navigate(link.path)}
                            className={clsx(
                                "text-sm font-medium transition-all duration-300 relative py-1",
                                currentPath === link.path
                                    ? "text-white"
                                    : "text-slate-400 hover:text-slate-200"
                            )}
                        >
                            {link.label}
                            {currentPath === link.path && (
                                <motion.div
                                    layoutId="nav-underline"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-accent shadow-[0_0_8px_rgba(79,70,229,0.5)]"
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* CTA */}
                <div className="hidden md:flex items-center gap-4 ml-8">
                    <button
                        onClick={() => navigate("/login")}
                        className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                    >
                        Sign In
                    </button>
                    <Button
                        variant="primary"
                        onClick={() => navigate("/register")}
                        className="!py-2 !px-4 !text-sm"
                    >
                        Sign Up
                        <ChevronRight size={16} />
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

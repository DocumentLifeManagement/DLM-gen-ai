import React, { useState, useEffect } from "react";
import DashboardSidebar from "./DashboardSidebar";
import clsx from "clsx";

export default function DashboardLayout({ children, role, navigate, title }) {
    // Persistent state for sidebar collapse (desktop)
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem("sidebar_collapsed");
        return saved === "true";
    });

    // Mobile sidebar open state
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem("sidebar_collapsed", isCollapsed);
    }, [isCollapsed]);

    // Close mobile sidebar on resize to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMobileOpen(false);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const toggleSidebar = () => setIsCollapsed(!isCollapsed);
    const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

    const currentPath = window.location.pathname;

    return (
        <div className="min-h-screen bg-transparent text-slate-300 font-sans flex">
            {/* Mobile sidebar overlay backdrop */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar - hidden on mobile unless open */}
            <div className={clsx(
                "fixed left-0 top-0 h-full z-50 transition-transform duration-300",
                "md:translate-x-0",
                isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}>
                <DashboardSidebar
                    role={role}
                    navigate={navigate}
                    activePath={currentPath}
                    isCollapsed={isCollapsed}
                    onToggle={toggleSidebar}
                    onMobileClose={() => setIsMobileOpen(false)}
                />
            </div>

            <main className={clsx(
                "flex-1 p-4 md:p-8 overflow-y-auto min-h-screen transition-all duration-300",
                // On desktop, offset by sidebar width
                "md:ml-20",
                !isCollapsed && "md:ml-64"
            )}>
                <header className="flex justify-between items-center mb-6 md:mb-8 gap-4">
                    {/* Mobile hamburger button */}
                    <div className="flex items-center gap-3">
                        <button
                            className="md:hidden p-2 rounded-lg bg-brand-800 text-slate-400 hover:text-white transition-colors border border-brand-700"
                            onClick={toggleMobile}
                            aria-label="Toggle Menu"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <line x1="3" y1="12" x2="21" y2="12" />
                                <line x1="3" y1="18" x2="21" y2="18" />
                            </svg>
                        </button>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-lg md:text-2xl font-bold text-white truncate">{title}</h2>
                            <p className="text-xs md:text-sm text-slate-500 flex items-center gap-2">
                                Welcome back, <span className="text-brand-accent font-semibold">{localStorage.getItem("full_name") || role}</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-brand-800 border border-brand-700 flex items-center justify-center text-white font-bold shadow-lg shadow-brand-950/50 text-sm">
                            {(localStorage.getItem("full_name")?.[0] || role[0]).toUpperCase()}
                        </div>
                    </div>
                </header>
                {children}
            </main>
        </div>
    );
}

import React, { useState, useEffect } from "react";
import DashboardSidebar from "./DashboardSidebar";
import clsx from "clsx";

export default function DashboardLayout({ children, role, navigate, title }) {
    // Persistent state for sidebar
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem("sidebar_collapsed");
        return saved === "true";
    });

    useEffect(() => {
        localStorage.setItem("sidebar_collapsed", isCollapsed);
    }, [isCollapsed]);

    const toggleSidebar = () => setIsCollapsed(!isCollapsed);

    // Use actual path for sidebar active state
    const currentPath = window.location.pathname;

    return (
        <div className="min-h-screen bg-brand-950 text-slate-300 font-sans flex">
            <DashboardSidebar
                role={role}
                navigate={navigate}
                activePath={currentPath}
                isCollapsed={isCollapsed}
                onToggle={toggleSidebar}
            />

            <main className={clsx(
                "flex-1 p-8 overflow-y-auto h-screen transition-all duration-300",
                isCollapsed ? "ml-20" : "ml-64"
            )}>
                <header className="flex justify-between items-center mb-8 gap-4">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-bold text-white truncate">{title}</h2>
                        <p className="text-sm text-slate-500 flex items-center gap-2">
                            Welcome back, <span className="text-brand-accent font-semibold">{localStorage.getItem("full_name") || role}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                        <div className="w-10 h-10 rounded-full bg-brand-800 border border-brand-700 flex items-center justify-center text-white font-bold shadow-lg shadow-brand-950/50">
                            {(localStorage.getItem("full_name")?.[0] || role[0]).toUpperCase()}
                        </div>
                    </div>
                </header>
                {children}
            </main>
        </div>
    );
}

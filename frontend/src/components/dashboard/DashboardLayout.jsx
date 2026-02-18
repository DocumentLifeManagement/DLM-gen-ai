import React, { useState, useEffect } from "react";
import DashboardSidebar from "./DashboardSidebar";

export default function DashboardLayout({ children, role, navigate, title }) {
    // Persistent state for sidebar
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem("sidebar_collapsed");
        return saved === "true";
    });

    useEffect(() => {
        localStorage.setItem("sidebar_collapsed", isCollapsed);
    }, [isCollapsed]);

    // Mock current path for sidebar active state (simplification)
    const currentPath = `/${role}`;

    return (
        <div className="min-h-screen bg-brand-950 text-slate-300 font-sans flex overflow-hidden">
            <DashboardSidebar
                role={role}
                navigate={navigate}
                activePath={currentPath}
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
            />

            <main className={`flex-1 ${isCollapsed ? 'ml-20' : 'ml-64'} transition-all duration-300 p-6 md:p-8 overflow-y-auto h-screen`}>
                <header className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-white leading-none tracking-tight">{title}</h2>
                            <p className="text-sm text-slate-500 mt-2">Authenticated as <span className="text-brand-accent font-bold uppercase">{role}</span></p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-brand-800 border border-brand-700 flex items-center justify-center text-white font-bold shadow-lg">
                            {role[0].toUpperCase()}
                        </div>
                    </div>
                </header>
                <div className="animate-in fade-in duration-500">
                    {children}
                </div>
            </main>
        </div>
    );
}

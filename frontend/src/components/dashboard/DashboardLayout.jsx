import React from "react";
import DashboardSidebar from "./DashboardSidebar";

export default function DashboardLayout({ children, role, navigate, title }) {
    // Mock current path for sidebar active state (simplification)
    const currentPath = `/${role}`;

    return (
        <div className="min-h-screen bg-brand-950 text-slate-300 font-sans flex">
            <DashboardSidebar role={role} navigate={navigate} activePath={currentPath} />

            <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-white">{title}</h2>
                        <p className="text-sm text-slate-500">Welcome back, {role}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-brand-800 border border-brand-700 flex items-center justify-center text-white font-bold">
                            {role[0].toUpperCase()}
                        </div>
                    </div>
                </header>
                {children}
            </main>
        </div>
    );
}

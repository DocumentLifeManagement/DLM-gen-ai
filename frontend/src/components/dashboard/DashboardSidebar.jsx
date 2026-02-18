import React from "react";
import {
    UploadCloud,
    FileText,
    CheckCircle,
    Settings,
    LogOut,
    LayoutDashboard,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import clsx from "clsx";

export default function DashboardSidebar({ role, navigate, activePath, isCollapsed, setIsCollapsed }) {
    const links = [
        { label: "Dashboard", href: `/${role}`, icon: LayoutDashboard },
        { label: "Uploads", href: "/uploader", icon: UploadCloud, role: "uploader" },
        { label: "Reviews", href: "/reviewer", icon: FileText, role: "reviewer" },
        { label: "Approvals", href: "/approver", icon: CheckCircle, role: "approver" },
        { label: "Admin", href: "/admin", icon: Settings, role: "admin" },
    ];

    const filteredLinks = links.filter(l => !l.role || l.role === role);

    const toggleSidebar = () => setIsCollapsed(!isCollapsed);

    return (
        <div className={clsx(
            "h-screen bg-brand-950 border-r border-brand-800 flex flex-col fixed left-0 top-0 transition-all duration-300 z-50",
            isCollapsed ? "w-20" : "w-64"
        )}>
            {/* Header: Logo & Toggle */}
            <div className={clsx(
                "h-20 border-b border-brand-800 flex items-center transition-all duration-300 overflow-hidden",
                isCollapsed ? "px-3 justify-center gap-1" : "px-6 justify-between"
            )}>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-brand-accent rounded-lg flex items-center justify-center text-white shrink-0 font-bold text-sm">
                        DL
                    </div>
                    {!isCollapsed && (
                        <span className="text-base font-bold text-white tracking-tight whitespace-nowrap">
                            DLM Agent
                        </span>
                    )}
                </div>

                <button
                    onClick={toggleSidebar}
                    className={clsx(
                        "p-1.5 hover:bg-brand-800 rounded-lg text-slate-500 hover:text-white transition-all",
                        isCollapsed ? "shrink-0" : ""
                    )}
                    title={isCollapsed ? "Expand" : "Collapse"}
                >
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 p-3 mt-4 space-y-1 overflow-y-auto custom-scrollbar">
                {filteredLinks.map((link) => {
                    const isActive = activePath === link.href || (activePath.startsWith(link.href) && link.href !== `/${role}`);
                    return (
                        <button
                            key={link.label}
                            onClick={() => navigate(link.href)}
                            title={isCollapsed ? link.label : ""}
                            className={clsx(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium overflow-hidden whitespace-nowrap group relative",
                                isActive
                                    ? "text-white bg-brand-900" // Subtle background for active
                                    : "text-slate-400 hover:text-white hover:bg-brand-900/50"
                            )}
                        >
                            <link.icon size={18} className={clsx(
                                "shrink-0",
                                isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                            )} />
                            {!isCollapsed && <span>{link.label}</span>}
                        </button>
                    );
                })}
            </nav>

            {/* Logout Footer */}
            <div className="p-3 border-t border-brand-800">
                <button
                    onClick={() => {
                        localStorage.removeItem("role");
                        localStorage.removeItem("access_token");
                        navigate("/login");
                    }}
                    title={isCollapsed ? "Sign Out" : ""}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 text-sm font-medium overflow-hidden whitespace-nowrap group"
                >
                    <LogOut size={18} className="shrink-0" />
                    {!isCollapsed && <span>Sign Out</span>}
                </button>
            </div>
        </div>
    );
}

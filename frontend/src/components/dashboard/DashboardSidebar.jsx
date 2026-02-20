import React from "react";
import { UploadCloud, FileText, CheckCircle, Settings, LogOut, LayoutDashboard, ChevronLeft, ChevronRight, Users } from "lucide-react";
import clsx from "clsx";

export default function DashboardSidebar({ role, navigate, activePath, isCollapsed, onToggle }) {
    const links = [
        { label: "Dashboard", href: `/${role}`, icon: LayoutDashboard },
        { label: "Uploads", href: "/uploader", icon: UploadCloud, role: "uploader" },
        { label: "Reviews", href: "/reviewer", icon: FileText, role: "reviewer" },
        { label: "Approvals", href: "/approver", icon: CheckCircle, role: "approver" },
        { label: "Admin", href: "/admin", icon: Settings, role: "admin" },
        { label: "Users", href: "/admin/users", icon: Users, role: "admin" },
    ];

    const filteredLinks = links.filter(l => !l.role || l.role === role);

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
                    onClick={onToggle}
                    className={clsx(
                        "p-1.5 hover:bg-brand-800 rounded-lg text-slate-500 hover:text-white transition-all",
                        isCollapsed ? "shrink-0" : ""
                    )}
                    title={isCollapsed ? "Expand" : "Collapse"}
                >
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                {filteredLinks.map((link) => (
                    <button
                        key={link.label}
                        onClick={() => navigate(link.href)}
                        className={clsx(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium relative group",
                            activePath === link.href || activePath.startsWith(link.href + "/")
                                ? "bg-brand-900 text-white border border-brand-800"
                                : "text-slate-400 hover:text-white hover:bg-brand-900/50"
                        )}
                        title={isCollapsed ? link.label : ""}
                    >
                        <link.icon size={18} className="shrink-0" />
                        {!isCollapsed && <span className="truncate">{link.label}</span>}
                        {isCollapsed && (
                            <div className="absolute left-full ml-4 px-2 py-1 bg-brand-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                {link.label}
                            </div>
                        )}
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-brand-800">
                <button
                    onClick={() => {
                        localStorage.removeItem("role");
                        localStorage.removeItem("access_token");
                        navigate("/login");
                    }}
                    className={clsx(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium group relative",
                        isCollapsed && "justify-center px-0"
                    )}
                    title={isCollapsed ? "Sign Out" : ""}
                >
                    <LogOut size={18} className="shrink-0" />
                    {!isCollapsed && <span>Sign Out</span>}
                    {isCollapsed && (
                        <div className="absolute left-full ml-4 px-2 py-1 bg-red-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                            Sign Out
                        </div>
                    )}
                </button>
            </div>
        </div>
    );
}

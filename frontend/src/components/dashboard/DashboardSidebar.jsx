import React from "react";
import { UploadCloud, FileText, CheckCircle, Settings, LogOut, LayoutDashboard, ChevronLeft, ChevronRight, Users, X, ShieldAlert } from "lucide-react";
import clsx from "clsx";

export default function DashboardSidebar({ role, navigate, activePath, isCollapsed, onToggle, onMobileClose }) {
    const links = [
        { label: "Dashboard", href: `/${role}`, icon: LayoutDashboard },
        { label: "Users", href: "/admin/users", icon: Users, role: "admin" },
        { label: "SLA Breaches", href: "/admin/sla", icon: ShieldAlert, role: "admin" },
    ];

    const filteredLinks = links.filter(l => !l.role || l.role === role);

    const handleNavigation = (href) => {
        navigate(href);
        // Close mobile menu on navigation
        if (onMobileClose) onMobileClose();
    };

    return (
        <div className={clsx(
            "h-screen bg-brand-950 border-r border-brand-800 flex flex-col transition-all duration-300 z-50",
            // On mobile, always show full width sidebar when open
            "w-64 md:w-auto",
            // On desktop, toggle between collapsed and expanded
            isCollapsed ? "md:w-20" : "md:w-64"
        )}>
            {/* Header: Logo & Toggle */}
            <div className={clsx(
                "h-16 md:h-20 border-b border-brand-800 flex items-center transition-all duration-300 overflow-hidden",
                isCollapsed ? "md:px-3 md:justify-center md:gap-1 px-6 justify-between" : "px-6 justify-between"
            )}>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-brand-accent rounded-lg flex items-center justify-center text-white shrink-0 font-bold text-sm">
                        DL
                    </div>
                    {/* Show text always on mobile, conditionally on desktop */}
                    <span className={clsx(
                        "text-base font-bold text-white tracking-tight whitespace-nowrap",
                        isCollapsed ? "md:hidden" : ""
                    )}>
                        DLM Agent
                    </span>
                </div>

                {/* Mobile close button */}
                <button
                    onClick={onMobileClose}
                    className="md:hidden p-1.5 hover:bg-brand-800 rounded-lg text-slate-500 hover:text-white transition-all"
                    title="Close"
                >
                    <X size={18} />
                </button>

                {/* Desktop collapse toggle */}
                <button
                    onClick={onToggle}
                    className={clsx(
                        "hidden md:flex p-1.5 hover:bg-brand-800 rounded-lg text-slate-500 hover:text-white transition-all",
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
                        onClick={() => handleNavigation(link.href)}
                        className={clsx(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium relative group",
                            (link.href === "/admin" ? activePath === "/admin" : (activePath === link.href || activePath.startsWith(link.href + "/")))
                                ? "bg-brand-900 text-white border border-brand-800"
                                : "text-slate-400 hover:text-white hover:bg-brand-900/50"
                        )}
                        title={isCollapsed ? link.label : ""}
                    >
                        <link.icon size={18} className="shrink-0" />
                        {/* Always show text on mobile, conditionally on desktop */}
                        <span className={clsx("truncate", isCollapsed ? "md:hidden" : "")}>
                            {link.label}
                        </span>
                        {isCollapsed && (
                            <div className="hidden md:block absolute left-full ml-4 px-2 py-1 bg-brand-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
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
                        if (onMobileClose) onMobileClose();
                    }}
                    className={clsx(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium group relative",
                        isCollapsed && "md:justify-center md:px-0"
                    )}
                    title={isCollapsed ? "Sign Out" : ""}
                >
                    <LogOut size={18} className="shrink-0" />
                    <span className={clsx(isCollapsed ? "md:hidden" : "")}>Sign Out</span>
                    {isCollapsed && (
                        <div className="hidden md:block absolute left-full ml-4 px-2 py-1 bg-red-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                            Sign Out
                        </div>
                    )}
                </button>
            </div>
        </div>
    );
}

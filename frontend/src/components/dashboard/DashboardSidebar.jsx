import React from "react";
import { UploadCloud, FileText, CheckCircle, Settings, LogOut, LayoutDashboard } from "lucide-react";
import clsx from "clsx";

export default function DashboardSidebar({ role, navigate, activePath }) {
    const links = [
        { label: "Dashboard", href: `/${role}`, icon: LayoutDashboard },
        { label: "Uploads", href: "/uploader", icon: UploadCloud, role: "uploader" },
        { label: "Reviews", href: "/reviewer", icon: FileText, role: "reviewer" },
        { label: "Approvals", href: "/approver", icon: CheckCircle, role: "approver" },
        { label: "Admin", href: "/admin", icon: Settings, role: "admin" },
    ];

    const filteredLinks = links.filter(l => !l.role || l.role === role);

    return (
        <div className="w-64 h-screen bg-brand-950 border-r border-brand-800 flex flex-col fixed left-0 top-0">
            <div className="p-6 border-b border-brand-800">
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-brand-accent flex items-center justify-center text-white">DL</div>
                    DLM Agent
                </h1>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {filteredLinks.map((link) => (
                    <button
                        key={link.label}
                        onClick={() => navigate(link.href)}
                        className={clsx(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium",
                            activePath === link.href || activePath.startsWith(link.href + "/")
                                ? "bg-brand-900 text-white border border-brand-800"
                                : "text-slate-400 hover:text-white hover:bg-brand-900/50"
                        )}
                    >
                        <link.icon size={18} />
                        {link.label}
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
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
                >
                    <LogOut size={18} />
                    Sign Out
                </button>
            </div>
        </div>
    );
}

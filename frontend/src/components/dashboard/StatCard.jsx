import React from "react";
import Card from "../landing/Card";
import clsx from "clsx";

export default function StatCard({ title, value, icon: Icon, color = "text-brand-accent", compact = false }) {
    return (
        <Card className={clsx("flex items-center gap-4", compact ? "!p-4" : "!p-6")}>
            <div className={clsx(
                "rounded-lg bg-brand-950 border border-brand-800",
                compact ? "p-2" : "p-3",
                color
            )}>
                {Icon && <Icon size={compact ? 18 : 24} />}
            </div>
            <div>
                <p className={clsx("text-slate-500", compact ? "text-[10px] uppercase tracking-wider font-bold" : "text-sm")}>{title}</p>
                <h3 className={clsx("font-bold text-white", compact ? "text-lg" : "text-2xl")}>{value}</h3>
            </div>
        </Card>
    );
}

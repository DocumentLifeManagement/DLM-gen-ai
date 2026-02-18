import React from "react";
import Card from "../landing/Card";

export default function StatCard({ title, value, icon: Icon, color = "text-brand-accent" }) {
    return (
        <Card className="!p-6 flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-brand-950 border border-brand-800 ${color}`}>
                {Icon && <Icon size={24} />}
            </div>
            <div>
                <p className="text-sm text-slate-500">{title}</p>
                <h3 className="text-2xl font-bold text-white">{value}</h3>
            </div>
        </Card>
    );
}

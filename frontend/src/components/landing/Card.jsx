import React from "react";
import clsx from "clsx";

export default function Card({ children, className, hover = true }) {
    return (
        <div
            className={clsx(
                "bg-brand-900 border border-brand-800 rounded-2xl p-6 shadow-lg relative overflow-hidden",
                hover && "hover:border-brand-accent/50 transition-colors duration-300",
                className
            )}
        >
            {/* Subtle top glow */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-accent/20 to-transparent opacity-50" />
            {children}
        </div>
    );
}

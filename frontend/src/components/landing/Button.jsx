import React from "react";
import clsx from "clsx";
import { motion } from "framer-motion";

export default function Button({
    children,
    onClick,
    variant = "primary",
    className,
    type = "button",
    icon: Icon,
}) {
    const baseStyles =
        "flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-950 text-sm md:text-base";

    const variants = {
        primary:
            "bg-brand-accent hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 focus:ring-brand-accent",
        secondary:
            "bg-brand-900 border border-brand-700 hover:border-brand-accent/50 text-slate-300 hover:text-white focus:ring-brand-700",
        outline:
            "bg-transparent border border-brand-accent text-brand-accent hover:bg-brand-accent/10 focus:ring-brand-accent",
        ghost: "bg-transparent text-slate-400 hover:text-white hover:bg-white/5",
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type={type}
            onClick={onClick}
            className={clsx(baseStyles, variants[variant], className)}
        >
            {Icon && <Icon size={18} />}
            {children}
        </motion.button>
    );
}

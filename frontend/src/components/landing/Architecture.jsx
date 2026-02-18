import React from "react";
import Section from "./Section";
import ScrollReveal from "./ScrollReveal";
import { Layers, Shield, Database, Server, Cpu } from "lucide-react";

export default function Architecture() {
    const layers = [
        { name: "Ingestion Layer", icon: Server, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
        { name: "IDP Layer (Textract)", icon: Cpu, color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" },
        { name: "Generation Layer (LLM)", icon: Database, color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/20" },
        { name: "Orchestration Layer", icon: Layers, color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20" },
        { name: "Governance Layer", icon: Shield, color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20" },
    ];

    return (
        <Section id="architecture" className="bg-brand-950">
            <div className="text-center mb-16">
                <ScrollReveal width="100%">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        System Architecture
                    </h2>
                    <p className="text-slate-400">
                        A scalable, multi-layered architecture designed for high throughput and security.
                    </p>
                </ScrollReveal>
            </div>

            <div className="flex flex-col items-center gap-4 max-w-4xl mx-auto">
                {layers.map((layer, index) => (
                    <div key={index} className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${index * 100}ms` }}>
                        <div className={`w-full md:w-3/4 p-6 rounded-xl border ${layer.border} ${layer.bg} backdrop-blur-sm flex items-center justify-between group hover:scale-[1.02] transition-transform duration-300 shadow-lg`}>
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-lg bg-black/20 ${layer.color}`}>
                                    <layer.icon size={24} />
                                </div>
                                <h3 className="text-lg font-semibold text-white">{layer.name}</h3>
                            </div>
                            <div className="h-2 w-2 rounded-full bg-white/20 group-hover:bg-brand-cyan transition-colors" />
                        </div>
                        {index < layers.length - 1 && (
                            <div className="h-8 w-[2px] bg-gradient-to-b from-slate-700 to-slate-800" />
                        )}
                    </div>
                ))}
            </div>
        </Section>
    );
}

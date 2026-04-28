import React from "react";
import Section from "./Section";
import Button from "./Button";
import { Lock, History, FileCheck, Users } from "lucide-react";

export default function GovernanceDashboard() {
    return (
        <div className="bg-transparent overflow-hidden">
            {/* Governance Badges */}
            <Section id="governance">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24">
                    {[
                        { icon: Lock, label: "RBAC Access Control" },
                        { icon: History, label: "Immutable Audit Logs" },
                        { icon: FileCheck, label: "Retention Policies" },
                        { icon: Users, label: "Version Control" },
                    ].map((item, idx) => (
                        <div
                            key={idx}
                            className="flex items-center gap-3 p-4 rounded-full border border-brand-800 bg-brand-900/40 text-slate-300 justify-center hover:border-brand-accent/50 transition-colors"
                        >
                            <item.icon size={18} className="text-brand-accent" />
                            <span className="text-xs md:text-sm font-medium">
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Dashboard Preview */}
                <div className="relative rounded-2xl border border-brand-800 bg-brand-900 shadow-2xl p-2 md:p-4 max-w-6xl mx-auto">
                    {/* Fake Browser Bar */}
                    <div className="flex items-center gap-2 mb-4 px-4">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                        </div>
                        <div className="flex-1 text-center">
                            <div className="inline-block px-4 py-1 rounded bg-brand-950 text-xs text-slate-500">
                                admin.dlm-agent.ai/dashboard
                            </div>
                        </div>
                    </div>

                    {/* Dashboard UI Mockup */}
                    <div className="bg-brand-950 rounded-lg p-6 min-h-[400px] grid grid-cols-12 gap-6 opacity-90">
                        {/* Sidebar */}
                        <div className="col-span-2 border-r border-brand-800 hidden md:block pr-4">
                            <div className="space-y-4">
                                <div className="h-8 w-24 bg-brand-800 rounded animate-pulse" />
                                <div className="h-4 w-full bg-brand-800/50 rounded" />
                                <div className="h-4 w-3/4 bg-brand-800/50 rounded" />
                                <div className="h-4 w-5/6 bg-brand-800/50 rounded" />
                            </div>
                        </div>
                        {/* Main Content */}
                        <div className="col-span-12 md:col-span-10">
                            <div className="flex justify-between mb-8">
                                <div className="h-8 w-48 bg-brand-800 rounded" />
                                <div className="h-8 w-8 bg-brand-accent rounded-full" />
                            </div>
                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-6 mb-8">
                                <div className="h-32 bg-brand-900 rounded-xl border border-brand-800 p-4">
                                    <div className="h-4 w-20 bg-brand-800 rounded mb-4" />
                                    <div className="h-10 w-16 bg-brand-accent/20 rounded" />
                                </div>
                                <div className="h-32 bg-brand-900 rounded-xl border border-brand-800 p-4">
                                    <div className="h-4 w-20 bg-brand-800 rounded mb-4" />
                                    <div className="h-10 w-16 bg-brand-cyan/20 rounded" />
                                </div>
                                <div className="h-32 bg-brand-900 rounded-xl border border-brand-800 p-4">
                                    <div className="h-4 w-20 bg-brand-800 rounded mb-4" />
                                    <div className="h-10 w-16 bg-green-500/20 rounded" />
                                </div>
                            </div>
                            {/* Table */}
                            <div className="h-48 bg-brand-900 rounded-xl border border-brand-800" />
                        </div>
                    </div>

                    {/* Overlay CTA */}
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/20 to-transparent flex items-end justify-center pb-12">
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-white mb-4">
                                Complete Oversight
                            </h3>
                            <Button variant="primary">Explore Admin Features</Button>
                        </div>
                    </div>
                </div>
            </Section>
        </div>
    );
}

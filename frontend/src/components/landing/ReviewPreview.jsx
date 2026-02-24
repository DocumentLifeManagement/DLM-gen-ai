import React from "react";
import Section from "./Section";
import Card from "./Card";
import Button from "./Button";
import { Check, X, Edit3, Eye } from "lucide-react";

export default function ReviewPreview() {
    return (
        <Section className="bg-brand-950">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                    Human-in-the-Loop <span className="text-brand-accent">Precision</span>
                </h2>
                <p className="text-slate-400">
                    AI does the heavy lifting. Humans validate the edge cases.
                    Seamlessly integrated review interface inspired by industry standards.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto lg:h-[500px]">
                {/* Document Viewer (Left) */}
                <div className="flex-1 bg-brand-900 border border-brand-800 rounded-xl p-4 flex flex-col shadow-2xl relative overflow-hidden group">
                    <div className="bg-brand-950/50 p-2 rounded mb-4 flex justify-between items-center">
                        <span className="text-xs text-slate-500">invoice_AG-2024-001.pdf</span>
                        <div className="flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-400" />
                            <div className="w-2 h-2 rounded-full bg-yellow-400" />
                            <div className="w-2 h-2 rounded-full bg-green-400" />
                        </div>
                    </div>
                    {/* Mock Document */}
                    <div className="flex-1 bg-white/5 rounded relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://ui-avatars.com/api/?name=Invoice&background=0D8ABC&color=fff&size=512')] bg-cover opacity-10" />
                        {/* Highlight Overlay */}
                        <div className="absolute top-[20%] left-[10%] w-[30%] h-[5%] bg-brand-accent/30 border border-brand-accent animate-pulse" />
                        <div className="absolute top-[28%] left-[60%] w-[20%] h-[5%] bg-brand-cyan/30 border border-brand-cyan" />
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-brand-950/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="secondary" icon={Eye}>View Original</Button>
                    </div>
                </div>

                {/* Extraction Fields (Right) */}
                <div className="flex-1 flex flex-col gap-4">
                    <Card className="flex-1 border-brand-800 bg-brand-900/80 backdrop-blur">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                            <h3 className="font-semibold text-white">Extracted Data</h3>
                            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">confidence: 88%</span>
                        </div>

                        <div className="space-y-4">
                            {[
                                { label: "Invoice Number", value: "INV-2024-001", conf: "99%", status: "high" },
                                { label: "Vendor Name", value: "Acme Corp", conf: "98%", status: "high" },
                                { label: "Total Amount", value: "$4,500.00", conf: "88%", status: "medium" },
                                { label: "Date", value: "Oct 24, 2024", conf: "95%", status: "high" },
                            ].map((field, i) => (
                                <div key={i} className="flex justify-between items-center group p-2 hover:bg-white/5 rounded transition-colors">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-slate-500 mb-1">{field.label}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-white font-mono text-sm">{field.value}</span>
                                            {field.status === "medium" && <AlertTriangle size={12} className="text-yellow-400" />}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-1 hover:text-brand-cyan text-slate-500"><Edit3 size={14} /></button>
                                        <button className="p-1 hover:text-green-400 text-slate-500"><Check size={14} /></button>
                                        <button className="p-1 hover:text-red-400 text-slate-500"><X size={14} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 flex gap-4">
                            <Button variant="primary" className="flex-1 bg-green-600 hover:bg-green-700">Approve Document</Button>
                            <Button variant="secondary" className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10">Reject</Button>
                        </div>
                    </Card>
                </div>
            </div>
        </Section>
    );
}
import { AlertTriangle } from "lucide-react";

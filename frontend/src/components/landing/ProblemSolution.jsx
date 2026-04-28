import React from "react";
import Section from "./Section";
import Card from "./Card";
import ScrollReveal from "./ScrollReveal";
import { AlertTriangle, Check, BrainCircuit, Workflow, FileText } from "lucide-react";

export default function ProblemSolution() {
    return (
        <div className="bg-transparent">
            {/* Problem Section */}
            <Section id="features">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <ScrollReveal width="100%">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                            Enterprise Document Processing Is <span className="text-red-400">Broken</span>
                        </h2>
                        <p className="text-slate-400">
                            Traditional workflows are manual, error-prone, and lack visibility.
                            Organizations lose millions in operational inefficiencies and compliance
                            risks.
                        </p>
                    </ScrollReveal>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { title: "Manual Handling", desc: "Slow, error-prone data entry." },
                        { title: "Approval Delays", desc: "Bottlenecks in decision making." },
                        { title: "Compliance Risks", desc: "No audit trails or governance." },
                        { title: "High Costs", desc: "Expensive operational overhead." }
                    ].map((item, idx) => (
                        <Card key={idx} className="bg-brand-900/50 border-brand-800">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-red-400 mb-4">
                                    <AlertTriangle size={24} />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                                <p className="text-sm text-slate-500">{item.desc}</p>
                            </div>
                        </Card>
                    ))}
                </div>
            </Section>

            {/* Solution Section */}
            <Section className="bg-brand-900/30">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        The Intelligent <span className="text-brand-accent">Solution</span>
                    </h2>
                    <p className="text-slate-400">
                        A unified platform combining AI extraction, workflow automation, and
                        generative capabilities.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Pillar 1 */}
                    <Card className="p-8">
                        <div className="w-14 h-14 bg-brand-accent/10 rounded-2xl flex items-center justify-center text-brand-accent mb-6">
                            <BrainCircuit size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-4">Intelligent Document Processing</h3>
                        <ul className="space-y-3 text-slate-400 text-sm">
                            <li className="flex items-center gap-2"><Check size={16} className="text-brand-cyan" /> AWS Textract Integation</li>
                            <li className="flex items-center gap-2"><Check size={16} className="text-brand-cyan" /> 95%+ Extraction Accuracy</li>
                            <li className="flex items-center gap-2"><Check size={16} className="text-brand-cyan" /> Confidence Scoring</li>
                            <li className="flex items-center gap-2"><Check size={16} className="text-brand-cyan" /> Human-in-the-loop Review</li>
                        </ul>
                    </Card>

                    {/* Pillar 2 */}
                    <Card className="p-8 border-brand-accent/50 shadow-[0_0_30px_rgba(99,102,241,0.1)]">
                        <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 mb-6">
                            <Workflow size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-4">BPMN Workflow Orchestration</h3>
                        <ul className="space-y-3 text-slate-400 text-sm">
                            <li className="flex items-center gap-2"><Check size={16} className="text-brand-cyan" /> Camunda 8 Compatible</li>
                            <li className="flex items-center gap-2"><Check size={16} className="text-brand-cyan" /> SLA Monitoring</li>
                            <li className="flex items-center gap-2"><Check size={16} className="text-brand-cyan" /> Parallel & Serial Approvals</li>
                            <li className="flex items-center gap-2"><Check size={16} className="text-brand-cyan" /> Automated Escalation</li>
                        </ul>
                    </Card>

                    {/* Pillar 3 */}
                    <Card className="p-8">
                        <div className="w-14 h-14 bg-brand-cyan/10 rounded-2xl flex items-center justify-center text-brand-cyan mb-6">
                            <FileText size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-4">Grounded Generative AI</h3>
                        <ul className="space-y-3 text-slate-400 text-sm">
                            <li className="flex items-center gap-2"><Check size={16} className="text-brand-cyan" /> Vector Database RAG</li>
                            <li className="flex items-center gap-2"><Check size={16} className="text-brand-cyan" /> Policy-Aware Generation</li>
                            <li className="flex items-center gap-2"><Check size={16} className="text-brand-cyan" /> Audit-Aligned Drafting</li>
                            <li className="flex items-center gap-2"><Check size={16} className="text-brand-cyan" /> Contextual Summarization</li>
                        </ul>
                    </Card>
                </div>
            </Section>
        </div>
    );
}

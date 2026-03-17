import React from "react";
import LandingNavbar from "../../components/landing/LandingNavbar";
import Footer from "../../components/landing/Footer";
import Section from "../../components/landing/Section";
import { motion } from "framer-motion";
import { Users, Target, ShieldCheck } from "lucide-react";

export default function AboutUs({ navigate }) {
    return (
        <div className="bg-brand-950 min-h-screen text-slate-300 font-sans selection:bg-brand-accent/30 selection:text-white">
            <LandingNavbar navigate={navigate} />

            <main className="pt-24 md:pt-32">
                {/* Hero */}
                <Section className="text-center py-20">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-bold text-white mb-6"
                    >
                        Innovating <span className="text-brand-accent">Document Intelligence</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed"
                    >
                        We are on a mission to empower enterprises with autonomous document lifecycle management,
                        seamlessly blending AI-driven extraction with human governance.
                    </motion.p>
                </Section>

                {/* Values */}
                <Section className="py-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <ValueCard
                            icon={Target}
                            title="Mission Driven"
                            desc="To eliminate manual data entry and streamline complex workflows for businesses worldwide."
                        />
                        <ValueCard
                            icon={ShieldCheck}
                            title="Security First"
                            desc="Enterprise-grade security and compliance are at the core of everything we build."
                        />
                        <ValueCard
                            icon={Users}
                            title="Human Centric"
                            desc="AI should augment human potential, not replace it. We keep humans in the loop where it matters."
                        />
                    </div>
                </Section>

                {/* Story / Team Placeholder */}
                <Section className="py-20 bg-brand-900/20">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1 space-y-6">
                            <h2 className="text-3xl font-bold text-white">Our Story</h2>
                            <p className="text-slate-400 leading-relaxed">
                                Founded by a team of AI enthusiasts and enterprise architects, DLM Agent was born from the frustration of legacy document processing systems. We saw a gap where Generative AI could not only extract data but understand context, manage approvals, and ensure compliance autonomously.
                            </p>
                            <p className="text-slate-400 leading-relaxed">
                                Today, we serve leading enterprises in finance, healthcare, and legal sectors, processing millions of documents with unprecedented accuracy.
                            </p>
                        </div>
                        <div className="flex-1 bg-brand-800/50 rounded-2xl p-8 border border-white/5 aspect-video flex items-center justify-center">
                            <span className="text-brand-accent/50 font-mono text-lg">Office / Team Image Placeholder</span>
                        </div>
                    </div>
                </Section>
            </main>

            <Footer navigate={navigate} />
        </div>
    );
}

function ValueCard({ icon: Icon, title, desc }) {
    return (
        <div className="bg-brand-900/50 p-8 rounded-xl border border-brand-800 hover:border-brand-accent/50 transition-colors">
            <div className="w-12 h-12 bg-brand-accent/10 rounded-lg flex items-center justify-center mb-6 text-brand-accent">
                <Icon size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
            <p className="text-slate-400">{desc}</p>
        </div>
    );
}

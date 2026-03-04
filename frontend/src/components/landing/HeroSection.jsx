import React, { useState, useEffect } from "react";
import Section from "./Section";
import Button from "./Button";
import { motion, AnimatePresence } from "framer-motion";
import {
    UploadCloud,
    BrainCircuit,
    FileJson,
    GitMerge,
    CheckCircle2,
    Archive,
    ArrowRight,
} from "lucide-react";

const workflowSteps = [
    {
        id: "upload",
        icon: UploadCloud,
        label: "Ingest",
        desc: "Secure Multi-Channel Upload",
    },
    {
        id: "idp",
        icon: BrainCircuit,
        label: "IDP",
        desc: "OCR + NLP Extraction",
    },
    {
        id: "meta",
        icon: FileJson,
        label: "Extract",
        desc: "Structured Metadata",
    },
    {
        id: "bpmn",
        icon: GitMerge,
        label: "Workflow",
        desc: "BPMN Orchestration",
    },
    {
        id: "approval",
        icon: CheckCircle2,
        label: "Approve",
        desc: "Human-in-the-Loop",
    },
    {
        id: "archive",
        icon: Archive,
        label: "Archive",
        desc: "Immutable Storage",
    },
];

export default function HeroSection({ navigate }) {
    const [activeStep, setActiveStep] = useState(0);
    const [displayedText, setDisplayedText] = useState("");
    const subheadlineText = "Automate ingestion, extraction, approval, compliance, and archival with AI-driven orchestration and governance.";

    // Cycle through steps for animation
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % workflowSteps.length);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    // Custom Typewriter Effect
    useEffect(() => {
        let index = 0;
        const typeInterval = setInterval(() => {
            if (index <= subheadlineText.length) {
                setDisplayedText(subheadlineText.slice(0, index));
                index++;
            } else {
                clearInterval(typeInterval);
            }
        }, 30); // Typing speed
        return () => clearInterval(typeInterval);
    }, []);

    return (
        <div className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-brand-950">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-accent/20 rounded-full blur-[120px] animate-blob" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-cyan/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
            </div>

            <Section className="relative z-10 flex flex-col items-center text-center">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-900/50 border border-brand-800 text-brand-cyan text-xs font-medium uppercase tracking-wider mb-6 backdrop-blur-sm"
                >
                    <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
                    Generative AI Powered
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 max-w-4xl tracking-tight"
                >
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-accent to-brand-cyan">Autonomous</span> Document Lifecycle Management
                </motion.h1>

                {/* Subheadline with Typewriter */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed min-h-[60px]"
                >
                    {displayedText}
                    <span className="animate-pulse">|</span>
                </motion.p>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }} // Reduced delay for better UX
                    className="flex flex-col sm:flex-row gap-4 mb-32"
                >
                    <Button variant="primary" icon={ArrowRight} onClick={() => navigate('/register')}>
                        Sign Up
                    </Button>
                    <Button variant="secondary">Watch Demo</Button>
                </motion.div>

                {/* Animated Workflow Visualization */}
                <div className="w-full max-w-5xl">
                    {/* Desktop connecting line */}
                    <div className="relative hidden md:flex items-center justify-between px-10">
                        {/* Background Line */}
                        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-brand-800 -z-10" />

                        {/* Active Progress Line */}
                        <motion.div
                            className="absolute top-1/2 left-0 h-[2px] bg-gradient-to-r from-brand-accent to-brand-cyan -z-10"
                            initial={{ width: "0%" }}
                            animate={{
                                width: `${(activeStep / (workflowSteps.length - 1)) * 100}%`,
                            }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                        />

                        {workflowSteps.map((step, index) => {
                            const isActive = index === activeStep;
                            const isPast = index < activeStep;

                            return (
                                <div
                                    key={step.id}
                                    className="relative group"
                                >
                                    {/* Icon Circle */}
                                    <div
                                        className={`
                    w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all duration-500
                    ${isActive || isPast
                                                ? "bg-brand-950 border-brand-accent shadow-[0_0_20px_rgba(99,102,241,0.5)] scale-110"
                                                : "bg-brand-900 border-brand-800 text-slate-600 group-hover:border-brand-accent/50 group-hover:text-slate-400"
                                            }
                  `}
                                    >
                                        <step.icon
                                            size={24}
                                            className={`
                      transition-colors duration-500
                      ${isActive || isPast ? "text-brand-cyan" : "text-slate-500"
                                                }
                    `}
                                        />
                                    </div>

                                    {/* Label (Always visible) */}
                                    <div className="absolute top-20 left-1/2 -translate-x-1/2 text-center w-32">
                                        <p
                                            className={`text-sm font-semibold transition-colors duration-300 ${isActive ? "text-white" : "text-slate-500"
                                                }`}
                                        >
                                            {step.label}
                                        </p>
                                    </div>

                                    {/* Tooltip (Hover or Active) */}
                                    <AnimatePresence>
                                        {isActive && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute bottom-24 left-1/2 -translate-x-1/2 min-w-max bg-brand-800/80 backdrop-blur text-xs px-3 py-2 rounded border border-white/10 text-slate-300 pointer-events-none"
                                            >
                                                {step.desc}
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-brand-800/80" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>

                    {/* Mobile Vertical Steps (Simplified) */}
                    <div className="md:hidden flex flex-col gap-6">
                        {workflowSteps.map((step, index) => (
                            <div key={step.id} className={`flex items-center gap-4 p-4 rounded-lg border ${index === activeStep ? 'border-brand-accent bg-brand-900/50' : 'border-brand-800 bg-brand-900/20'}`}>
                                <step.icon size={24} className={index === activeStep ? 'text-brand-cyan' : 'text-slate-500'} />
                                <div>
                                    <h4 className={`font-medium ${index === activeStep ? 'text-white' : 'text-slate-400'}`}>{step.label}</h4>
                                    <p className="text-xs text-slate-500">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Section>
        </div>
    );
}

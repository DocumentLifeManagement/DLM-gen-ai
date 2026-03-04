import React, { useEffect, useRef } from "react";
import Section from "./Section";
import Button from "./Button";
import { ArrowRight } from "lucide-react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

function Counter({ value, suffix = "" }) {
    const ref = useRef(null);
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, { duration: 3000 });
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    useEffect(() => {
        if (isInView) {
            motionValue.set(value);
        }
    }, [isInView, value, motionValue]);

    useEffect(() => {
        springValue.on("change", (latest) => {
            if (ref.current) {
                ref.current.textContent = Math.floor(latest).toLocaleString() + suffix;
            }
        });
    }, [springValue, suffix]);

    return <span ref={ref} />;
}

export default function TechMetricsCTA() {
    return (
        <div className="bg-brand-950 text-white">
            {/* Metrics */}
            <Section id="metrics" className="border-t border-brand-800">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {[
                        { value: 95, suffix: "%+", label: "Extraction Accuracy" },
                        { value: 60, suffix: "%", label: "Faster Approvals" },
                        { value: 99, suffix: "%", label: "System Uptime" },
                        { value: 24, suffix: "/7", label: "Automated Processing" },
                    ].map((stat, idx) => (
                        <div key={idx} className="px-4">
                            <div className="text-4xl md:text-5xl font-bold text-brand-cyan mb-2">
                                <Counter value={stat.value} suffix={stat.suffix} />
                            </div>
                            <div className="text-sm text-slate-500 uppercase tracking-widest">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </Section>



            {/* Final CTA */}
            <Section className="text-center py-16 md:py-32">
                <div className="max-w-4xl mx-auto bg-gradient-to-r from-brand-900 to-brand-800 rounded-3xl p-8 md:p-12 border border-brand-700 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <h2 className="text-3xl md:text-5xl font-bold mb-6 relative z-10">
                        Transform Your Document Operations
                    </h2>
                    <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto relative z-10">
                        Join the enterprise leaders automating their workflows with our
                        autonomous AI system.
                    </p>
                    <div className="relative z-10">
                        <Button variant="primary" className="!text-lg !px-8 !py-4" icon={ArrowRight}>
                            Schedule Demo
                        </Button>
                    </div>
                </div>
            </Section>
        </div>
    );
}

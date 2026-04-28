import React from "react";
import Section from "./Section";
import { Twitter, Linkedin, Github } from "lucide-react";

export default function Footer({ navigate }) {
    const handleScroll = (id) => {
        if (!navigate) return;

        if (window.location.pathname !== "/") {
            navigate("/");
            setTimeout(() => {
                const element = document.getElementById(id);
                if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                }
            }, 100);
        } else {
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: "smooth" });
            }
        }
    };

    return (
        <footer className="bg-transparent border-t border-brand-800 py-12">
            <Section className="!py-0">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-4">
                            DLM Agent
                        </h3>
                        <p className="text-slate-400 max-w-xs text-sm leading-relaxed">
                            Enterprise-grade document lifecycle management powered by
                            generative AI. Automate, extracting, and governing your critical
                            business data.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Product</h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li>
                                <button onClick={() => handleScroll("features")} className="hover:text-brand-cyan transition-colors text-left">
                                    Features
                                </button>
                            </li>
                            <li>
                                <button onClick={() => handleScroll("governance")} className="hover:text-brand-cyan transition-colors text-left">
                                    Security
                                </button>
                            </li>
                            <li>
                                <button onClick={() => handleScroll("architecture")} className="hover:text-brand-cyan transition-colors text-left">
                                    Integration
                                </button>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4">Company</h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li>
                                <button
                                    onClick={() => {
                                        if (navigate) {
                                            navigate("/about");
                                            window.scrollTo(0, 0);
                                        }
                                    }}
                                    className="hover:text-brand-cyan transition-colors text-left"
                                >
                                    About Us
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => {
                                        if (navigate) {
                                            navigate("/contact");
                                            window.scrollTo(0, 0);
                                        }
                                    }}
                                    className="hover:text-brand-cyan transition-colors text-left"
                                >
                                    Contact
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-brand-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-slate-500">
                        © 2026 Document Lifecycle Management Agent. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        <a
                            href="#"
                            className="text-slate-500 hover:text-white transition-colors"
                        >
                            <Twitter size={18} />
                        </a>
                        <a
                            href="#"
                            className="text-slate-500 hover:text-white transition-colors"
                        >
                            <Linkedin size={18} />
                        </a>
                        <a
                            href="#"
                            className="text-slate-500 hover:text-white transition-colors"
                        >
                            <Github size={18} />
                        </a>
                    </div>
                </div>
            </Section>
        </footer>
    );
}

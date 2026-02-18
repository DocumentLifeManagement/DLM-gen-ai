import React from "react";
import LandingNavbar from "../../components/landing/LandingNavbar";
import Footer from "../../components/landing/Footer";
import Section from "../../components/landing/Section";
import Button from "../../components/landing/Button";
import { motion } from "framer-motion";
import { Mail, MapPin, Phone, Send } from "lucide-react";

export default function ContactUs({ navigate }) {
    return (
        <div className="bg-brand-950 min-h-screen text-slate-300 font-sans selection:bg-brand-accent/30 selection:text-white">
            <LandingNavbar navigate={navigate} />

            <main className="pt-20">
                <Section className="py-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                        {/* Contact Info */}
                        <div className="space-y-8">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                            >
                                <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Get in Touch</h1>
                                <p className="text-lg text-slate-400 leading-relaxed mb-12">
                                    Have questions about our platform or want to schedule a personalized demo?
                                    Our team is ready to help you transform your document workflows.
                                </p>
                            </motion.div>

                            <div className="space-y-6">
                                <ContactInfoItem icon={Mail} title="Email Us" value="hello@dlmagent.ai" />
                            </div>
                        </div>

                        {/* Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-brand-900/50 p-8 rounded-2xl border border-brand-800"
                        >
                            <form className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400">Full Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-brand-950/50 border border-brand-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400">Email Address</label>
                                    <input
                                        type="email"
                                        className="w-full bg-brand-950/50 border border-brand-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors"
                                        placeholder="john@company.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400">Message</label>
                                    <textarea
                                        className="w-full bg-brand-950/50 border border-brand-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors h-32 resize-none"
                                        placeholder="Tell us about your needs..."
                                    />
                                </div>
                                <Button variant="primary" className="w-full justify-center" icon={Send}>
                                    Send Message
                                </Button>
                            </form>
                        </motion.div>
                    </div>
                </Section>
            </main>

            <Footer navigate={navigate} />
        </div>
    );
}

function ContactInfoItem({ icon: Icon, title, value }) {
    return (
        <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-brand-800 rounded-lg flex items-center justify-center text-slate-300">
                <Icon size={20} />
            </div>
            <div>
                <h4 className="font-medium text-white">{title}</h4>
                <p className="text-slate-400">{value}</p>
            </div>
        </div>
    );
}

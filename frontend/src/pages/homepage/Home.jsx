import React, { useState } from "react";
import FeatureCard from "../../components/FeatureCard";
import DocumentIcon from "../../components/icons/DocumentIcon";
import { AIBrainIcon } from "../../components/icons/AIBrainIcon";
import { WorkflowIcon } from "../../components/icons/WorkflowIcon";
import { ReviewIcon } from "../../components/icons/ReviewIcon";
import { ShieldIcon } from "../../components/icons/ShieldIcon";

export default function Home({ navigate }) {
  const [darkMode, setDarkMode] = useState(false);

  const steps = [
    { label: "Upload", desc: "User uploads document securely" },
    { label: "Processing", desc: "AI extracts text using OCR & NLP" },
    { label: "Review", desc: "Human validates low-confidence fields" },
    { label: "Approval", desc: "Manager approves document" },
  ];

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors">

        {/* Navbar */}
        <nav className="flex justify-between items-center px-10 py-5 bg-white/70 dark:bg-gray-900/70 backdrop-blur shadow">
        <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
        >
            <DocumentIcon />
            <h1 className="text-xl font-bold text-blue-700 dark:text-blue-400">
            Document Lifecycle Management
            </h1>
        </div>

        <div className="flex items-center gap-6">
            {/* Home (ACTIVE HERE) */}
            <button
            onClick={() => navigate("/")}
            className={`transition ${
                window.location.pathname === "/"
                ? "text-blue-600 font-semibold"
                : "text-gray-600 dark:text-gray-300 hover:text-blue-600"
            }`}
            >
            Home
            </button>

            {/* About */}
            <button
            onClick={() => navigate("/about")}
            className={`transition ${
                window.location.pathname === "/about"
                ? "text-blue-600 font-semibold"
                : "text-gray-600 dark:text-gray-300 hover:text-blue-600"
            }`}
            >
            About
            </button>

            {/* Auth Action */}
            {localStorage.getItem("role") ? (
            <button
                onClick={() => {
                localStorage.removeItem("role");
                navigate("/");
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
            >
                Logout
            </button>
            ) : (
            <button
                onClick={() => navigate("/login")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
            >
                Sign In
            </button>
            )}
        </div>
        </nav>



        {/* Hero Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 px-10 py-24 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-6">
              Optimize Your Document Workflow with{" "}
              <span className="text-blue-600">AI</span>
            </h2>

            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-xl">
              Automate ingestion, extraction, review, approval, and audit using
              an AI-powered document lifecycle platform.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => navigate("/login")}
                className="bg-blue-600 text-white px-6 py-3 rounded text-lg hover:scale-105 transition"
              >
                Get Started
              </button>

              <button className="border border-blue-600 text-blue-600 px-6 py-3 rounded text-lg">
                Watch Demo
              </button>
            </div>
          </div>

          {/* Workflow Card */}
          <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border border-white/20 rounded-xl shadow-xl p-6">
            <p className="text-center font-semibold text-gray-500 dark:text-gray-300 mb-6">
              Document Lifecycle Flow
            </p>

            {/* Workflow + Progress Bar */}
            <div className="relative">

              {/* Progress bar BEHIND text */}
              <div className="absolute inset-x-0 top-5 -z-10">
                <div className="h-3 bg-blue-100 dark:bg-gray-700 rounded">
                  <div className="h-3 bg-blue-600 w-3/4 rounded animate-pulse"></div>
                </div>
              </div>

              {/* Workflow text ABOVE progress bar */}
              <div className="relative z-10 flex justify-between text-sm">
                {steps.map((step) => (
                  <div key={step.label} className="group relative cursor-pointer">
                    <span className="text-gray-700 dark:text-gray-300">
                      {step.label}
                    </span>

                    <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-44 text-xs text-white bg-gray-900 rounded p-2 opacity-0 group-hover:opacity-100 transition">
                      {step.desc}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </section>

        {/* Features */}
        <section className="px-10 pb-24">
          <h3 className="text-3xl font-bold text-center mb-14 text-gray-800 dark:text-white">
            Streamline Your Business Documentation
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <FeatureCard
              icon={<AIBrainIcon />}
              title="Intelligent Document Processing"
              desc="High-accuracy OCR and NLP powered extraction."
            />
            <FeatureCard
              icon={<WorkflowIcon />}
              title="Automated Workflow Orchestration"
              desc="Route documents automatically using workflows."
            />
            <FeatureCard
              icon={<ReviewIcon />}
              title="Review & Approve with Confidence"
              desc="Human-in-the-loop validation for AI output."
            />
            <FeatureCard
              icon={<ShieldIcon />}
              title="Secure Compliance & Audit Trail"
              desc="RBAC, governance, and immutable audit logs."
            />
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
          © 2025 Document Lifecycle Management System
        </footer>
      </div>
    </div>
  );
}

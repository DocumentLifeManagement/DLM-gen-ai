import React from "react";
import DocumentIcon from "../../components/icons/DocumentIcon";

export default function About({ navigate }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors">

      {/* ================= NAVBAR (SAME AS HOME) ================= */}
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

      {/* ================= HERO ================= */}
      <section className="px-10 py-24 text-center">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
          About the Project
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          An AI-powered{" "}
          <span className="text-blue-600 font-semibold">
            Document Lifecycle Management System
          </span>{" "}
          that automates document ingestion, extraction, review, approval,
          and audit using Intelligent Document Processing and
          Human-in-the-Loop workflows.
        </p>
      </section>

      {/* ================= STATS ================= */}
      <section className="px-10 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Stat value="95%+" label="Extraction Accuracy" />
          <Stat value="60%" label="Faster Approval Cycles" />
          <Stat value="100%" label="Audit Traceability" />
        </div>
      </section>

      {/* ================= DOCUMENT LIFECYCLE TIMELINE ================= */}
      <section className="px-10 pb-24">
        <h2 className="text-3xl font-bold text-center mb-16 text-gray-800 dark:text-white">
          Document Lifecycle Flow
        </h2>

        <div className="max-w-4xl mx-auto relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-0 h-full w-1 bg-blue-200 dark:bg-blue-800"></div>

          <TimelineItem
            step="1"
            title="Upload"
            desc="Users upload documents securely into the system."
          />
          <TimelineItem
            step="2"
            title="AI Processing"
            desc="OCR and NLP extract structured data with confidence scores."
          />
          <TimelineItem
            step="3"
            title="Human Review"
            desc="Low-confidence fields are manually validated and corrected."
          />
          <TimelineItem
            step="4"
            title="Approval"
            desc="Authorized users approve or reject documents."
          />
          <TimelineItem
            step="5"
            title="Audit & Archive"
            desc="Documents are stored with complete audit trails."
          />
        </div>
      </section>

      {/* ================= SYSTEM OVERVIEW (CARDS) ================= */}
      <section className="px-10 pb-32">
        <h2 className="text-3xl font-bold text-center mb-14 text-gray-800 dark:text-white">
          System Overview
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">

          <OverviewCard
            title="Problem Statement"
            desc="Manual document processing is slow, error-prone, and lacks governance, leading to operational inefficiencies and compliance risks."
          />

          <OverviewCard
            title="Proposed Solution"
            desc="An AI-driven document lifecycle platform integrating Intelligent Document Processing, role-based workflows, and human-in-the-loop validation."
          />

          <OverviewCard
            title="System Architecture"
            list={[
              "Frontend: React + Tailwind CSS",
              "Backend: FastAPI",
              "IDP: AWS Textract",
              "Storage: AWS S3",
              "Database: PostgreSQL",
              "Security: Role-Based Access Control",
            ]}
          />

          <OverviewCard
            title="Future Scope"
            list={[
              "BPMN-based workflow orchestration",
              "RAG-powered document generation",
              "Analytics and monitoring dashboard",
              "Multi-document and multilingual support",
            ]}
          />
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
        © 2025 Document Lifecycle Management System
      </footer>
    </div>
  );
}

/* ================= SUB COMPONENTS ================= */

function Stat({ value, label }) {
  return (
    <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur rounded-xl shadow p-6 text-center hover:scale-105 transition">
      <h3 className="text-3xl font-bold text-blue-600 mb-1">{value}</h3>
      <p className="text-gray-600 dark:text-gray-300">{label}</p>
    </div>
  );
}

function TimelineItem({ step, title, desc }) {
  return (
    <div className="relative flex items-start gap-6 mb-14 pl-14">
      <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow">
        {step}
      </div>

      <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur rounded-xl shadow p-6 w-full">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
          {title}
        </h4>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          {desc}
        </p>
      </div>
    </div>
  );
}

function OverviewCard({ title, desc, list }) {
  return (
    <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur rounded-xl shadow p-6 hover:shadow-xl transition">
      <h3 className="text-xl font-semibold text-blue-600 mb-3">
        {title}
      </h3>

      {desc && (
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          {desc}
        </p>
      )}

      {list && (
        <ul className="list-disc ml-6 text-gray-600 dark:text-gray-300 text-sm">
          {list.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

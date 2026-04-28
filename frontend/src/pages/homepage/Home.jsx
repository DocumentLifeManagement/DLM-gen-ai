import React from "react";
import LandingNavbar from "../../components/landing/LandingNavbar";
import HeroSection from "../../components/landing/HeroSection";
import ProblemSolution from "../../components/landing/ProblemSolution";
import Architecture from "../../components/landing/Architecture";
import GovernanceDashboard from "../../components/landing/GovernanceDashboard";
import ReviewPreview from "../../components/landing/ReviewPreview";
import TechMetricsCTA from "../../components/landing/TechMetricsCTA";
import Footer from "../../components/landing/Footer";

export default function Home({ navigate }) {
  return (
    <div className="bg-transparent min-h-screen text-slate-300 font-sans selection:bg-brand-accent/30 selection:text-white">
      <LandingNavbar navigate={navigate} />

      <main>
        <HeroSection navigate={navigate} />
        <ProblemSolution />
        <Architecture />
        <GovernanceDashboard />
        <ReviewPreview />
        <TechMetricsCTA />
      </main>

      <Footer navigate={navigate} />
    </div>
  );
}

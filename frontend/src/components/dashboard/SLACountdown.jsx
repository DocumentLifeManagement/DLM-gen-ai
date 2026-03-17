import React, { useState, useEffect } from "react";
import { Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

const SLA_HOURS = 48; // 48-hour SLA window
const SLA_MS = SLA_HOURS * 60 * 60 * 1000;

/**
 * SLACountdown
 *
 * Displays a real-time countdown timer showing how much time remains in the
 * document's 48-hour SLA window.
 *
 * @param {string|Date} createdAt  - ISO timestamp when the document entered its current stage
 * @param {string}      status     - current document status
 * @param {string}      [size]     - "sm" | "md" (default: "md")
 * @param {string}      [stageAt]  - ISO timestamp when the current stage started (optional fallback to createdAt)
 */
export default function SLACountdown({ createdAt, status, size = "md", stageAt }) {
  const TERMINAL_STATUSES = ["APPROVED", "REJECTED", "FAILED"];
  const isTerminal = TERMINAL_STATUSES.includes(status);

  // Use the most relevant timestamp
  const startTime = stageAt || createdAt;

  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(startTime));

  useEffect(() => {
    if (isTerminal) return;
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(startTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, isTerminal]);

  if (isTerminal) {
    return (
      <div className={`flex items-center gap-1.5 ${size === "sm" ? "text-[9px]" : "text-[10px]"} text-slate-500 font-mono`}>
        <CheckCircle2 size={size === "sm" ? 10 : 12} className="text-slate-600" />
        <span>Completed</span>
      </div>
    );
  }

  const { hours, minutes, seconds, totalMs, isBreached, isCritical } = timeLeft;

  if (isBreached) {
    return (
      <div className={`flex items-center gap-1.5 ${size === "sm" ? "text-[9px]" : "text-xs"} font-mono font-bold text-red-400 animate-pulse`}>
        <AlertTriangle size={size === "sm" ? 10 : 13} className="shrink-0" />
        <span>SLA BREACHED</span>
        <span className="text-red-600 font-normal">+{formatOverdue(Math.abs(totalMs))}</span>
      </div>
    );
  }

  const color = isCritical
    ? "text-orange-400"
    : hours < 24
    ? "text-yellow-400"
    : "text-emerald-400";

  const bgColor = isCritical
    ? "bg-orange-500/10 border-orange-500/20"
    : hours < 24
    ? "bg-yellow-500/10 border-yellow-500/20"
    : "bg-emerald-500/10 border-emerald-500/20";

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border ${bgColor} ${size === "sm" ? "text-[9px]" : "text-[10px]"} font-mono font-bold ${color}`}>
      <Clock size={size === "sm" ? 9 : 11} className={`shrink-0 ${isCritical ? "animate-pulse" : ""}`} />
      <span>
        {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
      {size !== "sm" && (
        <span className="opacity-50 font-normal">left</span>
      )}
    </div>
  );
}

function getTimeLeft(startTime) {
  const start = new Date(startTime);
  const deadline = new Date(start.getTime() + SLA_MS);
  const now = new Date();
  const diff = deadline - now;

  if (diff <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, totalMs: diff, isBreached: true, isCritical: false };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  const isCritical = diff < 4 * 60 * 60 * 1000; // < 4 hours = critical

  return { hours, minutes, seconds, totalMs: diff, isBreached: false, isCritical };
}

function formatOverdue(ms) {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/** Utility: check if a document's SLA is currently breached */
export function isSLABreached(createdAt, stageAt) {
  const start = new Date(stageAt || createdAt);
  return Date.now() - start.getTime() > SLA_MS;
}

/** Utility: get the SLA deadline Date */
export function getSLADeadline(createdAt, stageAt) {
  const start = new Date(stageAt || createdAt);
  return new Date(start.getTime() + SLA_MS);
}

export { SLA_HOURS, SLA_MS };

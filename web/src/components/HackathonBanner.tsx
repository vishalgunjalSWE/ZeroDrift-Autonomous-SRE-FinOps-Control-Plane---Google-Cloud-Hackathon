"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "zerodrift_hackathon_banner_dismissed_v2";
const DEMO_URL = "https://youtube.com/watch?v=placeholder";

export function HackathonBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) setVisible(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="w-full flex items-center justify-between px-4 py-2 bg-[#0B0D13] border-b border-white/[0.08] shrink-0 text-xs relative z-[60]"
      role="banner"
      aria-label="Google Cloud Hackathon Context"
    >
      {/* Left: Google Cloud & Project context */}
      <div className="flex items-center space-x-2.5 truncate">
        <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/25 text-[11px] font-mono font-semibold text-blue-400 shrink-0">
          Google Cloud Agentic Hackathon
        </span>
        <span className="text-slate-400 truncate hidden sm:inline">
          Autonomous analysis · human-approved remediation with deterministic SRE policy &amp; Terraform
        </span>
      </div>

      {/* Right: Simulation badge + Dismiss */}
      <div className="flex items-center space-x-3 shrink-0 ml-3">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider hidden md:inline">
          Evaluation Sandbox
        </span>
        <button
          onClick={dismiss}
          aria-label="Dismiss announcement banner"
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          title="Dismiss banner"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

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
      className="w-full flex items-center justify-between px-6 py-4 bg-[#0A0A0A] border-b border-white/[0.06] shrink-0 relative z-[60]"
      role="banner"
      aria-label="Google Cloud Hackathon Announcement"
    >
      {/* LEFT: Featured badge */}
      <div className="flex items-center space-x-2 shrink-0">
        <span className="text-azure text-sm">🚀</span>
        <span className="text-xs font-semibold uppercase tracking-widest text-muted">
          Featured Project
        </span>
      </div>

      {/* CENTER: Main copy */}
      <div className="flex items-center justify-center flex-1 space-x-4 min-w-0 px-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#1A2B4B]/80 border border-[#4285F4]/20 text-xs font-bold text-[#8AB4F8] tracking-wide shrink-0">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/5/51/Google_Cloud_logo.svg" 
            alt="Google Cloud Logo" 
            className="w-4 h-4 mr-1.5" 
          />
          Google Cloud
        </span>
        <p className="text-sm text-center leading-tight min-w-0">
          <span className="font-bold text-white">
            Rapid Agent Hackathon Submission
          </span>
          <span className="hidden md:inline text-white/30 mx-3">|</span>
          <span className="hidden md:inline text-muted font-normal">
            ZeroDrift — autonomous L2 SRE remediation using deterministic AI &amp; Terraform
          </span>
        </p>
      </div>

      {/* RIGHT: CTA + Dismiss */}
      <div className="flex items-center space-x-4 shrink-0">
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-white/5 border border-white/10 rounded-md">
          <span className="w-1.5 h-1.5 rounded-full bg-azure animate-pulse" />
          <span className="text-xs font-medium text-muted tracking-wide">Demo Available Soon</span>
        </div>

        <div className="hidden sm:block w-px h-5 bg-white/10" />

        {/* Dismiss — inline SVG X */}
        <button
          onClick={dismiss}
          aria-label="Dismiss announcement banner"
          className="p-1.5 rounded text-muted hover:text-white hover:bg-white/5 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

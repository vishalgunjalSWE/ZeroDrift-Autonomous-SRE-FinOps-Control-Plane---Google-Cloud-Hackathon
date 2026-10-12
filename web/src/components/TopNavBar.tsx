"use client";

import { useQuery } from "@tanstack/react-query";
import { Bell, Settings, Activity, Loader2, ShieldCheck, Box } from "lucide-react";
import Link from "next/link";

const BACKEND = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "");

export function TopNavBar() {
  const { data: health, isLoading, isError } = useQuery({
    queryKey: ["backend-health"],
    queryFn: () => fetch(`${BACKEND}/api/v1/health`).then((r) => r.json()),
    refetchInterval: 10_000,
    retry: 2,
  });

  const isOnline = !isError && !isLoading && health?.status === "healthy";
  const isSim = health?.simulation_mode ?? true;

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#0D1017] border-b border-white/[0.08] h-14 flex items-center justify-between px-6">
      {/* Left side: Simulation Mode & Queue State */}
      <div className="flex items-center space-x-3 shrink-0">
        <div className={`flex items-center space-x-2 px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-colors ${
          isSim ? "bg-amber-500/10 text-amber-400 border border-amber-500/25" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isSim ? "bg-amber-400" : "bg-emerald-400"}`} />
          <span>{isLoading ? "..." : isSim ? "Simulation Mode · Sandbox Isolated" : "Live Infrastructure Active"}</span>
        </div>

        {health && (
          <span className="text-slate-400 text-[11px] font-mono hidden md:inline-flex items-center space-x-2 border-l border-white/10 pl-3">
            <span>Locks: {health.active_locks ?? 0}</span>
            <span>·</span>
            <span>SSE Stream: Active</span>
          </span>
        )}
      </div>

      {/* Center: Command Palette Trigger */}
      <div className="flex-1 max-w-md mx-6">
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
          className="w-full flex items-center justify-between px-3.5 py-1.5 bg-[#121620] hover:bg-[#161B26] border border-white/[0.08] hover:border-white/[0.16] rounded-md transition-colors group text-left shadow-sm"
        >
          <div className="flex items-center space-x-2.5 text-slate-400 group-hover:text-slate-200 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <span className="text-xs">Search resources, simulate sweeps, inspect drift...</span>
          </div>
          <div className="flex items-center space-x-1">
            <kbd className="bg-white/[0.06] border border-white/10 text-slate-300 px-1.5 py-0.5 rounded text-[10px] font-mono shadow-sm">⌘K</kbd>
          </div>
        </button>
      </div>

      {/* Right side: Engine Status & Actions */}
      <div className="flex items-center space-x-5">
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border text-xs font-mono font-medium transition-colors ${
          isLoading
            ? "bg-white/5 border-white/10 text-slate-400"
            : isOnline
            ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
            : "bg-red-500/10 border-red-500/25 text-red-400"
        }`}>
          <div className="relative flex h-2 w-2">
            {isLoading ? (
              <Loader2 className="w-2 h-2 animate-spin text-slate-400" />
            ) : isOnline ? (
              <>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-400" />
            )}
          </div>
          <span className="uppercase tracking-wider text-[10px] font-bold">
            {isLoading ? "Connecting" : isOnline ? "Engine Online" : "Engine Offline"}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-slate-400">
          <Link href="/resource-inventory" className="hover:text-slate-100 transition-colors p-1" title="Resource Inventory">
            <Activity className="w-4 h-4" />
          </Link>
          <Link href="/integrations" className="hover:text-slate-100 transition-colors p-1 relative" title="Integrations">
            <Bell className="w-4 h-4" />
            {health && (health.queue_depth || 0) > 0 && (
              <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-blue-500 rounded-full" />
            )}
          </Link>
          <Link href="/settings" className="hover:text-slate-100 transition-colors p-1" title="Settings">
            <Settings className="w-4 h-4" />
          </Link>
          
          <Link href="/teams" className="w-7 h-7 rounded-md bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-mono font-bold ml-1 border border-blue-500/30 hover:border-blue-400 transition-colors" title="Operator Profile">
            SRE
          </Link>
        </div>
      </div>
    </nav>
  );
}

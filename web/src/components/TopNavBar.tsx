"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Bell, Settings, Activity, Loader2 } from "lucide-react";
import Link from "next/link";

const BACKEND = "http://localhost:8000";

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
    <nav className="sticky top-0 z-50 w-full glass border-b border-white/5 h-14 flex items-center justify-between px-6">
      {/* Left side: Simulation Pill */}
      <div className="flex items-center space-x-4 shrink-0">
        <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
          isSim ? "bg-azure/20 text-azure border border-azure/30" : "bg-emerald/10 text-emerald border border-emerald/20"
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${isSim ? "bg-azure" : "bg-emerald"} ${!isLoading && "animate-pulse"}`} />
          <span>{isLoading ? "..." : isSim ? "Simulation Mode" : "Live Mode"}</span>
        </div>

        {health && (
          <span className="text-muted text-[10px] hidden sm:inline-block">
            Q0 · Locks: {health.active_locks ?? 0} · SSE: {health.sse_clients ?? 0}
          </span>
        )}
      </div>



      {/* Center: Command Palette Trigger */}
      <div className="flex-1 max-w-md mx-6">
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
          className="w-full flex items-center justify-between px-3 py-1.5 bg-[#161616] hover:bg-[#1A1A1A] border border-[#222222] hover:border-[#333333] rounded-md transition-colors group text-left"
        >
          <div className="flex items-center space-x-2 text-muted group-hover:text-[#EDEDED] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <span className="text-xs">Search Infra, Run Sweep, View Drift...</span>
          </div>
          <div className="flex items-center space-x-1">
            <kbd className="bg-[#222222] border border-[#333333] text-muted px-1.5 py-0.5 rounded text-[10px] font-mono shadow-sm">⌘</kbd>
            <kbd className="bg-[#222222] border border-[#333333] text-muted px-1.5 py-0.5 rounded text-[10px] font-mono shadow-sm">K</kbd>
          </div>
        </button>
      </div>

      {/* Right side: Health Pulse & Actions */}
      <div className="flex items-center space-x-6">
        {/* Real-time backend health indicator */}
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border transition-colors ${
          isLoading
            ? "bg-white/5 border-white/10"
            : isOnline
            ? "bg-emerald/10 border-emerald/20"
            : "bg-infrared/10 border-infrared/20"
        }`}>
          <div className="relative flex h-2 w-2">
            {isLoading ? (
              <Loader2 className="w-2 h-2 animate-spin text-muted" />
            ) : isOnline ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald" />
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-infrared" />
            )}
          </div>
          <span className={`text-[11px] font-medium uppercase tracking-wider ${
            isLoading ? "text-muted" : isOnline ? "text-emerald" : "text-infrared"
          }`}>
            {isLoading ? "Connecting..." : isOnline ? "Engine Online" : "Engine Offline"}
          </span>
        </div>

        <div className="flex items-center space-x-4 text-muted">
          <Link href="/resource-inventory" className="hover:text-white transition-colors cursor-pointer">
            <Activity className="w-4 h-4" />
          </Link>
          <Link href="/integrations" className="hover:text-white transition-colors relative cursor-pointer">
            <Bell className="w-4 h-4" />
            {health && (health.queue_depth || 0) > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-azure rounded-full" />
            )}
          </Link>
          <Link href="/settings" className="hover:text-white transition-colors cursor-pointer">
            <Settings className="w-4 h-4" />
          </Link>
          
          <Link href="/teams" className="w-7 h-7 rounded-full bg-azure/20 text-azure flex items-center justify-center text-xs font-bold ml-2 overflow-hidden border border-white/10 cursor-pointer hover:border-azure transition-colors">
            <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=transparent" alt="Avatar" className="w-full h-full object-cover" />
          </Link>
        </div>
      </div>
    </nav>
  );
}

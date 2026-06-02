"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity, GitCommit, Search, PlusCircle, MinusCircle, Hash } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const BACKEND = "http://localhost:8000";

export default function InfrastructureDriftPage() {
  const { data: drift, isLoading } = useQuery<any>({
    queryKey: ["drift"],
    queryFn: () => fetch(`${BACKEND}/api/v1/drift`).then((r) => r.json()),
    refetchInterval: 10_000,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CLEAN": return "text-emerald bg-emerald/20 border-emerald/20";
      case "MINOR_DRIFT": return "text-azure bg-azure/20 border-azure/20";
      case "MODERATE_DRIFT": return "text-amber-500 bg-amber-500/20 border-amber-500/20";
      case "CRITICAL_DRIFT": return "text-infrared bg-infrared/20 border-infrared/20";
      default: return "text-muted bg-white/10 border-white/10";
    }
  };

  return (
    <main className="p-6 lg:p-10 max-w-[1800px] mx-auto w-full h-full flex flex-col space-y-8">
      <div className="border-b border-white/10 pb-6 shrink-0">
        <h1 className="text-2xl font-bold text-white flex items-center">
          <Activity className="w-6 h-6 mr-3 text-azure" />
          Infrastructure Drift
        </h1>
        <p className="text-muted text-[13px] mt-2">Real-time comparison of deployed cloud state versus Git baseline</p>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center text-muted">Scanning for drift...</div>
      ) : drift ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column: Summary */}
          <div className="lg:col-span-1 flex flex-col space-y-6">
            <div className="glass-card rounded-xl p-6 border border-white/5 text-center">
              <div className="relative inline-flex items-center justify-center w-32 h-32 mb-4">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" className="stroke-white/5" strokeWidth="3" />
                  <circle 
                    cx="18" cy="18" r="16" fill="none" 
                    className={drift.drift_index === 0 ? "stroke-emerald" : drift.drift_index < 10 ? "stroke-azure" : drift.drift_index < 25 ? "stroke-amber-500" : "stroke-infrared"}
                    strokeWidth="3" 
                    strokeDasharray={`${drift.drift_index} 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-light text-white">{drift.drift_index}%</span>
                  <span className="text-[10px] text-muted">DRIFT</span>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest inline-block border ${getStatusColor(drift.status)}`}>
                {drift.status.replace("_", " ")}
              </div>
            </div>

            <div className="glass-card rounded-xl p-5 border border-white/5">
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">Line Deltas</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-emerald">
                    <PlusCircle className="w-4 h-4 mr-2" /> <span className="text-sm">Added</span>
                  </div>
                  <span className="font-mono text-white">{drift.added_lines}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-infrared">
                    <MinusCircle className="w-4 h-4 mr-2" /> <span className="text-sm">Removed</span>
                  </div>
                  <span className="font-mono text-white">{drift.removed_lines}</span>
                </div>
                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center text-muted">
                    <Hash className="w-4 h-4 mr-2" /> <span className="text-sm">Total Lines</span>
                  </div>
                  <span className="font-mono text-white">{drift.total_lines}</span>
                </div>
              </div>
            </div>
            
            <div className="text-xs text-muted text-center flex flex-col items-center">
               <GitCommit className="w-4 h-4 mb-2 opacity-50" />
               Last Scan: {formatDistanceToNow(new Date(drift.timestamp), { addSuffix: true })}
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="lg:col-span-3 flex flex-col space-y-6">
            <div className="glass-card rounded-xl border border-white/5 overflow-hidden flex-1 flex flex-col">
              <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                <h3 className="font-semibold text-[#EDEDED] flex items-center">
                  <Search className="w-4 h-4 mr-2 text-muted" /> Impacted Resources
                </h3>
                <div className="flex items-center space-x-2 text-xs font-mono text-muted">
                  <span className="text-infrared bg-infrared/10 px-2 py-0.5 rounded border border-infrared/20">{drift.current}</span>
                  <span>vs</span>
                  <span className="text-azure bg-azure/10 px-2 py-0.5 rounded border border-azure/20">{drift.baseline}</span>
                </div>
              </div>
              <div className="p-6 flex-1 bg-[#0A0A0B]">
                {drift.drifted_resources && drift.drifted_resources.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {drift.drifted_resources.map((res: string, i: number) => (
                      <div key={i} className="p-4 rounded border border-white/10 bg-white/[0.02] flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
                        <span className="font-mono text-sm text-[#EDEDED]">{res}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-muted">
                    <Activity className="w-12 h-12 mb-4 opacity-20" />
                    <p>No drifted resources detected.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-red-400">Failed to load drift data.</div>
      )}
    </main>
  );
}
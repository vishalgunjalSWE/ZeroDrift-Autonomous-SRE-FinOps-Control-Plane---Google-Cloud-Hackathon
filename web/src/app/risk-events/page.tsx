"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ShieldAlert, AlertTriangle, Zap, ServerCrash } from "lucide-react";

const BACKEND = "http://localhost:8000";

export default function RiskEventsPage() {
  const [isSimulating, setIsSimulating] = useState(false);

  const { data: runs = [], isLoading, refetch } = useQuery<any[]>({
    queryKey: ["runs"],
    queryFn: () => fetch(`${BACKEND}/api/runs`).then((r) => r.json()),
    refetchInterval: 15_000,
  });

  const highRiskEvents = runs.filter((r) => r.risk_level === "HIGH" || r.risk_level === "CRITICAL" || r.risk_score >= 8);

  const triggerChaos = async () => {
    setIsSimulating(true);
    try {
      await fetch(`${BACKEND}/api/simulate-incident`, { method: "POST" });
      setTimeout(refetch, 1000);
    } catch (e) {
      console.error(e);
    }
    setTimeout(() => setIsSimulating(false), 2000);
  };

  return (
    <main className="p-6 lg:p-10 max-w-[1800px] mx-auto w-full h-full flex flex-col space-y-8">
      <div className="flex justify-between items-end border-b border-white/10 pb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center">
            <ShieldAlert className="w-6 h-6 mr-3 text-infrared" />
            Risk & Events
          </h1>
          <p className="text-muted text-[13px] mt-2">Track high-risk infrastructure anomalies and chaos engineering events</p>
        </div>
        <button 
          onClick={triggerChaos}
          disabled={isSimulating}
          className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 transition-all ${
            isSimulating ? "bg-white/10 text-muted cursor-not-allowed" : "bg-infrared/20 text-infrared border border-infrared/30 hover:bg-infrared/30"
          }`}
        >
          <ServerCrash className="w-4 h-4" />
          <span>{isSimulating ? "Injecting Fault..." : "Simulate Black Friday Spike"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 flex flex-col space-y-6">
          <div className="glass-card rounded-xl p-6 border border-white/5">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-infrared/20 flex items-center justify-center text-infrared">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-3xl font-light text-white">{highRiskEvents.length}</div>
                <div className="text-xs text-muted font-semibold uppercase tracking-wider">Critical Events</div>
              </div>
            </div>
            <p className="text-xs text-muted mt-4">Total number of events historically flagged with a Risk Score of 8 or higher.</p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="glass-card rounded-xl border border-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5 bg-white/[0.02]">
              <h3 className="font-semibold text-[#EDEDED] flex items-center">
                <Zap className="w-4 h-4 mr-2 text-amber-500" /> Event Timeline
              </h3>
            </div>
            <div className="divide-y divide-white/5">
              {isLoading && <div className="p-8 text-center text-muted">Loading events...</div>}
              {!isLoading && highRiskEvents.length === 0 && (
                <div className="p-8 text-center text-muted">No high-risk events detected. System is stable.</div>
              )}
              {highRiskEvents.map((event) => (
                <div key={event.run_id} className="p-6 hover:bg-white/[0.01] transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <span className="font-mono text-azure font-medium">{event.run_id}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-infrared/20 text-infrared border border-infrared/20">
                          RISK SCORE: {event.risk_score}/10
                        </span>
                        <span className="text-xs text-muted">{formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}</span>
                      </div>
                      <div className="text-sm text-[#EDEDED] font-medium">
                        Optimization: <span className="text-infrared line-through">{event.old_instance}</span> &rarr; <span className="text-emerald">{event.new_instance}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs font-bold px-2 py-1 rounded uppercase ${
                        event.status === "REQUIRES_APPROVAL" ? "bg-amber-500/20 text-amber-500" :
                        event.status === "AUTO_ROLLED_BACK" ? "bg-violet/20 text-violet" :
                        "bg-white/10 text-muted"
                      }`}>
                        {event.status.replace("_", " ")}
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0A0A0B] rounded-lg p-4 border border-white/5 space-y-3">
                    <div>
                      <div className="text-[10px] text-muted font-bold uppercase tracking-wider mb-1">Blast Radius Assessment</div>
                      <div className="text-xs text-[#EDEDED]">{event.blast_radius || "Unknown impact. Principal review required."}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted font-bold uppercase tracking-wider mb-1">AI Reasoning Trace</div>
                      <div className="text-xs text-[#E2C4FF] font-mono leading-relaxed bg-violet/5 p-2 rounded">
                        {event.reasoning_trace || "No reasoning trace available."}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
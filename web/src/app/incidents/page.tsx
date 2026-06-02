"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ServerCrash, FileText, ChevronDown, ChevronUp, Loader2, AlertTriangle, ShieldAlert } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const BACKEND = "http://localhost:8000";

export default function IncidentsPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: runs = [], isLoading } = useQuery<any[]>({
    queryKey: ["runs"],
    queryFn: () => fetch(`${BACKEND}/api/runs`).then((r) => r.json()),
    refetchInterval: 15_000,
  });

  const { data: runDetails, isLoading: isLoadingDetails } = useQuery<any>({
    queryKey: ["run-details", expandedId],
    queryFn: () => fetch(`${BACKEND}/api/run-details/${expandedId}`).then((r) => r.json()),
    enabled: !!expandedId,
  });

  // Filter for incidents (failed, rolled back, or high risk that needed approval)
  const incidents = runs.filter(
    (r) => r.status === "FAILED" || r.status === "AUTO_ROLLED_BACK" || r.risk_score >= 8
  );

  return (
    <main className="p-6 lg:p-10 max-w-[1800px] mx-auto w-full h-full flex flex-col space-y-8">
      <div className="border-b border-white/10 pb-6 shrink-0">
        <h1 className="text-2xl font-bold text-white flex items-center">
          <ServerCrash className="w-6 h-6 mr-3 text-infrared" />
          Incidents & Post-Mortems
        </h1>
        <p className="text-muted text-[13px] mt-2">Historical log of high-severity anomalies, rollbacks, and AI-generated RCA reports.</p>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center text-muted">Loading incidents...</div>
      ) : incidents.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-muted h-[400px]">
          <ShieldAlert className="w-16 h-16 mb-6 opacity-20" />
          <p className="text-lg">No incidents recorded.</p>
          <p className="text-sm">The infrastructure is operating within safe bounds.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {incidents.map((incident) => {
            const isExpanded = expandedId === incident.run_id;

            return (
              <div key={incident.run_id} className="glass-card rounded-xl border border-white/5 overflow-hidden transition-all duration-300">
                <div 
                  className={`p-6 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] ${isExpanded ? "bg-white/[0.02] border-b border-white/5" : ""}`}
                  onClick={() => setExpandedId(isExpanded ? null : incident.run_id)}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      incident.status === "AUTO_ROLLED_BACK" ? "bg-violet/20 text-violet" : "bg-infrared/20 text-infrared"
                    }`}>
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <span className="font-mono text-azure font-medium">{incident.run_id}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          incident.status === "AUTO_ROLLED_BACK" ? "bg-violet/20 text-violet border border-violet/30" : "bg-infrared/20 text-infrared border border-infrared/30"
                        }`}>
                          {incident.status.replace("_", " ")}
                        </span>
                      </div>
                      <div className="text-sm text-muted">
                        Impacted: <span className="font-mono text-[#EDEDED]">{incident.old_instance}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6 text-muted text-sm">
                    <span>{formatDistanceToNow(new Date(incident.timestamp), { addSuffix: true })}</span>
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-6 bg-[#0A0A0B]">
                    {isLoadingDetails ? (
                      <div className="flex items-center text-muted text-sm py-8 justify-center">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" /> Fetching AI Post-Mortem...
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                           <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4">
                             <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 flex items-center"><AlertTriangle className="w-4 h-4 mr-2" /> Root Cause Trigger</div>
                             <div className="text-sm text-[#EDEDED] font-mono">{runDetails?.reasoning_trace || incident.reasoning_trace || "Anomaly detected leading to capacity exhaustion or budget violation."}</div>
                           </div>
                           <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4">
                             <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 flex items-center"><ServerCrash className="w-4 h-4 mr-2" /> Action Taken</div>
                             <div className="text-sm text-[#EDEDED] font-mono">{runDetails?.rollback_plan || "Automated self-healing triggered. Reverted to stable Git baseline."}</div>
                           </div>
                        </div>

                        {runDetails?.post_mortem ? (
                          <div className="mt-6 border-t border-white/5 pt-6">
                             <h3 className="text-sm font-semibold text-white mb-4 flex items-center">
                               <FileText className="w-4 h-4 mr-2 text-violet" />
                               Blameless AI Post-Mortem
                             </h3>
                             <div className="bg-violet/[0.02] border border-violet/10 rounded-lg p-6">
                               <pre className="text-sm text-[#E2C4FF] font-mono whitespace-pre-wrap leading-relaxed">
                                 {runDetails.post_mortem}
                               </pre>
                             </div>
                          </div>
                        ) : (
                          <div className="mt-6 border-t border-white/5 pt-6 text-center text-muted text-sm">
                            No full post-mortem document generated for this event.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
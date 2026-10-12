"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Shield, Sliders, Zap, Loader2, Wifi, WifiOff, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { usePendingApprovals, useRejectMR } from "@/hooks/useApi";
import { PreFlightDrawer } from "./PreFlightDrawer";

const BACKEND = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "");

export function GuardrailsSidebar() {
  const queryClient = useQueryClient();

  // Fetch real state from backend on mount
  const { data: backendState, isLoading } = useQuery({
    queryKey: ["backend-state"],
    queryFn: () => fetch(`${BACKEND}/api/state`).then((r) => r.json()),
    staleTime: 30_000,
  });

  const [simMode, setSimMode] = useState<boolean | null>(null);
  const [downsizeEC2, setDownsizeEC2] = useState<boolean | null>(null);
  const [upgradeEBS, setUpgradeEBS] = useState<boolean | null>(null);
  const [downsizeGCP, setDownsizeGCP] = useState<boolean | null>(null);
  const [liveDrift, setLiveDrift] = useState<boolean | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [selectedRunForPreFlight, setSelectedRunForPreFlight] = useState<any | null>(null);

  const { data: pendingData, isLoading: isLoadingPending } = usePendingApprovals();
  const pendingRuns = pendingData?.pending || [];
  
  const rejectMutation = useRejectMR();

  // Sync local state from backend once loaded
  useEffect(() => {
    if (!backendState) return;
    setSimMode(backendState.simulation_mode ?? true);
    const ap = backendState.active_policies || {};
    setDownsizeEC2(ap.downsize_ec2 ?? true);
    setUpgradeEBS(ap.upgrade_ebs ?? true);
    setDownsizeGCP(ap.downsize_gcp ?? true);
    setLiveDrift(ap.live_drift_verification ?? true);
  }, [backendState]);

  const postState = async (overrides?: Partial<{
    simMode: boolean; downsizeEC2: boolean; upgradeEBS: boolean; downsizeGCP: boolean; liveDrift: boolean;
  }>) => {
    setSyncing(true);
    const payload = {
      simulation_mode: overrides?.simMode ?? simMode ?? true,
      active_policies: {
        downsize_ec2: overrides?.downsizeEC2 ?? downsizeEC2 ?? true,
        downsize_gcp: overrides?.downsizeGCP ?? downsizeGCP ?? true,
        upgrade_ebs: overrides?.upgradeEBS ?? upgradeEBS ?? true,
        live_drift_verification: overrides?.liveDrift ?? liveDrift ?? true,
        enforce_tags: false,
        ec2_target_size: "t3.medium",
        gcp_target_type: "e2-medium",
        ebs_target_type: "gp3",
        aggressiveness: "Moderate",
      },
    };
    try {
      await fetch(`${BACKEND}/api/state`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      // Invalidate all caches so metrics summary, topology etc. reflect new state
      queryClient.invalidateQueries({ queryKey: ["backend-state"] });
      queryClient.invalidateQueries({ queryKey: ["metrics-summary"] });
    } catch (e) {
      console.error("State sync failed:", e);
    } finally {
      setSyncing(false);
    }
  };

  const Toggle = ({
    label, checked, onChange,
  }: { label: string; checked: boolean | null; onChange: (v: boolean) => void }) => {
    const isOn = checked ?? false;
    return (
      <div className="flex items-center justify-between py-2 border-b border-white/5">
        <span className="text-sm font-medium">{label}</span>
        {checked === null ? (
          <div className="w-10 h-5 rounded-full bg-white/10 animate-pulse" />
        ) : (
          <button
            onClick={() => onChange(!isOn)}
            className={`w-10 h-5 rounded-full relative transition-colors duration-200 ${isOn ? "bg-azure" : "bg-white/10"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${isOn ? "translate-x-5" : ""}`} />
          </button>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="glass-card rounded-xl border border-white/5 p-6 flex flex-col items-center justify-center space-y-3 h-full">
        <Loader2 className="w-5 h-5 animate-spin text-azure" />
        <p className="text-xs text-muted">Syncing guardrails from backend...</p>
      </div>
    );
  }

  return (
    <div className="zd-card border border-white/[0.08] p-5 flex flex-col space-y-5 h-full overflow-y-auto bg-[#11151E]">
      <div>
        <div className="flex items-center space-x-2 mb-1">
          <Shield className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-semibold tracking-wider uppercase text-slate-200">
            Mission Control &amp; Policies
          </h3>
        </div>
        <p className="text-xs text-blue-400 font-mono font-medium">
          Autonomous analysis · human-approved remediation
        </p>
        <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
          Policies generate recommendations. Human approval is required before any simulated patch.
        </p>
      </div>

      {/* Group 1: Environment & Integrations */}
      <div className="space-y-1">
        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2 flex justify-between">
          <span>Environment &amp; Boundary</span>
          <span className="text-emerald-400 font-bold">Isolated</span>
        </div>
        <Toggle
          label="Simulation Mode (Sandbox)"
          checked={simMode}
          onChange={(v) => { setSimMode(v); postState({ simMode: v }); }}
        />
        {/* Strictly truthful GitLab integration state */}
        <div className="flex items-center justify-between py-2 border-b border-white/[0.05]">
          <div className="space-y-0.5">
            <span className="text-xs font-medium text-slate-400">Live Drift Sync (GitLab)</span>
            <div className="text-[10px] text-slate-500 font-mono">Unavailable in local simulation · Credentials required</div>
          </div>
          <span className="zd-badge-neutral text-[10px]">
            Disabled
          </span>
        </div>
      </div>

      {/* Group 2: Proposal Policies */}
      <div className="space-y-1">
        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2">
          Proposal Generation Policies
        </div>
        <Toggle
          label="Generate proposal: Downsize EC2"
          checked={downsizeEC2}
          onChange={(v) => { setDownsizeEC2(v); postState({ downsizeEC2: v }); }}
        />
        <Toggle
          label="Generate proposal: Upgrade EBS to gp3"
          checked={upgradeEBS}
          onChange={(v) => { setUpgradeEBS(v); postState({ upgradeEBS: v }); }}
        />
        <Toggle
          label="Generate proposal: Downsize GCP Compute"
          checked={downsizeGCP}
          onChange={(v) => { setDownsizeGCP(v); postState({ downsizeGCP: v }); }}
        />
      </div>

      {/* Group 3: HITL Gatekeeper Queue */}
      <div className="pt-3 border-t border-white/[0.08] space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-[11px] text-slate-300 font-mono uppercase tracking-wider font-semibold">
            HITL Approval Queue
          </div>
          {pendingRuns.length > 0 ? (
            <span className="zd-badge-amber">
              {pendingRuns.length} Pending
            </span>
          ) : (
            <span className="zd-badge-neutral text-[10px]">
              0 Pending
            </span>
          )}
        </div>
        
        {isLoadingPending ? (
          <div className="text-xs text-slate-400 flex items-center font-mono py-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin mr-2 text-amber-400" />
            <span>Checking queue status...</span>
          </div>
        ) : pendingRuns.length === 0 ? (
          <div className="text-xs text-slate-400 bg-[#0E121A] p-3 rounded-lg border border-white/[0.06] text-center font-mono">
            Queue clear. 0 proposals awaiting review.
          </div>
        ) : (
          pendingRuns.map((run: any) => (
            <div key={run.run_id} className="bg-[#141924] border border-amber-500/25 rounded-lg p-3 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-400" />
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-xs font-semibold text-slate-100 font-mono truncate max-w-[170px]">
                    {run.old_instance?.split(" ")[0] || "Compute Rightsizing"}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                    Risk Score: {run.risk_score || 2}/10 · Sandbox
                  </div>
                </div>
                {run.savings && (
                  <div className="text-xs font-bold font-mono text-emerald-400">
                    +${Math.abs(Number(run.savings)).toFixed(2)}/mo
                  </div>
                )}
              </div>
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={() => setSelectedRunForPreFlight(run)}
                  className="zd-btn-primary flex-1 py-1.5 text-[11px] flex items-center justify-center"
                >
                  <CheckCircle className="w-3 h-3 mr-1" /> Review Proposal
                </button>
                <button
                  onClick={() => rejectMutation.mutate(run.run_id)}
                  disabled={rejectMutation.isPending}
                  className="zd-btn-danger flex-1 py-1.5 text-[11px] flex items-center justify-center disabled:opacity-50"
                >
                  {rejectMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <><XCircle className="w-3 h-3 mr-1" /> Reject</>}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1.5 font-mono text-amber-400">
          <Zap className="w-3 h-3" />
          <span className="text-[11px]">Sandbox Isolated</span>
        </div>
        <div className="flex items-center space-x-1 text-slate-400 font-mono text-[10px]">
          {syncing ? (
            <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
          ) : (
            <Wifi className="w-3 h-3 text-emerald-400" />
          )}
          <span>{syncing ? "Updating" : "Rollback Ready"}</span>
        </div>
      </div>

      <PreFlightDrawer
        isOpen={!!selectedRunForPreFlight}
        run={selectedRunForPreFlight}
        details={selectedRunForPreFlight}
        onClose={() => setSelectedRunForPreFlight(null)}
        onConfirm={() => {
          setSelectedRunForPreFlight(null);
        }}
      />
    </div>
  );
}

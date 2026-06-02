"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Shield, Sliders, Zap, Loader2, Wifi, WifiOff, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { usePendingApprovals, useRejectMR } from "@/hooks/useApi";
import { PreFlightDrawer } from "./PreFlightDrawer";

const BACKEND = "http://localhost:8000";

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
    <div className="glass-card rounded-xl border border-white/5 p-6 flex flex-col space-y-6 h-full overflow-y-auto">
      <div>
        <h3 className="text-sm font-semibold tracking-wide flex items-center mb-1 text-white">
          <Shield className="w-4 h-4 mr-2 text-azure" />
          Mission Control
        </h3>
        <p className="text-xs text-muted font-mono tracking-tight">Autonomous orchestration active.</p>
      </div>

      <div className="space-y-1">
        <div className="text-[11px] text-muted uppercase font-semibold tracking-wider mb-2 flex justify-between">
          <span>Global Override</span>
          <span className="text-emerald">Safe</span>
        </div>
        <Toggle
          label="Simulation Mode (Local)"
          checked={simMode}
          onChange={(v) => { setSimMode(v); postState({ simMode: v }); }}
        />
        <Toggle
          label="Live Drift Sync (GitLab)"
          checked={liveDrift}
          onChange={(v) => { setLiveDrift(v); postState({ liveDrift: v }); }}
        />
      </div>

      <div className="space-y-1">
        <div className="text-[11px] text-muted uppercase font-semibold tracking-wider mb-2">Active Policies</div>
        <Toggle
          label="Auto-Downsize EC2"
          checked={downsizeEC2}
          onChange={(v) => { setDownsizeEC2(v); postState({ downsizeEC2: v }); }}
        />
        <Toggle
          label="Auto-Upgrade EBS to gp3"
          checked={upgradeEBS}
          onChange={(v) => { setUpgradeEBS(v); postState({ upgradeEBS: v }); }}
        />
        <Toggle
          label="Auto-Downsize GCP Engine"
          checked={downsizeGCP}
          onChange={(v) => { setDownsizeGCP(v); postState({ downsizeGCP: v }); }}
        />
      </div>

      <div className="pt-4 border-t border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-[11px] text-amber uppercase font-semibold tracking-wider">HITL Approval Queue</div>
          {pendingRuns.length > 0 && (
            <span className="bg-amber/10 text-amber text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-[0_0_8px_rgba(245,158,11,0.15)] border border-amber/30">
              {pendingRuns.length} Pending
            </span>
          )}
        </div>
        
        {isLoadingPending ? (
          <div className="text-xs text-muted flex items-center"><Loader2 className="w-3 h-3 animate-spin mr-2" /> Loading...</div>
        ) : pendingRuns.length === 0 ? (
          <div className="text-xs text-muted bg-white/[0.02] p-3 rounded-lg border border-white/5 text-center">
            No pending approvals.
          </div>
        ) : (
          pendingRuns.map((run: any) => (
            <div key={run.run_id} className="bg-amber/[0.03] border border-amber/20 rounded-lg p-3 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber/50" />
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-xs font-semibold text-[#EDEDED] font-mono">{run.old_instance?.split(" ")[0] || "Infrastructure"}</div>
                  <div className="text-[11px] text-muted mt-0.5">Blast Radius: Low · Risk: {run.risk_score || 5}/10</div>
                </div>
                {run.savings && (
                  <div className="text-xs font-semibold text-emerald">${Math.abs(run.savings).toFixed(0)}/mo</div>
                )}
              </div>
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={() => setSelectedRunForPreFlight(run)}
                  className="flex-1 bg-amber/10 hover:bg-amber/20 text-amber text-[10px] font-bold py-1.5 rounded transition-colors flex items-center justify-center"
                >
                  <CheckCircle className="w-3 h-3 mr-1" /> Pre-Flight
                </button>
                <button
                  onClick={() => rejectMutation.mutate(run.run_id)}
                  disabled={rejectMutation.isPending}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-muted text-[10px] font-bold py-1.5 rounded transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  {rejectMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <><XCircle className="w-3 h-3 mr-1" /> Reject</>}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className={`pt-4 border-t border-white/5 flex items-center justify-between text-xs`}>
        <div className={`flex items-center space-x-2 font-mono ${simMode ? "text-amber" : "text-emerald"}`}>
          <Zap className="w-3 h-3" />
          <span>{simMode ? "Simulation Mode" : "Live Mode"}</span>
        </div>
        <div className="flex items-center space-x-1 text-muted font-mono text-[10px]">
          {syncing ? (
            <Loader2 className="w-3 h-3 animate-spin text-azure" />
          ) : (
            <Wifi className="w-3 h-3 text-emerald" />
          )}
          <span>{syncing ? "Syncing" : "Rollback Ready"}</span>
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

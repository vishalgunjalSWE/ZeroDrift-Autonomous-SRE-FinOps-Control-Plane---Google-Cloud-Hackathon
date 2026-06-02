"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Shield, Zap, Server, HardDrive, Tags, Loader2, Save } from "lucide-react";

const BACKEND = "http://localhost:8000";

export default function PolicyGuardrailsPage() {
  const queryClient = useQueryClient();

  const { data: backendState, isLoading } = useQuery({
    queryKey: ["backend-state"],
    queryFn: () => fetch(`${BACKEND}/api/state`).then((r) => r.json()),
  });

  const [policies, setPolicies] = useState({
    simulation_mode: true,
    downsize_ec2: true,
    upgrade_ebs: true,
    downsize_gcp: true,
    live_drift_verification: true,
    enforce_tags: false,
    ec2_target_size: "t3.medium",
    gcp_target_type: "e2-medium",
    ebs_target_type: "gp3",
    aggressiveness: "Moderate"
  });
  
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (backendState) {
      setPolicies({
        simulation_mode: backendState.simulation_mode ?? true,
        downsize_ec2: backendState.active_policies?.downsize_ec2 ?? true,
        upgrade_ebs: backendState.active_policies?.upgrade_ebs ?? true,
        downsize_gcp: backendState.active_policies?.downsize_gcp ?? true,
        live_drift_verification: backendState.active_policies?.live_drift_verification ?? true,
        enforce_tags: backendState.active_policies?.enforce_tags ?? false,
        ec2_target_size: backendState.active_policies?.ec2_target_size ?? "t3.medium",
        gcp_target_type: backendState.active_policies?.gcp_target_type ?? "e2-medium",
        ebs_target_type: backendState.active_policies?.ebs_target_type ?? "gp3",
        aggressiveness: backendState.active_policies?.aggressiveness ?? "Moderate"
      });
    }
  }, [backendState]);

  const handleSave = async () => {
    setIsSaving(true);
    const payload = {
      simulation_mode: policies.simulation_mode,
      active_policies: {
        downsize_ec2: policies.downsize_ec2,
        downsize_gcp: policies.downsize_gcp,
        upgrade_ebs: policies.upgrade_ebs,
        live_drift_verification: policies.live_drift_verification,
        enforce_tags: policies.enforce_tags,
        ec2_target_size: policies.ec2_target_size,
        gcp_target_type: policies.gcp_target_type,
        ebs_target_type: policies.ebs_target_type,
        aggressiveness: policies.aggressiveness,
      },
    };
    try {
      await fetch(`${BACKEND}/api/state`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      queryClient.invalidateQueries({ queryKey: ["backend-state"] });
    } catch (e) {
      console.error(e);
    }
    setTimeout(() => setIsSaving(false), 500);
  };

  const Toggle = ({ label, description, checked, onChange }: any) => (
    <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-lg hover:bg-white/[0.04] transition-colors">
      <div>
        <div className="text-sm font-semibold text-white">{label}</div>
        <div className="text-xs text-muted mt-1">{description}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`w-12 h-6 rounded-full relative transition-colors duration-200 shrink-0 ${checked ? "bg-azure" : "bg-white/10"}`}
      >
        <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${checked ? "translate-x-6" : ""}`} />
      </button>
    </div>
  );

  return (
    <main className="p-6 lg:p-10 max-w-[1800px] mx-auto w-full h-full flex flex-col space-y-8">
      <div className="flex justify-between items-end border-b border-white/10 pb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center">
            <Shield className="w-6 h-6 mr-3 text-emerald" />
            Policy Guardrails
          </h1>
          <p className="text-muted text-[13px] mt-2">Configure SRE rules and boundary conditions for the AI orchestration engine.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving || isLoading}
          className="px-6 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 bg-azure hover:bg-azure/80 text-white transition-all shadow-[0_0_15px_rgba(0,112,243,0.3)] disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{isSaving ? "Saving..." : "Save Policies"}</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center text-muted">Loading active policies...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Global Settings */}
          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted flex items-center">
              <Zap className="w-4 h-4 mr-2" /> Global Operating Mode
            </h2>
            <div className="glass-card rounded-xl p-2 space-y-2 border border-white/5">
              <Toggle 
                label="Simulation Mode" 
                description="Run in dry-run mode. Changes are logged but not merged to Git."
                checked={policies.simulation_mode}
                onChange={(v: boolean) => setPolicies({ ...policies, simulation_mode: v })}
              />
              <Toggle 
                label="Live Drift Verification" 
                description="Continuously poll Git and Cloud state to verify infrastructure drift."
                checked={policies.live_drift_verification}
                onChange={(v: boolean) => setPolicies({ ...policies, live_drift_verification: v })}
              />
            </div>
          </section>

          {/* Cloud Optimization Rules */}
          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted flex items-center">
              <Server className="w-4 h-4 mr-2" /> Active Remediation Policies
            </h2>
            <div className="glass-card rounded-xl p-2 space-y-2 border border-white/5">
              <Toggle 
                label="Auto-Downsize AWS EC2" 
                description="Identify and automatically downsize idle or over-provisioned EC2 instances."
                checked={policies.downsize_ec2}
                onChange={(v: boolean) => setPolicies({ ...policies, downsize_ec2: v })}
              />
              <Toggle 
                label="Auto-Downsize GCP Compute" 
                description="Apply right-sizing heuristics to Google Cloud Engine workloads."
                checked={policies.downsize_gcp}
                onChange={(v: boolean) => setPolicies({ ...policies, downsize_gcp: v })}
              />
              <Toggle 
                label="Auto-Upgrade AWS EBS" 
                description="Convert legacy gp2 volumes to gp3 for lower cost and higher throughput."
                checked={policies.upgrade_ebs}
                onChange={(v: boolean) => setPolicies({ ...policies, upgrade_ebs: v })}
              />
            </div>
          </section>

          {/* Parameter Tuning */}
          <section className="space-y-4 lg:col-span-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted flex items-center">
              <HardDrive className="w-4 h-4 mr-2" /> Target Parameters
            </h2>
            <div className="glass-card rounded-xl p-6 border border-white/5 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">EC2 Target Size</label>
                <input 
                  type="text" 
                  value={policies.ec2_target_size}
                  onChange={(e) => setPolicies({ ...policies, ec2_target_size: e.target.value })}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-azure transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">GCP Target Type</label>
                <input 
                  type="text" 
                  value={policies.gcp_target_type}
                  onChange={(e) => setPolicies({ ...policies, gcp_target_type: e.target.value })}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-azure transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">EBS Target Type</label>
                <input 
                  type="text" 
                  value={policies.ebs_target_type}
                  onChange={(e) => setPolicies({ ...policies, ebs_target_type: e.target.value })}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-azure transition-colors"
                />
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
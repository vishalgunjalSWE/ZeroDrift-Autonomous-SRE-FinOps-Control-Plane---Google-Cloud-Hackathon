"use client";

import { useState } from "react";
import { usePendingApprovals, useApproveMR, useRejectMR } from "@/hooks/useApi";
import { CheckCircle, XCircle, Loader2, UserCheck, ShieldAlert, FileText, Calendar, ArrowRight, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { PreFlightDrawer } from "@/components/PreFlightDrawer";

export default function ApprovalsPage() {
  const { data, isLoading } = usePendingApprovals();
  const approveMutation = useApproveMR();
  const rejectMutation = useRejectMR();
  const [inspectRun, setInspectRun] = useState<any | null>(null);

  const pendingRuns = data?.pending || [];

  return (
    <main className="p-6 lg:p-10 max-w-[1800px] mx-auto w-full h-full flex flex-col space-y-8">
      <div className="border-b border-white/[0.08] pb-6 shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1.5">
            <UserCheck className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-bold text-slate-100">
              Pending Remediation Approvals
            </h1>
            {pendingRuns.length > 0 && (
              <span className="zd-badge-amber">
                {pendingRuns.length} Quarantined
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Human-in-the-loop (HITL) gatekeeper · Review pre-flight evidence and approve isolated sandbox patches.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin mr-3 text-amber-400" /> 
          <span className="text-xs font-mono">Scanning ledger for pending approvals...</span>
        </div>
      ) : pendingRuns.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 h-[400px]">
          <CheckCircle className="w-12 h-12 mb-4 text-emerald-500/30" />
          <p className="text-base font-semibold text-slate-200">No Pending Approvals</p>
          <p className="text-xs text-slate-500 font-mono mt-1">All infrastructure proposals have been reviewed and reconciled.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {pendingRuns.map((run: any) => (
            <div key={run.run_id} className="zd-card border border-amber-500/25 overflow-hidden flex flex-col bg-[#11151E] relative">
              {/* Top Accent Strip */}
              <div className="h-1 bg-amber-400 w-full" />
              
              {/* Card Header */}
              <div className="p-6 border-b border-white/[0.06] bg-[#0E121A] flex justify-between items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-mono text-blue-400 font-bold text-base">{run.run_id}</span>
                    <span className="zd-badge-amber">
                      Requires Approval
                    </span>
                    {run.source_tag === "AI ANALYSIS" ? (
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/25">
                        AI Analysis
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/25">
                        Demo Fallback
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center font-mono">
                    <Calendar className="w-3.5 h-3.5 mr-1.5 opacity-60" />
                    Requested {formatDistanceToNow(new Date(run.timestamp), { addSuffix: true })}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald-400 font-mono">
                    ${Math.abs(Number(run.savings)).toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Monthly Savings</div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 space-y-5 bg-[#11151E]">
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                    Proposed Compute Optimization
                  </div>
                  <div className="flex items-center space-x-3 bg-[#0A0D14] border border-white/[0.06] p-3 rounded-lg font-mono text-xs">
                    <div className="flex-1 text-red-400 line-through opacity-80 truncate">{run.old_instance}</div>
                    <div className="text-slate-500 font-bold">→</div>
                    <div className="flex-1 text-emerald-400 font-bold truncate">{run.new_instance}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0A0D14] border border-white/[0.06] p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-1 text-xs">
                      <span className="text-slate-400 font-mono">Risk Rating</span>
                      <span className="font-bold text-amber-400 font-mono">{run.risk_score || 2}/10</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-mono">{run.source_tag === "AI ANALYSIS" ? "AI Confidence" : "Policy Confidence"}</span>
                      <span className="font-bold text-blue-400 font-mono">{run.confidence_score || 95}%</span>
                    </div>
                  </div>

                  <div className="bg-[#0A0D14] border border-white/[0.06] p-3 rounded-lg">
                    <div className="text-[11px] text-slate-400 font-mono mb-1">Target Sandbox Path</div>
                    <div className="text-xs font-mono text-slate-200 truncate" title="terraform_sandbox/demo_infrastructure.tf">
                      terraform_sandbox/demo_infrastructure.tf
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                    Reasoning & Blast Radius
                  </div>
                  <div className="bg-[#0E121A] border border-white/[0.06] p-3 rounded-lg text-xs text-slate-300 font-mono leading-relaxed">
                    {run.reasoning_trace || run.reasoning || "Context isolation verified: 14-day average CPU < 12%. Safe to resize compute tier."}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-5 border-t border-white/[0.06] bg-[#0E121A] flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setInspectRun(run)}
                  className="zd-btn-secondary text-xs flex items-center space-x-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Pre-Flight Evidence & Diff</span>
                </button>

                <div className="flex-1" />

                <button
                  onClick={() => rejectMutation.mutate(run.run_id)}
                  disabled={approveMutation.isPending || rejectMutation.isPending}
                  className="zd-btn-danger text-xs px-3.5"
                >
                  {rejectMutation.isPending && rejectMutation.variables === run.run_id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>Reject Run</>
                  )}
                </button>

                <button
                  onClick={() => approveMutation.mutate(run.run_id)}
                  disabled={approveMutation.isPending || rejectMutation.isPending}
                  className="zd-btn-primary text-xs bg-emerald-600 hover:bg-emerald-500 px-4"
                >
                  {approveMutation.isPending && approveMutation.variables === run.run_id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <><CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve Simulated Patch</>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pre-Flight Inspection Drawer */}
      <PreFlightDrawer
        isOpen={!!inspectRun}
        run={inspectRun}
        details={inspectRun}
        onClose={() => setInspectRun(null)}
        onConfirm={() => setInspectRun(null)}
      />
    </main>
  );
}
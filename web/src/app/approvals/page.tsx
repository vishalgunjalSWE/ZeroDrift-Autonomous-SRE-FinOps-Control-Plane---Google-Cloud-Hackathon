"use client";

import { usePendingApprovals, useApproveMR, useRejectMR } from "@/hooks/useApi";
import { CheckCircle, XCircle, Loader2, UserCheck, ShieldAlert, FileText, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function ApprovalsPage() {
  const { data, isLoading } = usePendingApprovals();
  const approveMutation = useApproveMR();
  const rejectMutation = useRejectMR();

  const pendingRuns = data?.pending || [];

  return (
    <main className="p-6 lg:p-10 max-w-[1800px] mx-auto w-full h-full flex flex-col space-y-8">
      <div className="border-b border-white/10 pb-6 shrink-0">
        <h1 className="text-2xl font-bold text-white flex items-center">
          <UserCheck className="w-6 h-6 mr-3 text-amber-500" />
          Pending Approvals
        </h1>
        <p className="text-muted text-[13px] mt-2">Human-in-the-loop (HITL) gatekeeper for high-risk infrastructure patches.</p>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center text-muted">
          <Loader2 className="w-6 h-6 animate-spin mr-3 text-amber-500" /> Scanning ledger for pending approvals...
        </div>
      ) : pendingRuns.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-muted h-[400px]">
          <CheckCircle className="w-16 h-16 mb-6 text-emerald/30" />
          <p className="text-lg">No pending approvals.</p>
          <p className="text-sm">All changes have been successfully resolved.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {pendingRuns.map((run: any) => (
            <div key={run.run_id} className="glass-card rounded-xl border border-amber-500/30 overflow-hidden flex flex-col shadow-[0_0_30px_rgba(245,158,11,0.05)] relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-amber-500" />
              
              {/* Header */}
              <div className="p-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="font-mono text-azure font-medium text-lg">{run.run_id}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30 uppercase tracking-widest">
                      Requires Approval
                    </span>
                  </div>
                  <div className="text-sm text-muted flex items-center">
                    <Calendar className="w-4 h-4 mr-2 opacity-50" />
                    Requested {formatDistanceToNow(new Date(run.timestamp), { addSuffix: true })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald">
                    ${Math.abs(Number(run.savings)).toFixed(2)}
                  </div>
                  <div className="text-[10px] text-muted uppercase font-semibold tracking-widest">Monthly Impact</div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 bg-[#0A0A0B] space-y-6">
                <div>
                  <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Proposed Optimization</h3>
                  <div className="flex items-center space-x-4 bg-white/[0.02] border border-white/5 p-4 rounded-lg">
                    <div className="flex-1 font-mono text-sm text-infrared line-through opacity-70 truncate">{run.old_instance}</div>
                    <div className="text-muted">&rarr;</div>
                    <div className="flex-1 font-mono text-sm text-emerald font-medium truncate">{run.new_instance}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 flex items-center">
                      <ShieldAlert className="w-4 h-4 mr-2" /> Risk Assessment
                    </h3>
                    <div className="bg-white/[0.02] border border-white/5 p-3 rounded-lg text-sm text-[#EDEDED]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-muted">Risk Score</span>
                        <span className="font-bold text-infrared">{run.risk_score || 5}/10</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted">Confidence</span>
                        <span className="font-bold text-azure">{run.confidence_score || 0}%</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 flex items-center">
                      <FileText className="w-4 h-4 mr-2" /> Blast Radius
                    </h3>
                    <div className="bg-white/[0.02] border border-white/5 p-3 rounded-lg text-sm text-[#EDEDED] line-clamp-2" title={run.blast_radius}>
                      {run.blast_radius || "Unknown impact. Principal review required."}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Reasoning Trace</h3>
                  <div className="bg-violet/5 border border-violet/10 p-4 rounded-lg text-sm text-[#E2C4FF] font-mono leading-relaxed">
                    {run.reasoning_trace || run.reasoning || "No trace available."}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 border-t border-white/5 bg-white/[0.02] flex items-center space-x-4">
                <button
                  onClick={() => approveMutation.mutate(run.run_id)}
                  disabled={approveMutation.isPending || rejectMutation.isPending}
                  className="flex-1 bg-emerald/20 hover:bg-emerald/30 border border-emerald/30 text-emerald text-sm font-bold py-3 rounded-lg transition-all flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50"
                >
                  {approveMutation.isPending && approveMutation.variables === run.run_id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <><CheckCircle className="w-5 h-5 mr-2" /> Approve & Merge</>
                  )}
                </button>
                <button
                  onClick={() => rejectMutation.mutate(run.run_id)}
                  disabled={approveMutation.isPending || rejectMutation.isPending}
                  className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-muted hover:text-white text-sm font-bold py-3 rounded-lg transition-all flex items-center justify-center disabled:opacity-50"
                >
                  {rejectMutation.isPending && rejectMutation.variables === run.run_id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <><XCircle className="w-5 h-5 mr-2" /> Reject Run</>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
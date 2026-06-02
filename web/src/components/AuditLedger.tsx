"use client";

import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Table, CheckCircle, XCircle, AlertTriangle, Activity } from "lucide-react";
import { DeepDiveDrawer } from "./DeepDiveDrawer";

const BACKEND = "http://localhost:8000";

function fetchRuns() {
  return fetch(`${BACKEND}/api/runs`).then((r) => {
    if (!r.ok) throw new Error("fetch runs failed");
    return r.json();
  });
}

function StatusBadge({ status }: { status: string }) {
  const isSuccess = status?.includes("SUCCESS") || status?.includes("MERGED");
  const isFail = status?.includes("FAILED") || status?.includes("REJECTED");
  const isRolledBack = status?.includes("ROLLED_BACK");

  const cls = isSuccess
    ? "bg-emerald/15 text-emerald border-emerald/30"
    : isFail
    ? "bg-infrared/15 text-infrared border-infrared/30"
    : isRolledBack
    ? "bg-amber/15 text-amber border-amber/30"
    : "bg-azure/15 text-azure border-azure/30";

  const Icon = isSuccess
    ? CheckCircle
    : isFail
    ? XCircle
    : isRolledBack
    ? AlertTriangle
    : Activity;

  return (
    <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border tracking-wide ${cls}`}>
      <Icon className="w-3 h-3" />
      <span>{status}</span>
    </span>
  );
}

export function AuditLedger() {
  const queryClient = useQueryClient();
  const [selectedRun, setSelectedRun] = useState<any | null>(null);

  const { data: runs = [], isLoading } = useQuery({
    queryKey: ["runs"],
    queryFn: fetchRuns,
    refetchInterval: 15_000,
  });

  const refetchAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["runs"] });
    queryClient.invalidateQueries({ queryKey: ["metrics-summary"] });
  }, [queryClient]);

  const approveMR = async (runId: string) => {
    await fetch(`${BACKEND}/api/approve-mr/${runId}`, { method: "POST" });
    refetchAll();
  };

  const rejectMR = async (runId: string) => {
    await fetch(`${BACKEND}/api/reject-mr/${runId}`, { method: "POST" });
    refetchAll();
  };

  const simulateIncident = async (runId: string) => {
    await fetch(`${BACKEND}/api/simulate-incident/${runId}`, { method: "POST" });
    refetchAll();
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div>
        <h2 className="text-lg font-semibold flex items-center">
          <Table className="w-4 h-4 mr-2 text-azure" />
          Audit Ledger & Approvals
        </h2>
        <p className="text-sm text-muted">
          Immutable historical ledger — click any row to deep-inspect.
        </p>
      </div>

      <div className="glass-card rounded-xl border border-white/5 overflow-hidden flex-1 flex flex-col">
        {/* Table */}
        <div className="overflow-auto flex-1">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.03] border-b border-white/5 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-muted font-medium text-xs uppercase tracking-wide">Run ID</th>
                <th className="px-4 py-3 text-muted font-medium text-xs uppercase tracking-wide">Timestamp</th>
                <th className="px-4 py-3 text-muted font-medium text-xs uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-muted font-medium text-xs uppercase tracking-wide">Savings</th>
                <th className="px-4 py-3 text-muted font-medium text-xs uppercase tracking-wide">Risk</th>
                <th className="px-4 py-3 text-muted font-medium text-xs uppercase tracking-wide">JIRA</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className={`h-4 rounded overflow-hidden relative bg-white/[0.03] ${j === 0 ? 'w-24' : j === 2 ? 'w-16 rounded-full' : j === 3 ? 'w-12' : 'w-20'}`}>
                          {/* Shimmer effect */}
                          <div 
                            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.05] to-transparent"
                            style={{ animation: 'shimmer 2s infinite' }}
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))
              )}

              {!isLoading && runs.map((run: any, idx: number) => (
                <motion.tr
                  key={run.run_id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02, duration: 0.2 }}
                  onClick={() => setSelectedRun(run)}
                  className={`border-b border-white/5 cursor-pointer transition-all ${
                    selectedRun?.run_id === run.run_id
                      ? "bg-azure/5 border-l-2 border-l-azure"
                      : "hover:bg-white/[0.02]"
                  }`}
                >
                  <td className="px-4 py-3 font-mono text-xs text-muted">{run.run_id}</td>
                  <td className="px-4 py-3 text-xs text-muted">
                    {new Date(run.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={run.status} />
                  </td>
                  <td className="px-4 py-3 text-emerald font-semibold text-sm">
                    {run.savings > 0 ? `$${run.savings.toFixed(0)}/mo` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-semibold ${
                      (run.risk_score || 0) > 7 ? "text-infrared"
                      : (run.risk_score || 0) > 3 ? "text-amber"
                      : "text-emerald"
                    }`}>
                      {run.risk_score != null ? `${run.risk_score}/10` : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted font-mono">
                    {run.jira_ticket || "—"}
                  </td>
                </motion.tr>
              ))}

              {!isLoading && runs.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted">
                    <div className="flex flex-col items-center space-y-2">
                      <Table className="w-8 h-8 opacity-20" />
                      <p className="text-sm">No runs found. Trigger a sweep to begin.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stripe-style Deep Dive Drawer */}
      <DeepDiveDrawer
        run={selectedRun}
        onClose={() => setSelectedRun(null)}
        onApprove={approveMR}
        onReject={rejectMR}
        onSimulateIncident={simulateIncident}
      />
    </div>
  );
}

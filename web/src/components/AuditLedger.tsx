"use client";

import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Table, CheckCircle, XCircle, AlertTriangle, Activity, Database, ChevronRight } from "lucide-react";
import { DeepDiveDrawer } from "./DeepDiveDrawer";

const BACKEND = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "");

function fetchRuns() {
  return fetch(`${BACKEND}/api/runs`).then((r) => {
    if (!r.ok) throw new Error("fetch runs failed");
    return r.json();
  });
}

function StatusBadge({ status }: { status: string }) {
  const isSuccess = status?.includes("SUCCESS") || status?.includes("MERGED");
  const isFail = status?.includes("FAILED") || status?.includes("REJECTED");
  const isPending = status?.includes("REQUIRES_APPROVAL") || status?.includes("PENDING");
  const isRolledBack = status?.includes("ROLLED_BACK");

  if (isSuccess) {
    return (
      <span className="zd-badge zd-badge-emerald">
        <CheckCircle className="w-3 h-3 mr-1" />
        <span>{status}</span>
      </span>
    );
  }
  if (isPending) {
    return (
      <span className="zd-badge zd-badge-amber">
        <Activity className="w-3 h-3 mr-1" />
        <span>{status}</span>
      </span>
    );
  }
  if (isRolledBack) {
    return (
      <span className="zd-badge zd-badge-amber">
        <AlertTriangle className="w-3 h-3 mr-1" />
        <span>{status}</span>
      </span>
    );
  }
  if (isFail) {
    return (
      <span className="zd-badge zd-badge-danger">
        <XCircle className="w-3 h-3 mr-1" />
        <span>{status}</span>
      </span>
    );
  }

  return (
    <span className="zd-badge zd-badge-neutral">
      <Activity className="w-3 h-3 mr-1" />
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
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between pb-5 border-b border-white/[0.08] gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
            <span>Governance & Audit</span>
            <span>/</span>
            <span className="text-white">Remediation History</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center">
            <Table className="w-6 h-6 mr-3 text-blue-500" />
            Audit Ledger & Evidence Records
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Append-only demo audit history — click any row to inspect context-isolation artifacts and rollback plans.
          </p>
        </div>
        <div className="text-xs text-slate-300 font-mono flex items-center space-x-2.5 bg-[#0E121B] border border-white/[0.08] px-3.5 py-2 rounded-lg shrink-0">
          <Database className="w-3.5 h-3.5 text-blue-400" />
          <span>{runs.length} Records · Isolated Sandbox Target</span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="zd-card border border-white/[0.08] overflow-hidden flex-1 flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#0E121B] border-b border-white/[0.08] sticky top-0 z-10">
              <tr>
                <th className="px-5 py-3.5 text-slate-400 font-mono text-[11px] uppercase tracking-wider">Run ID</th>
                <th className="px-5 py-3.5 text-slate-400 font-mono text-[11px] uppercase tracking-wider">Timestamp</th>
                <th className="px-5 py-3.5 text-slate-400 font-mono text-[11px] uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-slate-400 font-mono text-[11px] uppercase tracking-wider">Monthly Savings</th>
                <th className="px-5 py-3.5 text-slate-400 font-mono text-[11px] uppercase tracking-wider">Risk Score</th>
                <th className="px-5 py-3.5 text-slate-400 font-mono text-[11px] uppercase tracking-wider">JIRA Ticket</th>
                <th className="px-5 py-3.5 text-slate-400 font-mono text-[11px] uppercase tracking-wider text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {isLoading && (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className={`h-4 rounded bg-white/[0.04] ${j === 0 ? 'w-24' : j === 2 ? 'w-20' : j === 3 ? 'w-16' : 'w-20'}`} />
                      </td>
                    ))}
                  </tr>
                ))
              )}

              {!isLoading && runs.map((run: any, idx: number) => (
                <motion.tr
                  key={run.run_id}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02, duration: 0.15 }}
                  onClick={() => setSelectedRun(run)}
                  className={`cursor-pointer transition-colors ${
                    selectedRun?.run_id === run.run_id
                      ? "bg-blue-500/10 border-l-2 border-l-blue-500"
                      : "hover:bg-white/[0.03]"
                  }`}
                >
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-200">{run.run_id}</td>
                  <td className="px-5 py-3.5 text-xs text-slate-400 font-mono">
                    {new Date(run.timestamp).toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={run.status} />
                  </td>
                  <td className="px-5 py-3.5 text-emerald-400 font-mono font-semibold text-xs">
                    {run.savings > 0 ? `$${run.savings.toFixed(2)}/mo` : "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-mono font-semibold ${
                      (run.risk_score || 0) > 7 ? "text-rose-400"
                      : (run.risk_score || 0) > 3 ? "text-amber-400"
                      : "text-emerald-400"
                    }`}>
                      {run.risk_score != null ? `${run.risk_score}/10` : "—"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-400 font-mono">
                    {run.jira_ticket || "—"}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="text-xs text-slate-500 group-hover:text-slate-300 inline-flex items-center">
                      Inspect <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </span>
                  </td>
                </motion.tr>
              ))}

              {!isLoading && runs.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-16 text-center text-slate-500">
                    <div className="flex flex-col items-center space-y-2">
                      <Table className="w-8 h-8 opacity-25" />
                      <p className="text-sm">No remediation records in append-only demo audit history.</p>
                      <p className="text-xs text-slate-600">Trigger a simulation sweep from Command Center or IaC Explorer.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stripe/Linear-style Deep Dive Drawer */}
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

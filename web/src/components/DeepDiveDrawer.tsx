"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, GitMerge, ShieldAlert, CheckCircle, XCircle, AlertTriangle, Activity, FileCode2, Clock, DollarSign, Cpu, FileJson } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PreFlightDrawer } from "./PreFlightDrawer";

const BACKEND = "http://localhost:8000";

interface DrawerProps {
  run: any | null;
  onClose: () => void;
  onApprove?: (runId: string) => void;
  onReject?: (runId: string) => void;
  onSimulateIncident?: (runId: string) => void;
}

// ── Simple inline diff renderer ──────────────────────────────────────────────
function InlineDiff({ original, updated }: { original: string; updated: string }) {
  const origLines = (original || "").split("\n");
  const updLines = (updated || "").split("\n");
  const maxLines = Math.max(origLines.length, updLines.length);

  const rows: { orig: string; upd: string; changed: boolean }[] = [];
  for (let i = 0; i < maxLines; i++) {
    const o = origLines[i] ?? "";
    const u = updLines[i] ?? "";
    rows.push({ orig: o, upd: u, changed: o !== u });
  }

  const changedRows = rows.filter((r) => r.changed);
  if (changedRows.length === 0) {
    return (
      <p className="text-xs text-muted font-mono p-4">No diff detected between original and optimized code.</p>
    );
  }

  return (
    <div className="font-mono text-[11px] overflow-x-auto">
      <div className="grid grid-cols-2 divide-x divide-white/10">
        {/* Left: Original */}
        <div>
          <div className="px-3 py-1.5 text-[10px] font-bold text-infrared uppercase tracking-wider bg-infrared/5 border-b border-white/10">
            − Original
          </div>
          {rows.filter((r) => r.changed).map((row, i) => (
            <div key={i} className="px-3 py-0.5 bg-infrared/5 text-infrared/80 line-through whitespace-pre">
              {row.orig || " "}
            </div>
          ))}
        </div>
        {/* Right: Updated */}
        <div>
          <div className="px-3 py-1.5 text-[10px] font-bold text-emerald uppercase tracking-wider bg-emerald/5 border-b border-white/10">
            + Optimized
          </div>
          {rows.filter((r) => r.changed).map((row, i) => (
            <div key={i} className="px-3 py-0.5 bg-emerald/5 text-emerald whitespace-pre">
              {row.upd || " "}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const cfg = status?.includes("SUCCESS") || status?.includes("MERGED")
    ? { bg: "bg-emerald/15 border-emerald/30 text-emerald", icon: <CheckCircle className="w-3 h-3" /> }
    : status?.includes("FAILED") || status?.includes("REJECTED")
    ? { bg: "bg-infrared/15 border-infrared/30 text-infrared", icon: <XCircle className="w-3 h-3" /> }
    : status?.includes("ROLLED_BACK")
    ? { bg: "bg-amber/15 border-amber/30 text-amber", icon: <AlertTriangle className="w-3 h-3" /> }
    : { bg: "bg-azure/15 border-azure/30 text-azure", icon: <Activity className="w-3 h-3" /> };

  return (
    <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border tracking-wide ${cfg.bg}`}>
      {cfg.icon}
      <span>{status}</span>
    </span>
  );
}

export function DeepDiveDrawer({ run, onClose, onApprove, onReject, onSimulateIncident }: DrawerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [showPreFlight, setShowPreFlight] = useState(false);

  // Fetch rich run details
  const { data: details, isLoading } = useQuery({
    queryKey: ["run-details", run?.run_id],
    queryFn: () =>
      fetch(`${BACKEND}/api/run-details/${run?.run_id}`).then((r) => r.json()),
    enabled: !!run?.run_id,
    staleTime: 30_000,
  });

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    if (run) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [run]);

  const richDetails = details || {};
  const hasOptimizations = Array.isArray(richDetails.optimizations) && richDetails.optimizations.length > 0;
  const hasPostMortem = !!richDetails.post_mortem;
  const hasDiff = richDetails.original_code && richDetails.updated_terraform_code;

  return (
    <AnimatePresence>
      {run && (
        <>
          {/* Backdrop */}
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed right-0 top-0 h-full w-full max-w-2xl bg-[#0F0F0F] border-l border-white/10 z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-white/10 bg-white/[0.02] shrink-0">
              <div className="space-y-1.5">
                <div className="text-[10px] text-muted uppercase font-bold tracking-widest">Run Inspector</div>
                <div className="text-lg font-mono text-[#EDEDED]">{run.run_id}</div>
                <div className="flex items-center space-x-3">
                  <StatusBadge status={run.status} />
                  <span className="flex items-center text-xs text-muted space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(run.timestamp).toLocaleString()}</span>
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-muted hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {isLoading && (
                <div className="space-y-4 animate-pulse">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 bg-white/5 rounded-xl" />
                  ))}
                </div>
              )}

              {!isLoading && (
                <>
                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/[0.03] border border-white/8 rounded-lg p-3">
                      <div className="text-[10px] text-muted uppercase tracking-wider mb-1 flex items-center space-x-1">
                        <DollarSign className="w-3 h-3" />
                        <span>Monthly Savings</span>
                      </div>
                      <div className="text-xl font-semibold text-emerald">
                        ${(run.savings || 0).toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-white/[0.03] border border-white/8 rounded-lg p-3">
                      <div className="text-[10px] text-muted uppercase tracking-wider mb-1 flex items-center space-x-1">
                        <ShieldAlert className="w-3 h-3" />
                        <span>Risk Score</span>
                      </div>
                      <div className={`text-xl font-semibold ${
                        (run.risk_score || 0) > 7 ? "text-infrared"
                        : (run.risk_score || 0) > 3 ? "text-amber"
                        : "text-emerald"
                      }`}>
                        {run.risk_score ?? "—"} / 10
                      </div>
                    </div>
                    <div className="bg-white/[0.03] border border-white/8 rounded-lg p-3">
                      <div className="text-[10px] text-muted uppercase tracking-wider mb-1 flex items-center space-x-1">
                        <Cpu className="w-3 h-3" />
                        <span>Risk Level</span>
                      </div>
                      <div className={`text-xl font-semibold ${
                        run.risk_level === "HIGH" ? "text-infrared"
                        : run.risk_level === "MEDIUM" ? "text-amber"
                        : "text-emerald"
                      }`}>
                        {run.risk_level || "—"}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {run.status === "SUCCESS" && (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setShowPreFlight(true)}
                        className="flex items-center justify-center space-x-2 py-2.5 bg-azure/10 hover:bg-azure/20 border border-azure/30 text-azure font-semibold rounded-lg transition-all text-sm shadow-[0_0_15px_rgba(0,112,243,0.15)]"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Run Pre-Flight Analysis</span>
                      </button>
                      <button
                        onClick={() => { onReject?.(run.run_id); onClose(); }}
                        className="flex items-center justify-center space-x-2 py-2.5 bg-infrared/10 hover:bg-infrared/20 border border-infrared/30 text-infrared font-semibold rounded-lg transition-all text-sm"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}

                  {run.status === "REQUIRES_PRINCIPAL_REVIEW" && (
                    <button
                      onClick={() => { onApprove?.(run.run_id); onClose(); }}
                      className="w-full flex items-center justify-center space-x-2 py-2.5 bg-violet/10 hover:bg-violet/20 border border-violet/30 text-violet font-semibold rounded-lg transition-all text-sm"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      <span>Override Circuit Breaker & Merge</span>
                    </button>
                  )}

                  {run.status?.includes("MERGED") && (
                    <button
                      onClick={() => { onSimulateIncident?.(run.run_id); onClose(); }}
                      className="w-full flex items-center justify-center space-x-2 py-2.5 bg-infrared hover:bg-red-600 text-white font-semibold rounded-lg transition-all text-sm"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>Simulate Production Incident</span>
                    </button>
                  )}

                  {/* Optimization Details */}
                  {hasOptimizations && (
                    <div>
                      <div className="text-xs font-semibold text-azure flex items-center space-x-2 mb-3">
                        <Cpu className="w-4 h-4" />
                        <span>Resource Optimizations</span>
                      </div>
                      <div className="border border-white/8 rounded-xl overflow-hidden">
                        <table className="w-full text-xs">
                          <thead className="bg-white/[0.03] text-muted">
                            <tr>
                              <th className="text-left px-4 py-2.5">Resource</th>
                              <th className="text-left px-4 py-2.5">Provider</th>
                              <th className="text-left px-4 py-2.5 text-infrared">Old</th>
                              <th className="text-left px-4 py-2.5 text-emerald">New</th>
                              <th className="text-right px-4 py-2.5 text-emerald">Savings</th>
                            </tr>
                          </thead>
                          <tbody>
                            {richDetails.optimizations.map((opt: any, i: number) => (
                              <tr key={i} className="border-t border-white/5 hover:bg-white/[0.02]">
                                <td className="px-4 py-2.5 font-mono text-[11px] text-muted">{opt.resource_name}</td>
                                <td className="px-4 py-2.5 text-muted">{opt.cloud_provider}</td>
                                <td className="px-4 py-2.5 text-infrared line-through">{opt.old_config}</td>
                                <td className="px-4 py-2.5 text-emerald font-semibold">{opt.new_config}</td>
                                <td className="px-4 py-2.5 text-right text-emerald">${opt.monthly_savings?.toFixed(0)}/mo</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Infrastructure Diff */}
                  {hasDiff && (
                    <div>
                      <div className="text-xs font-semibold text-emerald flex items-center space-x-2 mb-3">
                        <FileCode2 className="w-4 h-4" />
                        <span>Infrastructure Diff</span>
                      </div>
                      <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0A0A0A]">
                        <InlineDiff
                          original={richDetails.original_code}
                          updated={richDetails.updated_terraform_code}
                        />
                      </div>
                    </div>
                  )}

                  {/* XAI Reasoning */}
                  {(richDetails.reasoning || run.reasoning_trace) && (
                    <div>
                      <div className="text-xs font-semibold text-violet flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Activity className="w-4 h-4" />
                          <span>AI Reasoning Chain</span>
                        </div>
                        <span className="text-[10px] bg-violet/10 px-2 py-0.5 rounded border border-violet/20">Governance-as-Code</span>
                      </div>
                      <div className="bg-[#0A0A0A] border border-white/8 rounded-xl p-4 text-xs text-muted font-mono whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                        <div className="flex items-center space-x-2 mb-3 pb-3 border-b border-white/5">
                           <FileJson className="w-4 h-4 text-violet/70" />
                           <span className="text-violet/70">raw_context.json</span>
                        </div>
                        {richDetails.reasoning || run.reasoning_trace || "No reasoning trace available."}
                        {/* Mocking raw JSON context for demo polish */}
                        {`\n\n{\n  "decision_engine": "ZeroDrift-L7",\n  "policy_evaluation": {\n    "cpu_utilization_14d_avg": 4.2,\n    "memory_utilization_14d_avg": 12.1,\n    "network_io_anomaly": false,\n    "business_hours_usage": "low"\n  },\n  "action": "DOWNSIZE",\n  "rationale": "Downsized instance X because average CPU utilization over the last 14 days was 4.2%. Performance impact negligible based on historical APM data."\n}`}
                      </div>
                    </div>
                  )}

                  {/* AI Post-Mortem */}
                  {hasPostMortem && (
                    <div>
                      <div className="text-xs font-semibold text-amber flex items-center space-x-2 mb-3">
                        <AlertTriangle className="w-4 h-4" />
                        <span>AI Incident Post-Mortem</span>
                      </div>
                      <div className="bg-amber/[0.03] border border-amber/15 rounded-xl p-4 text-xs text-[#EDEDED] leading-relaxed max-h-64 overflow-y-auto whitespace-pre-wrap">
                        {richDetails.post_mortem}
                      </div>
                    </div>
                  )}

                  {/* Blast Radius */}
                  {run.blast_radius && (
                    <div>
                      <div className="text-xs font-semibold text-muted flex items-center space-x-2 mb-2">
                        <GitMerge className="w-4 h-4" />
                        <span>Blast Radius Assessment</span>
                      </div>
                      <p className="text-xs text-muted bg-white/[0.02] border border-white/8 rounded-xl p-4 leading-relaxed">
                        {run.blast_radius}
                      </p>
                    </div>
                  )}

                  {/* Jira Ticket */}
                  {run.jira_ticket && (
                    <div className="flex items-center space-x-2 text-xs text-azure">
                      <span className="font-bold">JIRA:</span>
                      <span className="font-mono">{run.jira_ticket}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>

          {/* Pre-Flight Drawer (Renders on top if active) */}
          <PreFlightDrawer
            isOpen={showPreFlight}
            run={run}
            details={richDetails}
            onClose={() => setShowPreFlight(false)}
            onConfirm={() => {
              if (onApprove) onApprove(run.run_id);
              onClose(); // Close the deep dive drawer too
            }}
          />
        </>
      )}
    </AnimatePresence>
  );
}

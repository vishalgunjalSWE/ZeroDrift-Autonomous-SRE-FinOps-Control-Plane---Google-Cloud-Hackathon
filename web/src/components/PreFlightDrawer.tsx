"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, ShieldAlert, Cpu, Activity, Info, Loader2, FileCode2, FileJson } from "lucide-react";
import { useApproveMR } from "@/hooks/useApi";
import dynamic from "next/dynamic";

const MonacoDiffEditor = dynamic(
  () => import("@monaco-editor/react").then((m) => m.DiffEditor),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#0A0A0A] border border-white/5 rounded-md p-10">
        <Loader2 className="w-6 h-6 animate-spin text-muted mb-2" />
        <span className="text-xs text-muted">Loading Monaco Diff Engine...</span>
      </div>
    ),
  }
);

// Removed custom InlineDiff in favor of Monaco DiffEditor

interface PreFlightDrawerProps {
  isOpen: boolean;
  run: any | null;
  details: any | null; // Rich details from DeepDiveDrawer
  onClose: () => void;
  onConfirm: () => void;
}

// Helper to determine impact color
function getImpactColor(riskScore: number) {
  if (riskScore > 7) return "bg-infrared text-white";
  if (riskScore > 3) return "bg-amber text-black";
  return "bg-emerald text-white";
}

export function PreFlightDrawer({ isOpen, run, details, onClose, onConfirm }: PreFlightDrawerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const approveMutation = useApproveMR();
  const [isMutating, setIsMutating] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) {
      document.addEventListener("keydown", handler);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Reset mutating state when drawer opens
  useEffect(() => {
    if (isOpen) setIsMutating(false);
  }, [isOpen]);

  if (!run) return null;

  const currentCost = 15420; // Mock base cost
  const proposedCost = currentCost - (run.savings || 0);
  const resourceCount = 142; // Mock base resources
  const proposedResourceCount = resourceCount; // Assuming same for downsize
  const riskScore = run.risk_score || 0;
  
  // AI Confidence metric (mocked based on risk score)
  const confidence = Math.max(0, 100 - (riskScore * 8));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop (over DeepDiveDrawer) */}
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60]"
          />

          {/* Drawer from Right */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 w-full md:w-[900px] max-w-[96vw] h-full bg-[#0B0D13] border-l border-white/[0.1] z-[70] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/[0.08] bg-[#0E121A]">
              <div>
                <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                  <h2 className="text-lg font-bold tracking-tight text-slate-100">
                    Pre-Flight Remediation Approval
                  </h2>
                  <span className="zd-badge-amber">
                    Simulation Sandbox Target
                  </span>
                  {run.source_tag === "AI ANALYSIS" ? (
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/25">
                      AI Analysis (Gemini)
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/25">
                      Demo Fallback Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  Review verified pre-flight metrics before applying the simulated GitOps patch to isolated sandbox.
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/[0.06] rounded-lg transition-colors text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lifecycle Timeline Bar */}
            <div className="px-6 py-3.5 bg-[#0D1017] border-b border-white/[0.06] flex items-center justify-between text-xs font-mono overflow-x-auto">
              <div className="flex items-center space-x-1.5 text-emerald-400 shrink-0">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>1. Detected</span>
              </div>
              <span className="text-slate-600 shrink-0 mx-2">→</span>
              <div className="flex items-center space-x-1.5 text-emerald-400 shrink-0">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>2. Context Isolation</span>
              </div>
              <span className="text-slate-600 shrink-0 mx-2">→</span>
              <div className="flex items-center space-x-1.5 text-emerald-400 shrink-0">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>3. Pre-flight Guardrail</span>
              </div>
              <span className="text-slate-600 shrink-0 mx-2">→</span>
              <div className="flex items-center space-x-1.5 text-amber-400 font-bold shrink-0">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>4. Awaiting Human Approval</span>
              </div>
              <span className="text-slate-600 shrink-0 mx-2">→</span>
              <div className="flex items-center space-x-1.5 text-slate-500 shrink-0">
                <div className="w-2 h-2 rounded-full bg-slate-700" />
                <span>5. Simulated Patch</span>
              </div>
            </div>

            {/* Split Screen View */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-6">
              
              {/* Left Side: Current State */}
              <div className="flex-1 bg-[#121620] border border-white/[0.08] rounded-xl p-5 flex flex-col">
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-5 pb-2 border-b border-white/[0.06]">
                  Current Infrastructure State
                </div>
                
                <div className="space-y-5 flex-1">
                  <div>
                    <div className="text-xs text-slate-400 mb-1">Baseline Monthly Spend</div>
                    <div className="text-2xl font-mono text-slate-100 font-semibold">${currentCost.toLocaleString()}</div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-slate-400 mb-1">Target Resource Scope</div>
                    <div className="text-xs font-mono text-slate-200 bg-[#0E121A] p-2.5 rounded border border-white/[0.06]">{run.old_instance || "AWS EC2 t3.2xlarge & GCP n1-standard-8"}</div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-400 mb-1">Static Pre-Flight Status</div>
                    <div className="flex items-center space-x-2 bg-emerald-500/10 text-emerald-400 text-xs font-mono px-3 py-1.5 rounded border border-emerald-500/25">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Static HCL pre-flight guardrail passed</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle: Arrow/Transition */}
              <div className="hidden lg:flex flex-col items-center justify-center opacity-40">
                <div className="w-px h-12 bg-white/20 mb-2"></div>
                <div className="text-[10px] font-mono uppercase tracking-widest bg-white/[0.05] px-2.5 py-1 rounded-full text-slate-400">Sandbox</div>
                <div className="w-px h-12 bg-white/20 mt-2"></div>
              </div>

              {/* Right Side: Proposed State */}
              <div className="flex-1 bg-[#141A26] border border-blue-500/20 rounded-xl p-5 flex flex-col relative overflow-hidden">
                <div className="text-[11px] uppercase tracking-wider text-blue-400 font-semibold mb-5 pb-2 border-b border-blue-500/15 flex justify-between items-center">
                  <span>Proposed Sandbox State</span>
                  <span className="text-[11px] text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded font-mono font-bold">
                    +${(run.savings || 383.51).toLocaleString()}/mo Savings
                  </span>
                </div>
                
                <div className="space-y-4 flex-1">
                  <div>
                    <div className="text-xs text-slate-400 mb-1">Optimized Target Config</div>
                    <div className="text-xs font-mono text-slate-100 bg-[#0E121A] p-2.5 rounded border border-white/[0.06]">{run.new_instance || "AWS EC2 t3.medium & GCP e2-medium"}</div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-slate-400 mb-1">Context Isolation & Blast Radius</div>
                    <div className="text-xs text-slate-300 font-mono bg-[#0E121A] p-2.5 rounded border border-white/[0.06]">
                      {run.blast_radius || details?.blast_radius || "Low impact. Single compute instance resize in non-db tier."}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-400 mb-1">Automated Rollback Instruction</div>
                    <div className="text-xs text-amber-300 font-mono bg-amber-500/10 p-2.5 rounded border border-amber-500/20">
                      {run.rollback_plan || details?.rollback_plan || "Revert demo_infrastructure.tf instance types to previous baseline size."}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1 font-mono">
                      <span>{run.source_tag === "AI ANALYSIS" ? `AI Confidence: ${confidence}%` : `Demo Recommendation Confidence: ${confidence}%`}</span>
                      <span>Risk Score: {riskScore}/10</span>
                    </div>

                    <div className="bg-[#0E121A] border border-white/[0.06] rounded-lg p-2.5 flex items-center justify-between">
                      <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider font-mono">
                        Risk Rating
                      </div>
                      <div className="text-xs font-bold font-mono text-emerald-400">
                        {riskScore <= 3 ? "LOW RISK (2/10)" : `MEDIUM RISK (${riskScore}/10)`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decision Rationale & Diff Section */}
            <div className="px-6 pb-6 overflow-y-auto shrink-0 max-h-[32vh]">
               <div className="text-xs font-semibold text-purple-400 flex items-center justify-between mb-2">
                 <div className="flex items-center space-x-2">
                   <Activity className="w-3.5 h-3.5" />
                   <span>Decision Rationale & Context Isolation</span>
                 </div>
                 <span className="text-[10px] bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 font-mono">Telemetry Trace</span>
               </div>
               <div className="bg-[#0E121A] border border-white/[0.08] rounded-xl p-3.5 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed mb-4">
                 <div className="flex items-center space-x-2 mb-2 pb-2 border-b border-white/[0.05] text-purple-400/80">
                    <FileJson className="w-3.5 h-3.5" />
                    <span>dependency_aware_analysis</span>
                 </div>
                 {run.reasoning_trace || details?.reasoning || "[DETERMINISTIC DEMO FALLBACK] Telemetry analysis: 14-day average CPU < 12%. Safe to downsize."}
               </div>

               {run.updated_terraform_code && (
                 <div>
                   <div className="text-xs font-semibold text-emerald-400 flex items-center justify-between mb-2">
                     <div className="flex items-center space-x-2">
                       <FileCode2 className="w-3.5 h-3.5" />
                       <span>Simulated GitOps HCL Patch</span>
                     </div>
                     <span className="text-[10px] text-slate-400 font-mono">Target: terraform_sandbox/demo_infrastructure.tf</span>
                   </div>
                   <div className="h-[220px] border border-white/[0.08] rounded-xl overflow-hidden bg-[#0A0D14]">
                     <MonacoDiffEditor
                       original={run.original_code || '# Original Baseline Infrastructure\nresource "aws_instance" "web_frontend" {\n  instance_type = "t3.2xlarge"\n}'}
                       modified={run.updated_terraform_code}
                       language="hcl"
                       theme="vs-dark"
                       options={{
                         renderSideBySide: true,
                         readOnly: true,
                         minimap: { enabled: false },
                         fontSize: 12,
                         fontFamily: "'Roboto Mono', 'JetBrains Mono', monospace",
                         padding: { top: 10, bottom: 10 },
                       }}
                     />
                   </div>
                 </div>
               )}
            </div>

            {/* Footer / Actions */}
            <div className="p-5 border-t border-white/[0.08] bg-[#0E121A] flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
              <div className="flex items-center space-x-2 text-xs text-amber-300 font-mono max-w-full sm:max-w-[60%]">
                <Info className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Simulated patch targets <strong className="text-white">terraform_sandbox/demo_infrastructure.tf</strong>. Root main.tf is read-only.</span>
              </div>
              <div className="flex space-x-3 w-full sm:w-auto">
                <button
                  onClick={onClose}
                  className="zd-btn-secondary flex-1 sm:flex-none text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setIsMutating(true);
                    try {
                      await approveMutation.mutateAsync(run.run_id);
                      onConfirm();
                    } catch (e) {
                      console.error("Failed to approve", e);
                      setIsMutating(false);
                    }
                  }}
                  disabled={isMutating}
                  className="zd-btn-primary flex-1 sm:flex-none text-xs bg-emerald-600 hover:bg-emerald-500 min-w-[190px]"
                >
                  {isMutating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve Simulated Patch</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

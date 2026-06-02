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
            className="fixed top-0 right-0 w-full md:w-[850px] max-w-[95vw] h-full bg-[#0A0A0A] border-l border-white/10 z-[70] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#0F0F0F]">
              <div>
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-azure" />
                  <h2 className="text-xl font-semibold tracking-tight">Pre-Flight Simulation</h2>
                </div>
                <p className="text-xs text-muted mt-1">Review estimated impact before applying infrastructure changes.</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-muted hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Split Screen View */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-6">
              
              {/* Left Side: Current State */}
              <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-xl p-6 flex flex-col">
                <div className="text-xs uppercase tracking-widest text-muted font-bold mb-6 pb-2 border-b border-white/5">
                  Current State
                </div>
                
                <div className="space-y-6 flex-1">
                  <div>
                    <div className="text-xs text-muted mb-1">Monthly Run Rate</div>
                    <div className="text-2xl font-mono text-[#EDEDED]">${currentCost.toLocaleString()}</div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-muted mb-1">Active Resources</div>
                    <div className="text-xl font-mono text-[#EDEDED]">{resourceCount}</div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-muted mb-1">System Health</div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-emerald shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                      <span className="text-sm font-semibold text-emerald">Stable</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle: Arrow/Transition */}
              <div className="hidden lg:flex flex-col items-center justify-center opacity-50">
                <div className="w-px h-16 bg-white/20 mb-2"></div>
                <div className="text-xs uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">Simulation</div>
                <div className="w-px h-16 bg-white/20 mt-2"></div>
              </div>

              {/* Right Side: Proposed State */}
              <div className="flex-1 bg-azure/5 border border-azure/20 rounded-xl p-6 flex flex-col relative overflow-hidden">
                {/* Glow effect */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-azure/10 rounded-full blur-3xl" />

                <div className="text-xs uppercase tracking-widest text-azure font-bold mb-6 pb-2 border-b border-azure/10 relative z-10">
                  Proposed State
                </div>
                
                <div className="space-y-6 flex-1 relative z-10">
                  <div>
                    <div className="text-xs text-azure/70 mb-1">Estimated Monthly Run Rate</div>
                    <div className="flex items-end space-x-3">
                      <div className="text-2xl font-mono text-emerald">${proposedCost.toLocaleString()}</div>
                      <div className="text-xs font-semibold text-emerald bg-emerald/10 px-2 py-0.5 rounded-sm mb-1">
                        - ${(run.savings || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-azure/70 mb-1">Estimated Resources</div>
                    <div className="text-xl font-mono text-[#EDEDED]">{proposedResourceCount}</div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-azure/70 mb-2">Estimated Reliability Impact</div>
                    <div className="w-full bg-white/10 rounded-full h-2 mb-1 overflow-hidden">
                      <div 
                        className={`h-full ${confidence > 80 ? 'bg-emerald' : confidence > 50 ? 'bg-amber' : 'bg-infrared'}`}
                        style={{ width: `${confidence}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted mb-3">
                      <span>AI Confidence: {confidence}%</span>
                      <span>Risk: {riskScore}/10</span>
                    </div>

                    <div className="bg-[#0A0A0A] border border-white/5 rounded-lg p-3">
                      <div className="text-[10px] uppercase text-muted font-bold tracking-wider mb-1">
                        Risk Score
                      </div>
                      <div className={`text-xl font-bold ${getImpactColor(riskScore).replace('bg-', 'text-').split(' ')[0]}`}>
                        {riskScore} / 10
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* XAI Reasoning & Diff Section */}
            <div className="px-6 pb-6 overflow-y-auto shrink-0 max-h-[30vh]">
               <div className="text-xs font-semibold text-violet flex items-center justify-between mb-2">
                 <div className="flex items-center space-x-2">
                   <Activity className="w-4 h-4" />
                   <span>AI Reasoning Trace</span>
                 </div>
                 <span className="text-[10px] bg-violet/10 px-2 py-0.5 rounded border border-violet/20">XAI</span>
               </div>
               <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-4 text-xs text-muted font-mono whitespace-pre-wrap leading-relaxed mb-4 shadow-inner">
                 <div className="flex items-center space-x-2 mb-2 pb-2 border-b border-white/5">
                    <FileJson className="w-4 h-4 text-violet/70" />
                    <span className="text-violet/70">decision_rationale</span>
                 </div>
                 {run.reasoning_trace || details?.reasoning || "No reasoning trace available."}
               </div>

               {run.original_code && run.updated_terraform_code && (
                 <div>
                   <div className="text-xs font-semibold text-emerald flex items-center space-x-2 mb-2">
                     <FileCode2 className="w-4 h-4" />
                     <span>Infrastructure Delta</span>
                   </div>
                   <div className="h-[400px] border border-white/10 rounded-xl overflow-hidden bg-[#0A0A0A]">
                     <MonacoDiffEditor
                       original={run.original_code}
                       modified={run.updated_terraform_code}
                       language="hcl"
                       theme="vs-dark"
                       options={{
                         renderSideBySide: true,
                         readOnly: true,
                         minimap: { enabled: false },
                         fontSize: 12,
                         fontFamily: "'Geist Mono', 'JetBrains Mono', monospace",
                         padding: { top: 16, bottom: 16 },
                       }}
                     />
                   </div>
                 </div>
               )}
            </div>

            {/* Footer / Actions */}
            <div className="p-6 border-t border-white/10 bg-[#0F0F0F] flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2 text-xs text-muted">
                <Info className="w-4 h-4 text-azure" />
                <span>Applying these changes will immediately trigger a Terraform apply in the background.</span>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-lg text-sm font-semibold text-muted hover:text-white hover:bg-white/5 transition-colors"
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
                  className="flex items-center justify-center space-x-2 px-6 py-2.5 bg-azure hover:bg-azure/80 disabled:bg-azure/50 text-white text-sm font-semibold rounded-lg transition-all shadow-[0_0_15px_rgba(0,112,243,0.3)] min-w-[160px]"
                >
                  {isMutating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Confirm & Merge</span>
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

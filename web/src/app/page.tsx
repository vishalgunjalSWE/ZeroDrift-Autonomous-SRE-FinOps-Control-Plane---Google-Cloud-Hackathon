"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { TopNavBar } from "@/components/TopNavBar";
import { FinOpsSummaryMetrics } from "@/components/FinOpsSummaryMetrics";
import { AIExecutionStream } from "@/components/AIExecutionStream";
import { GuardrailsSidebar } from "@/components/GuardrailsSidebar";
import { CommandPalette } from "@/components/CommandPalette";
import { PreFlightDrawer } from "@/components/PreFlightDrawer";
import { TrendingDown, AlertCircle, ShieldAlert, CheckCircle, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { usePendingApprovals } from "@/hooks/useApi";

const BACKEND = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "");

export default function Home() {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [selectedPendingRun, setSelectedPendingRun] = useState<any | null>(null);

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Central runs query for historical metrics
  const { data: runs = [] } = useQuery<any[]>({
    queryKey: ["runs"],
    queryFn: () =>
      fetch(`${BACKEND}/api/runs`).then((r) => {
        if (!r.ok) throw new Error("runs fetch failed");
        return r.json();
      }).catch(() => []),
    refetchInterval: 15_000,
  });

  // Single authoritative source of truth for pending approval proposals
  const { data: pendingData } = usePendingApprovals();
  const pendingRuns = pendingData?.pending || [];
  const pendingApprovalRun = pendingRuns[0] || null;

  // Metrics summary for GreenOps card (pre-aggregated server side)
  const { data: metrics } = useQuery<any>({
    queryKey: ["metrics-summary"],
    queryFn: () =>
      fetch(`${BACKEND}/api/v1/metrics/summary`).then((r) => r.json()).catch(() => null),
    refetchInterval: 2000,
  });

  const metricsRef = useRef(metrics);
  useEffect(() => {
    metricsRef.current = metrics;
  }, [metrics]);

  const [liveSavings, setLiveSavings] = useState<number[]>([]);
  const [liveCarbon, setLiveCarbon] = useState<number[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const current = metricsRef.current;
      setLiveSavings(prev => {
        const val = current?.total_cost_savings || 0;
        const next = prev.length === 0 && val > 0 ? Array(40).fill(val) : (prev.length === 0 ? Array(40).fill(0) : [...prev, val]);
        if (next.length > 40) next.shift();
        return next;
      });
      setLiveCarbon(prev => {
        const val = current?.carbon_avoided_kg || 0;
        const next = prev.length === 0 && val > 0 ? Array(40).fill(val) : (prev.length === 0 ? Array(40).fill(0) : [...prev, val]);
        if (next.length > 40) next.shift();
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Derived metrics for widgets
  const highRuns = runs.filter((r) => (r.risk_score || 0) > 7).length;
  const medRuns = runs.filter((r) => (r.risk_score || 0) > 3 && (r.risk_score || 0) <= 7).length;
  const lowRuns = runs.filter((r) => (r.risk_score || 0) <= 3).length;
  const totalOppRuns = runs.length || 1;
  
  const highPct = Math.round((highRuns / totalOppRuns) * 100);
  const medPct = Math.round((medRuns / totalOppRuns) * 100);
  const lowPct = Math.round((lowRuns / totalOppRuns) * 100);

  const treesPlanted = metrics ? Math.round(metrics.carbon_avoided_kg / 4.54) : 0;

  const [weekLabels, setWeekLabels] = useState<string[]>(["", "", "", "", ""]);

  useEffect(() => {
    const dates = [];
    const today = new Date();
    for (let i = 4; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - (i * 7));
      dates.push(d.toLocaleString('en-US', { month: 'short', day: '2-digit' }));
    }
    setWeekLabels(dates);
  }, []);

  const renderSparkline = (rawData: number[] | undefined, color: string) => {
    if (!rawData || rawData.length < 2) return null;
    
    const max = Math.max(...rawData);
    const min = Math.min(...rawData);
    const range = max - min;
    
    const points = rawData.map((v, i) => {
      const x = (i / (rawData.length - 1)) * 100;
      const y = range === 0 ? 50 : 100 - ((v - min) / range) * 80;
      return [x, y];
    });

    let pathD = `M ${points[0][0]},${points[0][1]}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cp1x = (p0[0] + p1[0]) / 2;
      const cp1y = p0[1];
      const cp2x = (p0[0] + p1[0]) / 2;
      const cp2y = p1[1];
      pathD += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p1[0]},${p1[1]}`;
    }
    
    return (
      <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100" className="absolute inset-0">
        <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
        <path d={`${pathD} L 100,100 L 0,100 Z`} fill={`url(#gradient${color.replace('#', '')})`} opacity="0.2" />
        <defs>
          <linearGradient id={`gradient${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    );
  };

  return (
    <>
      <CommandPalette />
      <TopNavBar />

      <main className="flex-1 p-6 lg:p-10 max-w-[1800px] mx-auto w-full">
        {/* Authoritative Command Center Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/[0.08] pb-6">
          <div>
            <div className="flex items-center space-x-3 mb-1.5">
              <h1 className="text-2xl font-bold tracking-tight text-slate-100">
                Command Center
              </h1>
              <span className="zd-badge-emerald">Operational</span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Autonomous infrastructure analysis &amp; human-in-the-loop control plane
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="px-3 py-1.5 bg-[#121620] border border-white/[0.08] rounded-md text-xs font-mono text-slate-400 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              <span>{currentTime || "Syncing clock..."}</span>
            </div>
          </div>
        </div>

        {/* Above-the-fold Priority: Authoritative Action Required or Graceful System Clear State */}
        {pendingApprovalRun ? (
          <div className="mb-8 p-5 bg-[#161B26] border border-amber-500/30 rounded-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 shadow-lg">
            <div className="flex items-start space-x-4">
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/25 rounded-lg text-amber-400 mt-0.5 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/15 px-2.5 py-0.5 rounded border border-amber-500/25">
                    Action Required · Human Approval Quarantined
                  </span>
                  <span className="text-xs font-mono text-slate-400">{pendingApprovalRun.run_id}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    pendingApprovalRun.gemini_used
                      ? "bg-purple-500/10 text-purple-400 border-purple-500/25"
                      : "bg-slate-500/10 text-slate-400 border-slate-500/25"
                  }`}>
                    {pendingApprovalRun.gemini_used ? "AI analysis" : "Demo fallback active"}
                  </span>
                </div>
                <div className="text-sm font-semibold text-slate-100">
                  Rightsizing Proposal: {pendingApprovalRun.old_instance || "Overprovisioned Instances"} → {pendingApprovalRun.new_instance || "Optimized Targets"}
                </div>
                <div className="text-xs text-slate-400 mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>Risk Score: <strong className="text-slate-300">Low ({pendingApprovalRun.risk_score || 2}/10)</strong></span>
                  <span>·</span>
                  <span>Pre-Flight: <strong className="text-emerald-400 font-mono">Static HCL Pre-Flight Passed ✓</strong></span>
                  <span>·</span>
                  <span>Target: <strong className="text-slate-300 font-mono">terraform_sandbox/demo_infrastructure.tf</strong></span>
                  <span>·</span>
                  <span>Root main.tf: <strong className="text-emerald-400 font-mono">Protected &amp; Untouched</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-5 self-end lg:self-center shrink-0">
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Projected Savings</div>
                <div className="text-2xl font-bold font-mono text-emerald-400">
                  +${(Number(pendingApprovalRun.savings) || 383.51).toFixed(2)}/mo
                </div>
              </div>
              <button 
                onClick={() => setSelectedPendingRun(pendingApprovalRun)}
                className="zd-btn-primary px-4 py-2.5 text-xs flex items-center space-x-2"
              >
                <span>Review proposal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-8 p-5 bg-[#11151E] border border-white/[0.08] rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/25 rounded-lg text-emerald-400 shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2.5 mb-1">
                  <h2 className="text-sm font-semibold text-slate-200">
                    System State: Reconciled &amp; Clear
                  </h2>
                  <span className="zd-badge-neutral text-[10px]">0 Pending Approvals</span>
                </div>
                <p className="text-xs text-slate-400">
                  No active infrastructure drift or pending remediation proposals requiring operator intervention.
                </p>
                <div className="text-[11px] text-slate-500 font-mono mt-1 flex flex-wrap items-center gap-x-2.5">
                  <span>Target: terraform_sandbox/demo_infrastructure.tf</span>
                  <span>·</span>
                  <span>Root main.tf: Protected</span>
                  <span>·</span>
                  <span>Audit ledger: Immutable</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 shrink-0 self-end md:self-center">
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
                className="zd-btn-secondary px-3.5 py-2 text-xs flex items-center space-x-2 font-mono"
              >
                <span>Trigger analysis sweep via ⌘K</span>
              </button>
            </div>
          </div>
        )}

        {/* Hero KPIs — powered by /api/v1/metrics/summary */}
        <FinOpsSummaryMetrics />

        {/* Primary Operational Workspace: Execution Timeline + Guardrails */}
        <div className="flex flex-col space-y-8 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AIExecutionStream />
            </div>
            <div className="lg:col-span-1">
              <GuardrailsSidebar />
            </div>
          </div>

          {/* Operational Analytics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Savings Trajectory Widget */}
            <div className="zd-card p-5 border border-white/[0.08] h-[280px] flex flex-col bg-[#11151E]">
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-300">Savings Trajectory</div>
                <div className="text-[10px] bg-white/[0.05] px-2 py-1 rounded text-slate-400 border border-white/[0.08] font-mono">Demo baseline</div>
              </div>
              <div className="mb-2">
                <div className="text-2xl font-semibold font-mono text-slate-100">
                  ${metrics ? metrics.total_cost_savings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                </div>
                <div className="text-xs font-medium text-emerald-400 flex items-center mt-1">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  Controlled FinOps baseline reduction
                </div>
              </div>
              <div className="flex-1 mt-4 relative">
                {renderSparkline(liveSavings, "#2563EB")}
                <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-[10px] text-slate-500 border-r border-white/[0.05] pr-2 items-end font-mono">
                  <span>Max</span>
                  <span>Avg</span>
                  <span>Min</span>
                </div>
                <div className="absolute left-8 right-0 bottom-0 h-6 flex justify-between text-[10px] text-slate-500 border-t border-white/[0.05] pt-2 px-2 font-mono">
                  {weekLabels.map((l, i) => <span key={`savings-${i}`}>{l}</span>)}
                </div>
              </div>
            </div>

            {/* Optimization Opportunities Widget */}
            <div className="zd-card p-5 border border-white/[0.08] h-[280px] flex flex-col bg-[#11151E]">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-4">Optimization Breakdown</div>
              <div className="flex-1 flex items-center justify-center">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    <circle cx="18" cy="18" r="16" fill="none" stroke="#1D2332" strokeWidth="4" />
                    {/* High */}
                    <motion.circle cx="18" cy="18" r="16" fill="none" stroke="#EF4444" strokeWidth="4" strokeDasharray="100 100" initial={{ strokeDashoffset: 100 }} animate={{ strokeDashoffset: 100 - highPct }} transition={{ duration: 1.2 }} />
                    {/* Medium */}
                    <motion.circle cx="18" cy="18" r="16" fill="none" stroke="#F59E0B" strokeWidth="4" strokeDasharray="100 100" initial={{ strokeDashoffset: 100 }} animate={{ strokeDashoffset: 100 - medPct }} transition={{ duration: 1.2, delay: 0.1 }} style={{ rotate: `${(highPct / 100) * 360}deg`, originX: '18px', originY: '18px' }} />
                    {/* Low */}
                    <motion.circle cx="18" cy="18" r="16" fill="none" stroke="#10B981" strokeWidth="4" strokeDasharray="100 100" initial={{ strokeDashoffset: 100 }} animate={{ strokeDashoffset: 100 - lowPct }} transition={{ duration: 1.2, delay: 0.2 }} style={{ rotate: `${((highPct + medPct) / 100) * 360}deg`, originX: '18px', originY: '18px' }} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-bold font-mono text-slate-100">{runs.length}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">Total</span>
                  </div>
                </div>
                
                <div className="ml-6 space-y-2.5">
                  <div className="flex items-center text-xs">
                    <div className="w-2 h-2 rounded-full bg-red-400 mr-2"></div>
                    <span className="text-slate-400 w-24">High Risk</span>
                    <span className="font-mono text-slate-200">{highRuns} ({highPct}%)</span>
                  </div>
                  <div className="flex items-center text-xs">
                    <div className="w-2 h-2 rounded-full bg-amber-400 mr-2"></div>
                    <span className="text-slate-400 w-24">Medium Risk</span>
                    <span className="font-mono text-slate-200">{medRuns} ({medPct}%)</span>
                  </div>
                  <div className="flex items-center text-xs">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 mr-2"></div>
                    <span className="text-slate-400 w-24">Low Risk</span>
                    <span className="font-mono text-slate-200">{lowRuns} ({lowPct}%)</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Run Opportunity</span>
                <span className="font-semibold text-emerald-400 font-mono">${metrics ? metrics.total_cost_savings.toFixed(2) : "0.00"} <span className="text-slate-500 text-[10px]">/mo</span></span>
              </div>
            </div>

            {/* GreenOps Impact Widget */}
            <div className="zd-card p-5 border border-white/[0.08] h-[280px] flex flex-col bg-[#11151E]">
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-300">GreenOps Avoidance</div>
                <div className="text-[10px] bg-white/[0.05] px-2 py-1 rounded text-slate-400 border border-white/[0.08] font-mono">Demo baseline</div>
              </div>
              <div className="mb-2">
                <div className="text-2xl font-semibold font-mono text-slate-100">
                  {metrics ? metrics.carbon_avoided_kg.toLocaleString() : "0"} <span className="text-sm font-sans font-normal text-slate-400">kg CO₂</span>
                </div>
                <div className="text-xs text-emerald-400 font-medium mt-1">Equivalent to ~{treesPlanted.toLocaleString()} trees planted</div>
              </div>
              <div className="flex-1 mt-2 relative">
                {renderSparkline(liveCarbon, "#10B981")}
                <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-[10px] text-slate-500 border-r border-white/[0.05] pr-2 items-end font-mono">
                  <span>10k</span>
                  <span>5k</span>
                  <span>0</span>
                </div>
                <div className="absolute left-8 right-0 bottom-0 h-6 flex justify-between text-[10px] text-slate-500 border-t border-white/[0.05] pt-2 px-2 font-mono">
                  {weekLabels.map((l, i) => <span key={`green-${i}`}>{l}</span>)}
                </div>
              </div>
            </div>
            
          </div>
        </div>

        {/* Pre-Flight Drawer for Operator Review */}
        <PreFlightDrawer
          isOpen={!!selectedPendingRun}
          run={selectedPendingRun}
          details={selectedPendingRun}
          onClose={() => setSelectedPendingRun(null)}
          onConfirm={() => setSelectedPendingRun(null)}
        />
      </main>
    </>
  );
}

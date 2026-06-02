"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { TopNavBar } from "@/components/TopNavBar";
import { FinOpsSummaryMetrics } from "@/components/FinOpsSummaryMetrics";
import { AIExecutionStream } from "@/components/AIExecutionStream";
import { GuardrailsSidebar } from "@/components/GuardrailsSidebar";
import { CommandPalette } from "@/components/CommandPalette";
import { TrendingDown, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const BACKEND = "http://localhost:8000";

export default function Home() {
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Central runs query — all components that need runs data consume from this cache
  const { data: runs = [] } = useQuery<any[]>({
    queryKey: ["runs"],
    queryFn: () =>
      fetch(`${BACKEND}/api/runs`).then((r) => {
        if (!r.ok) throw new Error("runs fetch failed");
        return r.json();
      }).catch(() => []),
    refetchInterval: 15_000,
  });

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
  const totalOppRuns = runs.length || 1; // avoid div by 0
  
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
        <path d={`${pathD} L 100,100 L 0,100 Z`} fill={`url(#gradient${color.replace('#', '')})`} opacity="0.25" />
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
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-2 text-white flex items-center">
              Welcome back, SRE 👋
            </h1>
            <p className="text-[13px] text-muted">
              Your infrastructure is healthy and optimized
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="px-3 py-1.5 bg-[#161616] border border-white/10 rounded-md text-xs font-mono text-muted flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-azure animate-pulse"></span>
              <span>{currentTime || "Syncing clock..."}</span>
            </div>
            <button className="px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-xs font-medium transition-colors">
              Customize
            </button>
          </div>
        </div>

        {/* Hero KPIs — powered by /api/v1/metrics/summary */}
        <FinOpsSummaryMetrics />

        {/* Tab Content */}
        <div className="flex flex-col space-y-6 pb-20">
            {/* Middle Row: AI Stream + Guardrails */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-[450px] glass-card rounded-xl border border-white/5 overflow-hidden flex flex-col">
                <AIExecutionStream />
              </div>
              <div className="lg:col-span-1 h-[450px]">
                <GuardrailsSidebar />
              </div>
            </div>

            {/* Bottom Row: Dashboard Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Cost Trend Widget */}
              <div className="glass-card rounded-xl p-5 border border-white/5 h-[280px] flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[11px] font-semibold text-[#EDEDED]">Savings Trend</div>
                  <div className="text-[10px] bg-white/5 px-2 py-1 rounded text-muted border border-white/10">Last 30 Days ▾</div>
                </div>
                <div className="mb-2">
                  <div className="text-2xl font-light text-[#EDEDED]">
                    ${metrics ? metrics.total_cost_savings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                  </div>
                  <div className="text-xs font-medium text-emerald flex items-center mt-1">
                    <TrendingDown className="w-3 h-3 mr-1" />
                    18.2% vs previous 30 days
                  </div>
                </div>
                <div className="flex-1 mt-4 relative">
                  {renderSparkline(liveSavings, "#0070F3")}
                  <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-[10px] text-muted border-r border-white/5 pr-2 items-end">
                    <span>Max</span>
                    <span>Avg</span>
                    <span>Min</span>
                  </div>
                  <div className="absolute left-8 right-0 bottom-0 h-6 flex justify-between text-[10px] text-muted border-t border-white/5 pt-2 px-2">
                    {weekLabels.map((l, i) => <span key={`savings-${i}`}>{l}</span>)}
                  </div>
                </div>
              </div>

              {/* Optimization Opportunities Widget */}
              <div className="glass-card rounded-xl p-5 border border-white/5 h-[280px] flex flex-col">
                <div className="text-[11px] font-semibold text-[#EDEDED] mb-4">Optimization Opportunities</div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                      <circle cx="18" cy="18" r="16" fill="none" stroke="#222" strokeWidth="4" />
                      {/* Crimson (High) */}
                      <motion.circle cx="18" cy="18" r="16" fill="none" stroke="#FF4D4D" strokeWidth="4" strokeDasharray="100 100" initial={{ strokeDashoffset: 100 }} animate={{ strokeDashoffset: 100 - highPct }} transition={{ duration: 1.5, type: "spring", bounce: 0.2 }} />
                      {/* Amber (Medium) */}
                      <motion.circle cx="18" cy="18" r="16" fill="none" stroke="#F59E0B" strokeWidth="4" strokeDasharray="100 100" initial={{ strokeDashoffset: 100 }} animate={{ strokeDashoffset: 100 - medPct }} transition={{ duration: 1.5, type: "spring", bounce: 0.2, delay: 0.2 }} style={{ rotate: `${(highPct / 100) * 360}deg`, originX: '18px', originY: '18px' }} />
                      {/* Emerald (Low) */}
                      <motion.circle cx="18" cy="18" r="16" fill="none" stroke="#10B981" strokeWidth="4" strokeDasharray="100 100" initial={{ strokeDashoffset: 100 }} animate={{ strokeDashoffset: 100 - lowPct }} transition={{ duration: 1.5, type: "spring", bounce: 0.2, delay: 0.4 }} style={{ rotate: `${((highPct + medPct) / 100) * 360}deg`, originX: '18px', originY: '18px' }} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-2xl font-light text-[#EDEDED]">{runs.length}</span>
                      <span className="text-[10px] text-muted">Total</span>
                    </div>
                  </div>
                  
                  <div className="ml-6 space-y-3">
                    <div className="flex items-center text-[10px]">
                      <div className="w-2 h-2 rounded-full bg-[#FF4D4D] mr-2"></div>
                      <span className="text-muted w-20">High Impact</span>
                      <span className="font-mono text-[#EDEDED]">{highRuns} ({highPct}%)</span>
                    </div>
                    <div className="flex items-center text-[10px]">
                      <div className="w-2 h-2 rounded-full bg-[#F59E0B] mr-2"></div>
                      <span className="text-muted w-20">Medium Impact</span>
                      <span className="font-mono text-[#EDEDED]">{medRuns} ({medPct}%)</span>
                    </div>
                    <div className="flex items-center text-[10px]">
                      <div className="w-2 h-2 rounded-full bg-[#10B981] mr-2"></div>
                      <span className="text-muted w-20">Low Impact</span>
                      <span className="font-mono text-[#EDEDED]">{lowRuns} ({lowPct}%)</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-muted flex items-center">Estimated Savings <AlertCircle className="w-3 h-3 ml-1" /></span>
                  <span className="font-semibold text-emerald">${metrics ? metrics.total_cost_savings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"} <span className="text-muted text-[10px] font-normal">/mo</span></span>
                </div>
              </div>

              {/* GreenOps Impact Widget */}
              <div className="glass-card rounded-xl p-5 border border-white/5 h-[280px] flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[11px] font-semibold text-[#EDEDED]">GreenOps Impact</div>
                  <div className="text-[10px] bg-white/5 px-2 py-1 rounded text-muted border border-white/10">This Month ▾</div>
                </div>
                <div className="mb-2">
                  <div className="text-2xl font-light text-[#EDEDED]">
                    {metrics ? metrics.carbon_avoided_kg.toLocaleString() : "0"} <span className="text-sm">kg</span>
                  </div>
                  <div className="text-xs text-muted mt-1">CO₂ avoided</div>
                  <div className="text-xs font-medium text-emerald mt-1">Equivalent to ~{treesPlanted.toLocaleString()} trees planted</div>
                </div>
                <div className="flex-1 mt-2 relative">
                  {renderSparkline(liveCarbon, "#10B981")}
                  <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-[10px] text-muted border-r border-white/5 pr-2 items-end">
                    <span>10k</span>
                    <span>5k</span>
                    <span>0</span>
                  </div>
                  <div className="absolute left-8 right-0 bottom-0 h-6 flex justify-between text-[10px] text-muted border-t border-white/5 pt-2 px-2">
                    {weekLabels.map((l, i) => <span key={`green-${i}`}>{l}</span>)}
                  </div>
                </div>
              </div>
              
            </div>
          </div>
      </main>
    </>
  );
}

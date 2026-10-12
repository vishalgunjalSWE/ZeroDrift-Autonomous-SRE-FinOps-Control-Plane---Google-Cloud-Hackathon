"use client";

import { useQuery } from "@tanstack/react-query";
import { DollarSign, ShieldCheck, Leaf, AlertCircle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { DriftGauge } from "./DriftGauge";

const BACKEND = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "");

interface MetricsSummary {
  total_cost_savings: number;
  total_runs: number;
  success_runs: number;
  failed_runs: number;
  merged_runs: number;
  high_risk_events: number;
  success_rate: number;
  carbon_avoided_kg: number;
  active_policies: number;
  simulation_mode: boolean;
  savings_sparkline: number[];
}

function Sparkline({ data: rawData }: { data: number[] }) {
  if (!rawData || rawData.length < 2) return null;
  
  const max = Math.max(...rawData);
  const min = Math.min(...rawData);
  const range = max - min;
  const w = 80;
  const h = 28;
  
  const points = rawData.map((v, i) => {
    const x = (i / (rawData.length - 1)) * w;
    const y = range === 0 ? h / 2 : h - ((v - min) / range) * h;
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
    <svg width={w} height={h} className="opacity-70">
      <path
        d={pathD}
        fill="none"
        stroke="#10B981"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SkeletonCard({ index = 0 }: { index?: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0.3 }}
      animate={{ opacity: [0.3, 0.7, 0.3] }}
      transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.15 }}
      className="glass-card rounded-xl p-5 border border-white/5"
    >
      <div className="h-3 w-24 bg-white/10 rounded mb-4" />
      <div className="h-8 w-32 bg-white/10 rounded mb-3" />
      <div className="h-3 w-20 bg-white/10 rounded" />
    </motion.div>
  );
}

interface KPICardProps {
  label: string;
  value: string;
  sub: string;
  trend?: "up" | "down" | "neutral";
  icon: React.ReactNode;
  accentColor: string;
  sparkline?: number[];
  sparklineLabel?: string;
}

function KPICard({ label, value, sub, trend, icon, accentColor, sparkline, sparklineLabel }: KPICardProps) {
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor =
    trend === "up" ? "text-emerald-400" : trend === "down" ? "text-amber-400" : "text-slate-400";

  return (
    <div className="zd-card p-5 border border-white/[0.08] relative overflow-hidden bg-[#11151E] hover:border-white/[0.14] transition-colors flex flex-col justify-between">
      <div>
        {/* Label */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {label}
          </span>
          <div className="w-4 h-4 text-slate-500">{icon}</div>
        </div>

        {/* Value */}
        <div className="text-3xl font-semibold tracking-tight text-slate-100 font-mono mb-2">
          {value}
        </div>
      </div>

      {/* Sub row */}
      <div className="flex items-center justify-between pt-2 border-t border-white/[0.05] mt-2">
        <div className={`flex items-center space-x-1.5 text-xs font-medium ${trendColor}`}>
          <TrendIcon className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{sub}</span>
        </div>
        {sparkline && (
          <div className="flex items-center gap-1.5 shrink-0">
            {sparklineLabel && (
              <span className="text-[9px] font-mono text-slate-500 tracking-wider uppercase">
                {sparklineLabel}
              </span>
            )}
            <Sparkline data={sparkline} />
          </div>
        )}
      </div>
    </div>
  );
}

export function FinOpsSummaryMetrics() {
  const { data, isLoading, isError } = useQuery<MetricsSummary>({
    queryKey: ["metrics-summary"],
    queryFn: () =>
      fetch(`${BACKEND}/api/v1/metrics/summary`).then((r) => {
        if (!r.ok) throw new Error("metrics fetch failed");
        return r.json();
      }),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6 mb-8">
        {[...Array(5)].map((_, i) => <SkeletonCard key={i} index={i} />)}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6 mb-8">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="glass-card rounded-xl p-5 border border-infrared/20 text-muted text-sm flex items-center justify-center">
            Backend offline
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
      }}
      className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-4 mb-8"
    >
      {/* KPI 1: Projected monthly savings */}
      <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
        <KPICard
          label="Projected monthly savings"
          value={`$${data.total_cost_savings.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          sub="+46.4% vs 30d baseline"
          trend="up"
          icon={<DollarSign className="w-full h-full" />}
          accentColor="text-azure"
          sparkline={data.savings_sparkline}
          sparklineLabel="Demo baseline"
        />
      </motion.div>

      {/* KPI 2: Simulated Remediations */}
      <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
        <KPICard
          label="Simulated Remediations"
          value={`${data.success_runs} / ${data.total_runs}`}
          sub={`${data.merged_runs} simulated patches merged`}
          trend="up"
          icon={<ShieldCheck className="w-full h-full" />}
          accentColor="text-violet"
        />
      </motion.div>

      {/* KPI 3: GreenOps Impact */}
      <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
        <KPICard
          label="GreenOps — CO₂ Avoided"
          value={`${data.carbon_avoided_kg.toLocaleString("en-US", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })} kg`}
          sub={`~${Math.round(data.carbon_avoided_kg / 4.54).toLocaleString()} trees equivalent`}
          trend="up"
          icon={<Leaf className="w-full h-full" />}
          accentColor="text-emerald"
        />
      </motion.div>

      {/* KPI 4: High-Risk Anomalies */}
      <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
        <KPICard
          label="High-Risk Anomalies"
          value={`${data.high_risk_events}`}
          sub={data.high_risk_events === 0 ? "0 high blast-radius risks" : `${data.high_risk_events} quarantined for review`}
          trend={data.high_risk_events === 0 ? "neutral" : "down"}
          icon={<AlertCircle className="w-full h-full" />}
          accentColor="text-amber"
        />
      </motion.div>

      {/* KPI 5: Infrastructure Drift Index (Gauge) */}
      <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
        <DriftGauge />
      </motion.div>
    </motion.div>
  );
}

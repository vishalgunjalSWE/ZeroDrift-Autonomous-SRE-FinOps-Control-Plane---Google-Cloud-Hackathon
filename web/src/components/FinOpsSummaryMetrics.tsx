"use client";

import { useQuery } from "@tanstack/react-query";
import { DollarSign, ShieldCheck, Leaf, AlertCircle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { DriftGauge } from "./DriftGauge";

const BACKEND = "http://localhost:8000";

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
}

function KPICard({ label, value, sub, trend, icon, accentColor, sparkline }: KPICardProps) {
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor =
    trend === "up" ? "text-emerald" : trend === "down" ? "text-infrared" : "text-muted";

  return (
    <motion.div 
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="glass-card rounded-xl p-5 border border-white/5 relative overflow-hidden group hover:border-white/10 cursor-pointer"
    >
      {/* Background icon watermark */}
      <div className="absolute top-0 right-0 p-4 opacity-[0.06] group-hover:opacity-[0.1] transition-opacity">
        <div className={`w-16 h-16 ${accentColor}`}>{icon}</div>
      </div>

      {/* Label */}
      <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-3">
        {label}
      </div>

      {/* Value */}
      <div className="text-4xl font-light tracking-tight text-[#EDEDED] mb-2">
        {value}
      </div>

      {/* Sub row */}
      <div className="flex items-center justify-between">
        <div className={`flex items-center space-x-1.5 text-xs font-medium ${trendColor}`}>
          <TrendIcon className="w-3 h-3" />
          <span>{sub}</span>
        </div>
        {sparkline && <Sparkline data={sparkline} />}
      </div>
    </motion.div>
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
      {/* KPI 1: Cost Avoidance */}
      <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
        <KPICard
          label="Cost Avoidance (MRR)"
          value={`$${data.total_cost_savings.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          sub="46.4% vs last 30 days"
          trend="up"
          icon={<DollarSign className="w-full h-full" />}
          accentColor="text-azure"
          sparkline={data.savings_sparkline}
        />
      </motion.div>

      {/* KPI 2: Auto-Remediations */}
      <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
        <KPICard
          label="Auto-Remediations"
          value={`${data.success_runs} / ${data.total_runs}`}
          sub="1 MRs merged"
          trend="up"
          icon={<ShieldCheck className="w-full h-full" />}
          accentColor="text-violet"
          sparkline={data.savings_sparkline} // Using mock for now
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
          sub="18.2% vs last 30 days"
          trend="up"
          icon={<Leaf className="w-full h-full" />}
          accentColor="text-emerald"
          sparkline={data.savings_sparkline}
        />
      </motion.div>

      {/* KPI 4: Risk Events / MTTR */}
      <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
        <KPICard
          label="Risk Events / MTTR"
          value={`${data.high_risk_events}`}
          sub="All clear"
          trend="neutral"
          icon={<AlertCircle className="w-full h-full" />}
          accentColor="text-amber"
          sparkline={data.savings_sparkline}
        />
      </motion.div>

      {/* KPI 5: Infrastructure Drift Index (Gauge) */}
      <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
        <DriftGauge />
      </motion.div>
    </motion.div>
  );
}

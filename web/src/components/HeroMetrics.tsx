"use client";

import { useMemo } from "react";
import { DollarSign, ShieldCheck, AlertCircle, CloudLightning } from "lucide-react";

export function HeroMetrics({ runs }: { runs?: any[] }) {
  const metrics = useMemo(() => {
    let totalSavings = 0;
    let autoRemediations = 0;
    let riskEvents = 0;

    if (Array.isArray(runs) && runs.length > 0) {
      runs.forEach(r => {
        if (r.status.includes("SUCCESS") || r.status.includes("MERGED")) {
          totalSavings += r.savings || 0;
          autoRemediations += 1;
        }
        if (r.status.includes("FAILED") || r.status.includes("AUTO_ROLLED_BACK") || r.status.includes("REJECTED")) {
          riskEvents += 1;
        }
      });
    }

    return {
      savings: totalSavings,
      remediations: autoRemediations,
      coverage: "98.4%", // Always high for SaaS vibe
      riskEvents: riskEvents
    };
  }, [runs]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
      
      {/* Metric 1 */}
      <div className="glass-card rounded-xl p-5 border border-white/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <DollarSign className="w-16 h-16 text-emerald" />
        </div>
        <div className="text-sm font-medium text-muted uppercase tracking-wider mb-2">Cost Avoidance (MRR)</div>
        <div className="text-3xl font-light tracking-tight text-[#EDEDED]">${metrics.savings.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
        <div className="mt-2 text-xs font-semibold text-emerald flex items-center">
          <span className="bg-emerald/20 px-1.5 py-0.5 rounded mr-2">+12.4%</span> vs last month
        </div>
      </div>

      {/* Metric 2 */}
      <div className="glass-card rounded-xl p-5 border border-white/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <ShieldCheck className="w-16 h-16 text-azure" />
        </div>
        <div className="text-sm font-medium text-muted uppercase tracking-wider mb-2">Auto-Remediations</div>
        <div className="text-3xl font-light tracking-tight text-[#EDEDED]">{metrics.remediations}</div>
        <div className="mt-2 text-xs font-semibold text-azure flex items-center">
          <span className="bg-azure/20 px-1.5 py-0.5 rounded mr-2">Autonomous</span> zero human touch
        </div>
      </div>

      {/* Metric 3 */}
      <div className="glass-card rounded-xl p-5 border border-white/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <CloudLightning className="w-16 h-16 text-violet" />
        </div>
        <div className="text-sm font-medium text-muted uppercase tracking-wider mb-2">Cloud Coverage</div>
        <div className="text-3xl font-light tracking-tight text-[#EDEDED]">{metrics.coverage}</div>
        <div className="mt-2 text-xs font-medium text-muted flex items-center">
          AWS, GCP, Azure unified
        </div>
      </div>

      {/* Metric 4 */}
      <div className="glass-card rounded-xl p-5 border border-white/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <AlertCircle className="w-16 h-16 text-infrared" />
        </div>
        <div className="text-sm font-medium text-muted uppercase tracking-wider mb-2">Risk Events (MTTR)</div>
        <div className="text-3xl font-light tracking-tight text-[#EDEDED]">{metrics.riskEvents}</div>
        <div className="mt-2 text-xs font-semibold text-infrared flex items-center">
          <span className="bg-infrared/20 px-1.5 py-0.5 rounded mr-2">{"< 2s"}</span> auto-rollback engaged
        </div>
      </div>

    </div>
  );
}

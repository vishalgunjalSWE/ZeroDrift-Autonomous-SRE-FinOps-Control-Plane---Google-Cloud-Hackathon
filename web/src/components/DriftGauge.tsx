"use client";

import { useQuery } from "@tanstack/react-query";
import { useGlobalDrift } from "@/hooks/useApi";
import dynamic from "next/dynamic";
import { Loader2, AlertTriangle, ShieldCheck } from "lucide-react";

// react-gauge-component might not be SSR compatible, so we load it dynamically
const GaugeComponent = dynamic(() => import("react-gauge-component"), { ssr: false });

const BACKEND = "http://localhost:8000";

export function DriftGauge() {
  const { data: driftData, isLoading, isError } = useGlobalDrift();

  if (isLoading) {
    return (
      <div className="glass-card rounded-xl p-5 border border-white/5 flex flex-col items-center justify-center animate-pulse h-full min-h-[140px]">
        <Loader2 className="w-6 h-6 animate-spin text-muted" />
      </div>
    );
  }

  if (isError || !driftData) {
    return (
      <div className="glass-card rounded-xl p-5 border border-white/5 flex flex-col items-center justify-center text-muted text-sm h-full min-h-[140px]">
        Unable to fetch Drift
      </div>
    );
  }

  const drift = driftData.drift_percentage;
  const isHealthy = drift <= 5.0;

  return (
    <div className="glass-card rounded-xl p-5 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all duration-300 h-full flex flex-col items-center justify-center">
      <div className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 text-center w-full">
        Infrastructure Drift Index
      </div>

      <div className="w-full max-w-[200px] mt-2 relative">
        <GaugeComponent
          type="semicircle"
          arc={{
            width: 0.15,
            padding: 0.02,
            cornerRadius: 1,
            subArcs: [
              { limit: 2, color: '#10B981', showTick: true },   // < 2% (Emerald)
              { limit: 5, color: '#F59E0B', showTick: true },   // 2 - 5% (Amber)
              { limit: 15, color: '#EF4444', showTick: true },  // 5 - 15% (Infrared)
            ]
          }}
          pointer={{
            type: "blob",
            animationDelay: 0,
            animationDuration: 1500,
            color: '#FFFFFF'
          }}
          value={drift}
          labels={{
            valueLabel: {
              formatTextValue: (val) => val + '%',
              style: { fill: '#FFFFFF', textShadow: 'none', fontSize: '32px' }
            },
            tickLabels: {
              type: "outer",
              ticks: [
                { value: 5 } // The 5% threshold
              ],
              defaultTickValueConfig: {
                formatTextValue: (val) => val + '%',
                style: { fontSize: 10, fill: '#888888', textShadow: 'none' }
              }
            }
          }}
        />
      </div>

      <div className="mt-2 flex items-center justify-center w-full">
        {isHealthy ? (
          <div className="flex items-center space-x-1.5 text-xs font-medium text-emerald bg-emerald/10 px-2 py-0.5 rounded border border-emerald/20">
            <ShieldCheck className="w-3 h-3" />
            <span>Healthy</span>
          </div>
        ) : (
          <div className="flex items-center space-x-1.5 text-xs font-medium text-infrared bg-infrared/10 px-2 py-0.5 rounded border border-infrared/20">
            <AlertTriangle className="w-3 h-3" />
            <span>Action Required</span>
          </div>
        )}
      </div>
    </div>
  );
}

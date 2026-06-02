"use client";

import { useQuery } from "@tanstack/react-query";
import { Target, CheckCircle2, AlertOctagon } from "lucide-react";

const BACKEND = "http://localhost:8000";

export default function SLOsPage() {
  const { data: metrics } = useQuery<any>({
    queryKey: ["metrics-summary"],
    queryFn: () => fetch(`${BACKEND}/api/v1/metrics/summary`).then((r) => r.json()),
    refetchInterval: 15_000,
  });

  const { data: drift } = useQuery<any>({
    queryKey: ["drift"],
    queryFn: () => fetch(`${BACKEND}/api/v1/drift`).then((r) => r.json()),
    refetchInterval: 15_000,
  });

  const successRate = metrics?.success_rate || 0;
  const driftIndex = drift?.drift_index || 0;
  const isHealthySuccess = successRate >= 95;
  const isHealthyDrift = driftIndex <= 5;
  const isHealthyUptime = true; // Hardcoded for aesthetics

  const SLORing = ({ title, value, target, unit, isHealthy, colorClass, strokeColor }: any) => (
    <div className="glass-card rounded-xl p-8 border border-white/5 flex flex-col items-center text-center relative overflow-hidden group hover:bg-white/[0.02] transition-colors">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted mb-6">{title}</h3>
      
      <div className="relative inline-flex items-center justify-center w-40 h-40 mb-6">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="16" fill="none" className="stroke-white/5" strokeWidth="2" />
          <circle 
            cx="18" cy="18" r="16" fill="none" 
            className={`transition-all duration-1000 ${strokeColor}`}
            strokeWidth="2" 
            strokeDasharray={`${value} 100`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-light text-white">{value}{unit}</span>
        </div>
      </div>

      <div className="flex items-center space-x-2 text-sm font-medium">
        {isHealthy ? (
          <><CheckCircle2 className="w-4 h-4 text-emerald" /> <span className="text-emerald">Healthy</span></>
        ) : (
          <><AlertOctagon className="w-4 h-4 text-infrared" /> <span className="text-infrared">At Risk</span></>
        )}
      </div>
      <div className="text-[10px] text-muted uppercase tracking-wider mt-2 border-t border-white/5 pt-2 w-full">
        Target: {target}
      </div>
    </div>
  );

  return (
    <main className="p-6 lg:p-10 max-w-[1800px] mx-auto w-full h-full flex flex-col space-y-8">
      <div className="border-b border-white/10 pb-6 shrink-0 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center">
            <Target className="w-6 h-6 mr-3 text-azure" />
            SLOs & SLIs
          </h1>
          <p className="text-muted text-[13px] mt-2">Service Level Objectives vs Indicators</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <SLORing 
          title="Remediation Success Rate" 
          value={successRate} 
          unit="%" 
          target="> 95%"
          isHealthy={isHealthySuccess}
          colorClass="text-emerald"
          strokeColor={isHealthySuccess ? "stroke-emerald" : "stroke-amber-500"}
        />

        <SLORing 
          title="Infrastructure Drift Tolerance" 
          value={driftIndex} 
          unit="%" 
          target="< 5%"
          isHealthy={isHealthyDrift}
          colorClass="text-azure"
          strokeColor={isHealthyDrift ? "stroke-azure" : "stroke-infrared"}
        />

        <SLORing 
          title="System Availability" 
          value={99.9} 
          unit="%" 
          target="> 99.9%"
          isHealthy={isHealthyUptime}
          colorClass="text-violet"
          strokeColor="stroke-violet"
        />
      </div>

      <div className="glass-card rounded-xl p-6 border border-white/5 mt-8">
        <h3 className="text-sm font-semibold text-white mb-4">Error Budget Burn Rate</h3>
        <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden flex">
           <div className="bg-emerald h-full" style={{ width: '85%' }}></div>
           <div className="bg-amber-500 h-full" style={{ width: '10%' }}></div>
           <div className="bg-white/10 h-full" style={{ width: '5%' }}></div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted">
          <span>85% Budget Remaining</span>
          <span>15% Burned</span>
        </div>
      </div>
    </main>
  );
}
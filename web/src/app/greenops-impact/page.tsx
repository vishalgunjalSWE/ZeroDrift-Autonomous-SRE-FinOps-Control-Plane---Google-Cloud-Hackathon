"use client";

import { useQuery } from "@tanstack/react-query";
import { Leaf, Wind, TreePine, Droplets, Loader2, Sparkles } from "lucide-react";

const BACKEND = "http://localhost:8000";

export default function GreenOpsImpactPage() {
  const { data: metrics, isLoading } = useQuery<any>({
    queryKey: ["metrics-summary"],
    queryFn: () => fetch(`${BACKEND}/api/v1/metrics/summary`).then((r) => r.json()),
    refetchInterval: 15_000,
  });

  const carbonAvoidedKg = metrics?.carbon_avoided_kg || 0;
  
  // Equivalencies (mock conversions for visualization)
  const treesPlanted = Math.floor(carbonAvoidedKg / 21); // Assuming 1 tree absorbs 21kg CO2/year
  const gallonsGasoline = (carbonAvoidedKg / 8.88).toFixed(1); // 8.88 kg CO2 per gallon
  const milesDriven = Math.floor(carbonAvoidedKg / 0.4); // ~0.4 kg CO2 per mile

  return (
    <main className="p-6 lg:p-10 max-w-[1800px] mx-auto w-full h-full flex flex-col space-y-8">
      <div className="border-b border-white/10 pb-6 shrink-0">
        <h1 className="text-2xl font-bold text-white flex items-center">
          <Leaf className="w-6 h-6 mr-3 text-emerald" />
          GreenOps Impact
        </h1>
        <p className="text-muted text-[13px] mt-2">Environmental impact and carbon emission reduction metrics</p>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center text-emerald">
          <Loader2 className="w-6 h-6 animate-spin mr-3" /> Calculating carbon offset...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {/* Main Hero Metric */}
          <div className="glass-card rounded-2xl p-10 border border-emerald/20 bg-emerald/[0.02] relative overflow-hidden flex flex-col items-center justify-center text-center shadow-[0_0_50px_rgba(16,185,129,0.05)]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald/0 via-emerald to-emerald/0" />
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald/10 rounded-full blur-[100px] pointer-events-none" />
            
            <Leaf className="w-16 h-16 text-emerald mb-6 opacity-80" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-emerald mb-2 flex items-center">
              <Sparkles className="w-4 h-4 mr-2" /> Total Carbon Avoided
            </h2>
            <div className="text-7xl font-light text-white tracking-tight mb-4">
              {carbonAvoidedKg.toLocaleString()} <span className="text-2xl text-muted font-normal">kg CO₂e</span>
            </div>
            <p className="text-muted max-w-lg text-sm leading-relaxed">
              By automatically right-sizing infrastructure and eliminating idle waste, ZeroDrift directly reduces datacenter power consumption and Scope 3 emissions.
            </p>
          </div>

          {/* Equivalency Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card rounded-xl p-6 border border-white/5 flex flex-col items-center text-center hover:bg-white/[0.02] transition-colors group">
              <div className="w-12 h-12 rounded-full bg-emerald/10 flex items-center justify-center mb-4 group-hover:bg-emerald/20 transition-colors">
                <TreePine className="w-6 h-6 text-emerald" />
              </div>
              <div className="text-3xl font-light text-white mb-1">{treesPlanted.toLocaleString()}</div>
              <div className="text-xs text-muted font-semibold uppercase tracking-wider">Trees Planted Equivalency</div>
              <p className="text-[10px] text-muted mt-2 opacity-60">Seedlings grown for 10 years</p>
            </div>

            <div className="glass-card rounded-xl p-6 border border-white/5 flex flex-col items-center text-center hover:bg-white/[0.02] transition-colors group">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-4 group-hover:bg-amber-500/20 transition-colors">
                <Droplets className="w-6 h-6 text-amber-500" />
              </div>
              <div className="text-3xl font-light text-white mb-1">{gallonsGasoline}</div>
              <div className="text-xs text-muted font-semibold uppercase tracking-wider">Gallons of Gasoline</div>
              <p className="text-[10px] text-muted mt-2 opacity-60">Consumed equivalent avoided</p>
            </div>

            <div className="glass-card rounded-xl p-6 border border-white/5 flex flex-col items-center text-center hover:bg-white/[0.02] transition-colors group">
              <div className="w-12 h-12 rounded-full bg-azure/10 flex items-center justify-center mb-4 group-hover:bg-azure/20 transition-colors">
                <Wind className="w-6 h-6 text-azure" />
              </div>
              <div className="text-3xl font-light text-white mb-1">{milesDriven.toLocaleString()}</div>
              <div className="text-xs text-muted font-semibold uppercase tracking-wider">Miles Driven</div>
              <p className="text-[10px] text-muted mt-2 opacity-60">By an average passenger vehicle</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
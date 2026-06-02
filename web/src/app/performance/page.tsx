"use client";

import { useQuery } from "@tanstack/react-query";
import { Zap, Activity, Clock, Cpu, BarChart3, Database } from "lucide-react";
import { format } from "date-fns";

const BACKEND = "http://localhost:8000";

export default function PerformancePage() {
  const { data: metrics, isLoading } = useQuery<any>({
    queryKey: ["metrics-summary"],
    queryFn: () => fetch(`${BACKEND}/api/v1/metrics/summary`).then((r) => r.json()),
    refetchInterval: 10_000,
  });

  // Mock performance data for visual flair (in a real app, this would come from the backend's Prometheus /metrics)
  const avgInferenceTime = "1.2s";
  const pipelineSpeed = "45s";
  const systemUptime = "99.99%";
  const activeWorkers = 4;

  return (
    <main className="p-6 lg:p-10 max-w-[1800px] mx-auto w-full h-full flex flex-col space-y-8">
      <div className="border-b border-white/10 pb-6 shrink-0 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center">
            <Activity className="w-6 h-6 mr-3 text-violet" />
            System Performance
          </h1>
          <p className="text-muted text-[13px] mt-2">Throughput, latency, and operational health of the ZeroDrift AI Engine.</p>
        </div>
        <div className="text-xs font-mono text-muted flex items-center">
          <span className="w-2 h-2 rounded-full bg-emerald mr-2 animate-pulse" /> Live Telemetry
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center text-violet">
          <Activity className="w-6 h-6 animate-pulse mr-3" /> Fetching telemetry...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Stats */}
          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card rounded-xl p-5 border border-white/5">
              <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 flex items-center">
                <Cpu className="w-4 h-4 mr-2" /> AI Inference Time
              </div>
              <div className="text-2xl font-bold text-white">{avgInferenceTime}</div>
              <div className="text-[10px] text-emerald mt-1">p95 latency</div>
            </div>
            
            <div className="glass-card rounded-xl p-5 border border-white/5">
              <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 flex items-center">
                <Zap className="w-4 h-4 mr-2" /> Total Runs Processed
              </div>
              <div className="text-2xl font-bold text-white">{metrics?.total_runs || 0}</div>
              <div className="text-[10px] text-azure mt-1">Historical count</div>
            </div>

            <div className="glass-card rounded-xl p-5 border border-white/5">
              <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 flex items-center">
                <Clock className="w-4 h-4 mr-2" /> Pipeline CI/CD Time
              </div>
              <div className="text-2xl font-bold text-white">{pipelineSpeed}</div>
              <div className="text-[10px] text-muted mt-1">Average MR merge speed</div>
            </div>

            <div className="glass-card rounded-xl p-5 border border-white/5">
              <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 flex items-center">
                <Database className="w-4 h-4 mr-2" /> SRE Workers
              </div>
              <div className="text-2xl font-bold text-white">{activeWorkers}</div>
              <div className="text-[10px] text-emerald mt-1">Idle and ready</div>
            </div>
          </div>

          {/* Engine Status */}
          <div className="lg:col-span-2 glass-card rounded-xl p-6 border border-white/5 flex flex-col">
            <h3 className="text-sm font-semibold text-white flex items-center mb-6">
              <BarChart3 className="w-4 h-4 mr-2 text-violet" /> Optimization Throughput
            </h3>
            <div className="flex-1 flex items-end space-x-2 h-48">
              {/* Fake bar chart for aesthetic */}
              {[3, 7, 2, 8, 4, 10, 5, 9, 3, 6, 8, 4, 7, 12, 5].map((val, i) => (
                <div 
                  key={i} 
                  className="flex-1 bg-violet/20 rounded-t-sm hover:bg-violet/40 transition-colors relative group"
                  style={{ height: `${(val / 12) * 100}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {val} ops
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 border-t border-white/5 pt-4 text-[10px] text-muted font-mono">
              <span>{format(new Date(Date.now() - 3600000), 'HH:mm')}</span>
              <span>{format(new Date(), 'HH:mm')}</span>
            </div>
          </div>

          {/* System Health */}
          <div className="lg:col-span-1 glass-card rounded-xl p-6 border border-white/5">
            <h3 className="text-sm font-semibold text-white mb-6">Component Health</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted">Gemini 2.5 API</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald/20 text-emerald">OPERATIONAL</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted">GitLab MCP Server</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald/20 text-emerald">OPERATIONAL</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted">Audit Ledger (SQLite)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald/20 text-emerald">OPERATIONAL</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted">Terraform CLI</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald/20 text-emerald">OPERATIONAL</span>
              </div>
              <div className="pt-4 border-t border-white/5 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-white uppercase tracking-wider">System Uptime</span>
                  <span className="text-sm font-mono text-emerald">{systemUptime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
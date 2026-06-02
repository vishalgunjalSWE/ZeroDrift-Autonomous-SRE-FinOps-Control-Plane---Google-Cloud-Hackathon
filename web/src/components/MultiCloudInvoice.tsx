"use client";

import { useQuery } from "@tanstack/react-query";
import { Cloud, Server, Loader2, Database } from "lucide-react";

const BACKEND = "http://localhost:8000";

interface CloudInvoice {
  aws: number;
  gcp: number;
  azure: number;
  total: number;
  simulation_mode: boolean;
}

function CloudRow({
  name, region, savings, color, icon, bar,
}: {
  name: string; region: string; savings: number; color: string; icon: React.ReactNode; bar: number;
}) {
  return (
    <div className="p-4 bg-white/5 rounded-lg border border-white/5 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
            <div style={{ color }}>{icon}</div>
          </div>
          <div>
            <div className="text-sm font-semibold">{name}</div>
            <div className="text-[10px] text-muted uppercase">{region}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-emerald">+${savings.toFixed(2)}</div>
          <div className="text-[10px] text-muted uppercase">Recovered</div>
        </div>
      </div>
      {/* Real proportional bar */}
      <div className="h-1 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${Math.min(bar * 100, 100)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function MultiCloudInvoice() {
  const { data, isLoading, isError } = useQuery<CloudInvoice>({
    queryKey: ["cloud-invoice"],
    queryFn: () => fetch(`${BACKEND}/api/v1/cloud-invoice`).then((r) => r.json()),
    refetchInterval: 15_000,
  });

  const total = data?.total ?? 0;
  const aws = data?.aws ?? 0;
  const gcp = data?.gcp ?? 0;
  const azure = data?.azure ?? 0;

  return (
    <div className="glass-card rounded-xl border border-white/5 p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-semibold tracking-wide uppercase text-muted">Multi-Cloud FinOps Invoice</h3>
        <div className="flex items-center space-x-2">
          {data?.simulation_mode && (
            <span className="px-2 py-0.5 bg-amber/10 border border-amber/20 text-amber text-[10px] font-bold rounded uppercase">
              Sim Mode
            </span>
          )}
          <div className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-muted">REAL-TIME</div>
        </div>
      </div>

      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-azure" />
        </div>
      )}

      {isError && (
        <div className="flex-1 flex items-center justify-center text-xs text-muted">
          Failed to load invoice data
        </div>
      )}

      {!isLoading && !isError && (
        <div className="flex-1 flex flex-col space-y-3">
          <CloudRow
            name="AWS (us-east-1)"
            region="Compute & Storage"
            savings={aws}
            color="#FF9900"
            icon={<Server className="w-4 h-4" />}
            bar={total > 0 ? aws / total : 0}
          />
          <CloudRow
            name="GCP (us-central1)"
            region="Compute Engine"
            savings={gcp}
            color="#4285F4"
            icon={<Cloud className="w-4 h-4" />}
            bar={total > 0 ? gcp / total : 0}
          />
          {azure > 0 && (
            <CloudRow
              name="Azure (eastus)"
              region="Virtual Machines"
              savings={azure}
              color="#0078D4"
              icon={<Database className="w-4 h-4" />}
              bar={total > 0 ? azure / total : 0}
            />
          )}

          <div className="pt-4 border-t border-white/5 flex justify-between items-center mt-auto">
            <span className="text-xs text-muted uppercase font-bold tracking-widest">Total Monthly Savings</span>
            <span className="text-lg font-light text-emerald">${total.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

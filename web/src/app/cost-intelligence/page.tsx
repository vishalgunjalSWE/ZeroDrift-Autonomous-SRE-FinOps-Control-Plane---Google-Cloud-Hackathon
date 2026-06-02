"use client";

import { useQuery } from "@tanstack/react-query";
import { CostTrajectoryChart } from "@/components/CostTrajectoryChart";
import { MultiCloudInvoice } from "@/components/MultiCloudInvoice";
import { HealthHeatmap } from "@/components/HealthHeatmap";

const BACKEND = "http://localhost:8000";

export default function CostIntelligencePage() {
  const { data: runs = [] } = useQuery<any[]>({
    queryKey: ["runs"],
    queryFn: () =>
      fetch(`${BACKEND}/api/runs`).then((r) => r.json()).catch(() => []),
  });

  return (
    <main className="p-6 lg:p-10 max-w-[1800px] mx-auto w-full h-full flex flex-col">
      <div className="mb-8 border-b border-white/10 pb-6 shrink-0">
        <h1 className="text-2xl font-bold text-white">Cost Intelligence</h1>
        <p className="text-muted text-[13px]">Advanced finops trajectory and forecasting</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ minHeight: 600 }}>
        <div className="lg:col-span-2 flex flex-col space-y-6">
          <CostTrajectoryChart runs={runs} />
          <HealthHeatmap />
        </div>
        <div className="lg:col-span-1">
          <MultiCloudInvoice />
        </div>
      </div>
    </main>
  );
}
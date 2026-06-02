"use client";

import { useQuery } from "@tanstack/react-query";
import { AIExecutionStream } from "@/components/AIExecutionStream";
import { formatDistanceToNow } from "date-fns";

const BACKEND = "http://localhost:8000";

export default function AutoRemediationsPage() {
  const { data: runs = [], isLoading } = useQuery<any[]>({
    queryKey: ["runs"],
    queryFn: () => fetch(`${BACKEND}/api/runs`).then((r) => r.json()),
    refetchInterval: 15_000,
  });

  return (
    <main className="p-6 lg:p-10 max-w-[1800px] mx-auto w-full h-full flex flex-col space-y-8">
      <div className="border-b border-white/10 pb-6 shrink-0">
        <h1 className="text-2xl font-bold text-white">Auto-Remediations</h1>
        <p className="text-muted text-[13px]">Real-time AI execution stream and remediation history</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Stream Section */}
        <section className="h-[500px]">
          <AIExecutionStream />
        </section>

        {/* History Section */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Remediation History</h2>
          <div className="glass-card rounded-xl border border-white/5 overflow-hidden">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white/[0.02] text-muted text-xs uppercase tracking-wider border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 font-medium">Run ID</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Optimization</th>
                  <th className="px-6 py-4 font-medium">Savings</th>
                  <th className="px-6 py-4 font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[#EDEDED]">
                {isLoading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted">Loading history...</td>
                  </tr>
                )}
                {runs.map((run) => (
                  <tr key={run.run_id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-mono text-azure">{run.run_id}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                        run.status === "SUCCESS" || run.status === "MERGED" || run.status === "AUTO_MERGED"
                          ? "bg-emerald/20 text-emerald"
                          : run.status === "REQUIRES_APPROVAL"
                          ? "bg-amber-500/20 text-amber-500"
                          : "bg-infrared/20 text-infrared"
                      }`}>
                        {run.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-infrared line-through opacity-70">{run.old_instance}</span>
                        <span className="text-muted text-xs">&rarr;</span>
                        <span className="text-emerald">{run.new_instance}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-emerald">
                      ${Number(run.savings).toFixed(2)}/mo
                    </td>
                    <td className="px-6 py-4 text-muted">
                      {formatDistanceToNow(new Date(run.timestamp), { addSuffix: true })}
                    </td>
                  </tr>
                ))}
                {!isLoading && runs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted">No runs found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
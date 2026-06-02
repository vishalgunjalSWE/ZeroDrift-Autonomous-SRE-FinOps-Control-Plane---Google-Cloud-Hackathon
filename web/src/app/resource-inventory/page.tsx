"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Database, Search, Filter, Loader2, AlertTriangle, ShieldCheck } from "lucide-react";

const BACKEND = "http://localhost:8000";

export default function ResourceInventoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState<"ALL" | "HIGH" | "LOW">("ALL");

  const { data: topology, isLoading } = useQuery<any>({
    queryKey: ["topology"],
    queryFn: () => fetch(`${BACKEND}/api/v1/topology`).then((r) => r.json()),
  });

  const nodes = topology?.nodes || [];

  const filteredNodes = nodes.filter((node: any) => {
    // Exclude group hubs like "Production" from the resource inventory
    if (node.id.includes("hub") || node.id === "env_dev" || node.id === "env_prod" || node.id === "env_staging") {
      return false;
    }

    const matchesSearch = node.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          node.label.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    if (riskFilter === "HIGH" && node.risk !== "High") return false;
    if (riskFilter === "LOW" && node.risk === "High") return false;

    return true;
  });

  return (
    <main className="p-6 lg:p-10 max-w-[1800px] mx-auto w-full h-full flex flex-col space-y-8">
      <div className="border-b border-white/10 pb-6 shrink-0 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center">
            <Database className="w-6 h-6 mr-3 text-azure" />
            Resource Inventory
          </h1>
          <p className="text-muted text-[13px] mt-2">Tabular ledger of all tracked cloud resources and their financial footprint.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input 
            type="text" 
            placeholder="Search by resource ID or type..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/[0.02] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-azure transition-colors"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-muted" />
          <select 
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value as any)}
            className="bg-white/[0.02] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-azure transition-colors appearance-none"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="HIGH">High Risk Only</option>
            <option value="LOW">Optimized Only</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center text-azure">
          <Loader2 className="w-6 h-6 animate-spin mr-3" /> Fetching latest CMDB records...
        </div>
      ) : (
        <div className="glass-card rounded-xl border border-white/5 overflow-hidden flex-1">
          <div className="overflow-x-auto h-full max-h-[800px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5 text-xs font-semibold uppercase tracking-wider text-muted sticky top-0 backdrop-blur-md z-10">
                  <th className="px-6 py-4">Resource Identifier</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Status / Risk</th>
                  <th className="px-6 py-4 text-right">Monthly Spend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredNodes.length > 0 ? (
                  filteredNodes.map((node: any) => (
                    <tr key={node.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-mono text-sm text-azure">{node.id}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#EDEDED]">{node.type || "Compute"}</td>
                      <td className="px-6 py-4">
                        {node.risk === "High" ? (
                          <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold bg-infrared/20 text-infrared border border-infrared/30 uppercase tracking-widest">
                            <AlertTriangle className="w-3 h-3 mr-1" /> Over-Provisioned
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold bg-emerald/20 text-emerald border border-emerald/30 uppercase tracking-widest">
                            <ShieldCheck className="w-3 h-3 mr-1" /> Right-Sized
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-sm text-white">
                        ${node.cost?.toFixed(2) || "0.00"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted">
                      No resources match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
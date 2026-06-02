"use client";

import { 
  Terminal, ShieldAlert, Activity, Shield, CheckSquare, 
  Leaf, DollarSign, Zap, LayoutDashboard, FileText,
  FolderTree, Network, Database, Boxes,
  Users, Settings, ScrollText, BookOpenText
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

const BACKEND = "http://localhost:8000";

export function LeftSidebar() {
  const pathname = usePathname();

  const { data: metrics } = useQuery<any>({
    queryKey: ["metrics-summary"],
    queryFn: () => fetch(`${BACKEND}/api/v1/metrics/summary`).then((r) => r.json()).catch(() => null),
  });

  const { data: runs = [] } = useQuery<any[]>({
    queryKey: ["runs"],
    queryFn: () => fetch(`${BACKEND}/api/runs`).then((r) => r.json()).catch(() => []),
  });

  const pendingCount = runs.filter((r) => r.status === "pending_approval").length;

  const groups = [
    {
      title: "OPERATIONS",
      items: [
        { label: "Auto-Remediations", href: "/auto-remediations", icon: <Terminal className="w-4 h-4" />, count: metrics?.success_runs ?? 0 },
        { label: "Risk & Events", href: "/risk-events", icon: <ShieldAlert className="w-4 h-4" />, count: metrics?.high_risk_events ?? 0 },
        { label: "Infrastructure Drift", href: "/infrastructure-drift", icon: <Activity className="w-4 h-4" /> },
        { label: "Policy Guardrails", href: "/policy-guardrails", icon: <Shield className="w-4 h-4" /> },
        { label: "Approvals", href: "/approvals", icon: <CheckSquare className="w-4 h-4" />, count: pendingCount },
      ]
    },
    {
      title: "OBSERVABILITY",
      items: [
        { label: "GreenOps Impact", href: "/greenops-impact", icon: <Leaf className="w-4 h-4 text-emerald" /> },
        { label: "Cost Intelligence", href: "/cost-intelligence", icon: <DollarSign className="w-4 h-4" /> },
        { label: "Performance", href: "/performance", icon: <Zap className="w-4 h-4" /> },
        { label: "SLOs & SLIs", href: "/slos-slis", icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: "Incidents", href: "/incidents", icon: <FileText className="w-4 h-4" /> },
      ]
    },
    {
      title: "ENGINEERING",
      items: [
        { label: "IaC Explorer", href: "/iac-explorer", icon: <FolderTree className="w-4 h-4" /> },
        { label: "Topology Map", href: "/topology-map", icon: <Network className="w-4 h-4" /> },
        { label: "Resource Inventory", href: "/resource-inventory", icon: <Database className="w-4 h-4" /> },
        { label: "Integrations", href: "/integrations", icon: <Boxes className="w-4 h-4" /> },
      ]
    },
    {
      title: "ADMIN",
      items: [
        { label: "Teams", href: "/teams", icon: <Users className="w-4 h-4" /> },
        { label: "Settings", href: "/settings", icon: <Settings className="w-4 h-4" /> },
        { label: "Audit Logs", href: "/audit-logs", icon: <ScrollText className="w-4 h-4" /> },
        { label: "Manifesto", href: "/manifesto", icon: <BookOpenText className="w-4 h-4 text-azure" /> },
      ]
    }
  ];

  const isCommandCenter = pathname === "/";

  return (
    <aside className="w-[260px] h-full bg-[#0A0A0B] border-r border-white/5 flex flex-col shrink-0">
      
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-white/5 shrink-0">
        <div className="flex items-center space-x-2 text-[#EDEDED]">
          <div className="w-6 h-6 bg-azure rounded flex items-center justify-center font-bold text-xs text-white">Z</div>
          <span className="font-semibold text-base tracking-tight">ZeroDrift</span>
        </div>
      </div>

      {/* Main Nav Button */}
      <div className="p-4 shrink-0">
        <Link href="/">
          <button className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg border font-medium text-sm transition-colors ${
            isCommandCenter ? "bg-azure/10 text-azure border-azure/20" : "bg-transparent text-muted border-transparent hover:bg-white/5 hover:text-[#EDEDED]"
          }`}>
            <LayoutDashboard className="w-4 h-4" />
            <span>Command Center</span>
          </button>
        </Link>
      </div>

      {/* Scrollable Nav */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-6">
        {groups.map((group, i) => (
          <div key={i}>
            <div className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 px-3">
              {group.title}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item, j) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={j}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-1.5 rounded-md text-sm transition-colors group ${
                      isActive ? "bg-azure/10 text-azure font-medium" : "text-muted hover:text-[#EDEDED] hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`opacity-70 group-hover:opacity-100 ${isActive ? "text-azure opacity-100" : ""}`}>{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    {item.count !== undefined && (
                      <span className={`text-xs px-1.5 py-0.5 rounded min-w-[20px] text-center ${
                        isActive ? "bg-azure/20 text-azure font-bold" : "bg-white/10 text-[#EDEDED]"
                      }`}>
                        {item.count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Profile */}
      <div className="p-4 border-t border-white/5 shrink-0">
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-md bg-violet/20 flex items-center justify-center text-violet">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#EDEDED]">ZeroDrift Enterprise</div>
              <div className="text-[10px] text-muted">v2.0.0</div>
            </div>
          </div>
          <div className="w-4 h-4 text-muted">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
          </div>
        </div>
      </div>

    </aside>
  );
}

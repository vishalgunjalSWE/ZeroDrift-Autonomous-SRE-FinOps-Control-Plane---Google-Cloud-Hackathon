"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2, ServerCrash } from "lucide-react";

const BACKEND = "http://localhost:8000";

interface TopoNode {
  id: string;
  label: string;
  type: string;
  provider: string;
  config: string;
  state: "healthy" | "optimized" | "drifted" | string;
  old_config: string;
  new_config: string;
  monthly_savings: number;
}

interface TopologyData {
  nodes: TopoNode[];
  provider_hubs: string[];
  last_run_id: string | null;
  last_run_status: string;
}

const PROVIDER_COLORS: Record<string, string> = {
  aws: "#FF9900",
  google: "#4285F4",
  azure: "#0078D4",
  unknown: "#888888",
};

const STATE_COLORS: Record<string, string> = {
  optimized: "#10B981",
  healthy: "#10B981",
  drifted: "#FEBC2E",
  waste: "#FF5F57",
};

function ProviderHub({ name, x, y }: { name: string; x: number; y: number }) {
  const color = PROVIDER_COLORS[name] || "#888";
  return (
    <g transform={`translate(${x}, ${y})`}>
      <circle r="18" fill="#111" stroke={color} strokeWidth="2" />
      <text x="0" y="4" fill={color} fontSize="9" textAnchor="middle" fontFamily="Inter" fontWeight="bold">
        {name.toUpperCase()}
      </text>
      <text x="0" y="32" fill="#666" fontSize="8" textAnchor="middle" fontFamily="Inter">
        Environment
      </text>
    </g>
  );
}

function ResourceNode({ node, x, y }: { node: TopoNode; x: number; y: number }) {
  const isOptimized = node.state === "optimized";
  const isDrifted = node.state === "drifted";
  const color = isOptimized ? STATE_COLORS.optimized : isDrifted ? STATE_COLORS.drifted : STATE_COLORS.waste;
  const displayConfig = isOptimized && node.new_config ? node.new_config : node.config;

  return (
    <g transform={`translate(${x}, ${y})`}>
      {isDrifted && (
        <motion.circle
          r="34" fill="none" stroke={color} strokeWidth="2" opacity="0.4"
          animate={{ r: [34, 42, 34], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
      {isOptimized ? (
        <circle r="26" fill="#111" stroke={color} strokeWidth="2" />
      ) : (
        <motion.circle
          r="26" fill="#111" stroke={color} strokeWidth="2"
          animate={{ opacity: [1, 0.6, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={isDrifted ? { filter: `drop-shadow(0 0 10px ${color})` } : {}}
        />
      )}
      <text x="0" y="-6" fill={color} fontSize="9" textAnchor="middle" fontFamily="Roboto Mono" fontWeight="bold">
        {displayConfig || node.type.split("_").pop()}
      </text>
      <text x="0" y="6" fill="#666" fontSize="7.5" textAnchor="middle" fontFamily="Inter">
        {node.label.length > 12 ? node.label.substring(0, 11) + "…" : node.label}
      </text>
      <text x="0" y="16" fill={color} fontSize="7" textAnchor="middle" fontFamily="Inter">
        {isOptimized ? `▲ $${node.monthly_savings?.toFixed(0)}/mo` : node.state.toUpperCase()}
      </text>
      <text x="0" y="42" fill="#555" fontSize="7" textAnchor="middle" fontFamily="Inter">
        {node.type}
      </text>
    </g>
  );
}

export function TopologyGraph() {
  const { data, isLoading, isError } = useQuery<TopologyData>({
    queryKey: ["topology"],
    queryFn: () => fetch(`${BACKEND}/api/v1/topology`).then((r) => r.json()),
    refetchInterval: 20_000,
  });

  // Layout: environments on left, resources spread on right
  const nodes = data?.nodes ?? [];
  const environments = Array.from(new Set(nodes.map(n => (n as any).environment || "unknown")));

  // Fixed layout positions
  const envPositions: Record<string, { x: number; y: number }> = {};
  environments.forEach((env, i) => {
    envPositions[env] = { x: 80, y: 80 + i * 100 };
  });

  // Assign resource positions in a grid
  const resourcePositions: Record<string, { x: number; y: number }> = {};
  const nodesByEnv: Record<string, TopoNode[]> = {};
  nodes.forEach((n) => {
    const env = (n as any).environment || "unknown";
    if (!nodesByEnv[env]) nodesByEnv[env] = [];
    nodesByEnv[env].push(n);
  });

  Object.entries(nodesByEnv).forEach(([env, envNodes]) => {
    const ePos = envPositions[env] || { x: 80, y: 150 };
    envNodes.forEach((n, i) => {
      resourcePositions[n.id] = {
        x: 240 + i * 120,
        y: ePos.y,
      };
    });
  });

  const svgH = Math.max(300, environments.length * 120);

  return (
    <div className="glass-card rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold tracking-wide flex items-center">
          <span className="w-2 h-2 rounded-full bg-azure mr-2 animate-pulse" />
          Infrastructure Topology
        </h3>
        <div className="flex items-center space-x-2">
          {data?.last_run_status && (
            <span className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase tracking-wide ${
              data.last_run_status.includes("SUCCESS") || data.last_run_status.includes("MERGED")
                ? "bg-emerald/10 border-emerald/20 text-emerald"
                : data.last_run_status === "NEVER_RUN"
                ? "bg-white/5 border-white/10 text-muted"
                : "bg-infrared/10 border-infrared/20 text-infrared"
            }`}>
              {data.last_run_status}
            </span>
          )}
          <div className="text-[10px] text-muted uppercase tracking-wider font-semibold px-2 py-1 bg-white/5 rounded">
            Live Drift Sync
          </div>
        </div>
      </div>

      <div className="flex-1 relative border border-white/5 rounded-lg bg-[#0A0A0A]/50 overflow-hidden flex items-center justify-center">
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }}
        />

        {isLoading && (
          <div className="flex flex-col items-center space-y-3 text-muted">
            <Loader2 className="w-6 h-6 animate-spin text-azure" />
            <span className="text-xs">Parsing main.tf...</span>
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center space-y-3 text-muted">
            <ServerCrash className="w-8 h-8 text-infrared" />
            <span className="text-xs">Cannot reach backend topology API</span>
          </div>
        )}

        {!isLoading && !isError && nodes.length === 0 && (
          <p className="text-xs text-muted">No resources found in main.tf</p>
        )}

        {!isLoading && !isError && nodes.length > 0 && (
          <svg
            viewBox={`0 0 ${Math.max(500, 240 + nodes.length * 120)} ${svgH}`}
            className="w-full h-full relative z-10"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Connection lines: environment hub → resource node */}
            {nodes.map((n) => {
              const env = (n as any).environment || "unknown";
              const ePos = envPositions[env];
              const rPos = resourcePositions[n.id];
              if (!ePos || !rPos) return null;
              const isOptimized = n.state === "optimized";
              return (
                <line
                  key={`edge-${n.id}`}
                  x1={ePos.x + 18} y1={ePos.y}
                  x2={rPos.x - 26} y2={rPos.y}
                  stroke={isOptimized ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.08)"}
                  strokeWidth="1.5"
                  strokeDasharray={isOptimized ? "none" : "4 3"}
                />
              );
            })}

            {/* Animated flow dots on active connections */}
            {nodes.filter((n) => n.state === "optimized").map((n) => {
              const env = (n as any).environment || "unknown";
              const ePos = envPositions[env];
              const rPos = resourcePositions[n.id];
              if (!ePos || !rPos) return null;
              const pathD = `M ${ePos.x + 18} ${ePos.y} L ${rPos.x - 26} ${rPos.y}`;
              return (
                <motion.circle
                  key={`dot-${n.id}`}
                  r="3"
                  fill="#10B981"
                  animate={{ offsetDistance: ["0%", "100%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  style={{ offsetPath: `path('${pathD}')` } as any}
                />
              );
            })}

            {/* Environment hubs */}
            {environments.map((env) => {
              const pos = envPositions[env];
              if (!pos) return null;
              return <ProviderHub key={env} name={env} x={pos.x} y={pos.y} />;
            })}

            {/* Resource nodes */}
            {nodes.map((n) => {
              const pos = resourcePositions[n.id];
              if (!pos) return null;
              return <ResourceNode key={n.id} node={n} x={pos.x} y={pos.y} />;
            })}
          </svg>
        )}
      </div>
    </div>
  );
}

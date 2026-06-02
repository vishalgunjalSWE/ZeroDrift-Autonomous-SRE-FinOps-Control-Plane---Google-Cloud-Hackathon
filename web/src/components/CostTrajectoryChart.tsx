"use client";

import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

export function CostTrajectoryChart({ runs }: { runs: any[] }) {
  const chartData = useMemo(() => {
    if (!Array.isArray(runs) || runs.length === 0) return [];
    
    // Filter to SUCCESS and MERGED runs
    const validRuns = runs
      .filter(r => r.status.includes("SUCCESS") || r.status.includes("MERGED"))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    let cumulative = 0;
    return validRuns.map(r => {
      cumulative += r.savings || 0;
      return {
        time: r.timestamp.split(".")[0], // HH:MM:SS
        savings: cumulative
      };
    });
  }, [runs]);

  return (
    <div className="glass-card rounded-xl p-6 h-[300px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold tracking-wide flex items-center">
          <TrendingUp className="w-4 h-4 mr-2 text-azure" />
          Cost Optimization Trajectory
        </h3>
        <div className="text-[10px] text-azure uppercase tracking-wider font-semibold px-2 py-1 bg-azure/10 rounded">Cumulative</div>
      </div>
      
      <div className="flex-1 w-full relative">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0070F3" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0070F3" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="time" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                itemStyle={{ color: '#0070F3', fontWeight: 'bold' }}
                formatter={(val) => [`$${Number(val).toFixed(2)}`, 'Cumulative Savings']}
              />
              <Area type="monotone" dataKey="savings" stroke="#0070F3" strokeWidth={2} fillOpacity={1} fill="url(#colorSavings)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted text-sm">
            Pending verification...
          </div>
        )}
      </div>
    </div>
  );
}

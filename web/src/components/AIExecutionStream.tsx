"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, ShieldAlert, CheckCircle, BrainCircuit, Activity, Play } from "lucide-react";

interface LogEntry {
  id: string;
  timestamp: string;
  tag: string;
  color: string;
  message: string;
}

export function AIExecutionStream() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const BACKEND = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "");
    // Connect to SSE Stream
    const eventSource = new EventSource(`${BACKEND}/api/stream-logs`);
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLogs((prev) => {
          if (prev.length > 0 && prev[prev.length - 1].message === data.message) return prev;
          return [...prev, { ...data, id: Math.random().toString(36).substr(2, 9) }];
        });
        
        // Auto-scroll
        setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
          }
        }, 100);
      } catch (e) {
        console.error("SSE parse error", e);
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const triggerRun = async () => {
    setIsRunning(true);
    setLogs([]); // Clear logs for new run
    try {
      const BACKEND = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "");
      await fetch(`${BACKEND}/api/trigger-manual`, { method: "POST" });
    } catch (e) {
      console.error(e);
    }
    setTimeout(() => setIsRunning(false), 5000);
  };

  const getTagBadgeStyle = (tag: string) => {
    switch (tag) {
      case "APPROVAL-GATE":
      case "CRITICAL":
        return "bg-amber-500/10 text-amber-400 border-amber-500/25";
      case "PRE-FLIGHT":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/25";
      case "GIT-OPS":
      case "SUCCESS":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/25";
      case "ANALYSIS":
      case "AI-ENGINE":
        return "bg-purple-500/10 text-purple-400 border-purple-500/25";
      case "SCAN":
      case "SRE-OPS":
        return "bg-blue-500/10 text-blue-400 border-blue-500/25";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/25";
    }
  };

  const getNodeDotColor = (tag: string) => {
    switch (tag) {
      case "APPROVAL-GATE":
      case "CRITICAL":
        return "bg-amber-400 ring-amber-500/20";
      case "PRE-FLIGHT":
        return "bg-cyan-400 ring-cyan-500/20";
      case "GIT-OPS":
      case "SUCCESS":
        return "bg-emerald-400 ring-emerald-500/20";
      case "ANALYSIS":
      case "AI-ENGINE":
        return "bg-purple-400 ring-purple-500/20";
      case "SCAN":
      case "SRE-OPS":
        return "bg-blue-400 ring-blue-500/20";
      default:
        return "bg-slate-400 ring-slate-500/20";
    }
  };

  return (
    <div className="zd-card border border-white/[0.08] flex flex-col h-[500px] overflow-hidden bg-[#11151E]">
      {/* Header */}
      <div className="h-14 border-b border-white/[0.08] flex items-center justify-between px-6 bg-[#0E121A] shrink-0">
        <div className="flex items-center space-x-3">
          <BrainCircuit className="w-4 h-4 text-blue-400" />
          <div>
            <h2 className="text-xs font-semibold tracking-wider uppercase text-slate-200">
              Operational Execution Timeline
            </h2>
          </div>
          <div className="flex items-center space-x-1.5 ml-2 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">SSE Stream</span>
          </div>
        </div>

        <button 
          onClick={triggerRun}
          disabled={isRunning}
          className="zd-btn-primary py-1 px-3.5 text-xs"
        >
          <Play className="w-3 h-3 fill-current" />
          <span>{isRunning ? "Executing Sweep..." : "Initiate Sweep"}</span>
        </button>
      </div>

      {/* Timeline Stream Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 font-mono scroll-smooth">
        {logs.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-500">
            <BrainCircuit className="w-10 h-10 mb-3 opacity-25" />
            <p className="text-xs font-sans text-slate-400">System idle. Ready for on-demand infrastructure analysis sweep.</p>
          </div>
        )}
        
        <AnimatePresence>
          {logs.map((log, index) => {
            return (
              <motion.div 
                key={log.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-start space-x-3 text-xs"
              >
                {/* Timeline node */}
                <div className="mt-1 flex flex-col items-center shrink-0">
                  <div className={`w-2 h-2 rounded-full ring-4 ${getNodeDotColor(log.tag)}`} />
                  {index !== logs.length - 1 && (
                    <div className="w-[1px] h-full min-h-[24px] bg-white/[0.08] my-1" />
                  )}
                </div>

                {/* Event body */}
                <div className="flex-1 bg-[#141924] border border-white/[0.06] rounded-md p-3 hover:border-white/[0.12] transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getTagBadgeStyle(log.tag)}`}>
                        {log.tag}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                  </div>
                  <div className="text-xs leading-relaxed text-slate-200 font-mono">
                    {log.message}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

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
    // Connect to SSE Stream
    const eventSource = new EventSource("http://localhost:8000/api/stream-logs");
    
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
      await fetch("http://localhost:8000/api/trigger-manual", { method: "POST" });
    } catch (e) {
      console.error(e);
    }
    setTimeout(() => setIsRunning(false), 5000);
  };

  const getIconForTag = (tag: string) => {
    switch (tag) {
      case "AI-ENGINE": return <BrainCircuit className="w-4 h-4 text-violet" />;
      case "CRITICAL": return <ShieldAlert className="w-4 h-4 text-infrared" />;
      case "SUCCESS": return <CheckCircle className="w-4 h-4 text-emerald" />;
      case "SRE-OPS": return <Terminal className="w-4 h-4 text-azure" />;
      default: return <Activity className="w-4 h-4 text-muted" />;
    }
  };

  return (
    <div className="glass-card rounded-xl border border-white/5 flex flex-col h-[500px] overflow-hidden relative">
      {/* Header */}
      <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-white/[0.01]">
        <div className="flex items-center space-x-3">
          <BrainCircuit className="w-5 h-5 text-azure" />
          <h2 className="text-sm font-semibold tracking-wide">Autonomous Execution Stream</h2>
          <div className="flex items-center space-x-1.5 ml-2 px-2 py-0.5 rounded-full bg-emerald/10 border border-emerald/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse" />
            <span className="text-[10px] font-mono text-emerald uppercase tracking-wider">Live</span>
          </div>
        </div>
        <button 
          onClick={triggerRun}
          disabled={isRunning}
          className={`px-4 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-2 transition-all ${
            isRunning ? "bg-white/10 text-muted cursor-not-allowed" : "bg-azure hover:bg-azure/80 text-white shadow-[0_0_15px_rgba(0,112,243,0.3)]"
          }`}
        >
          <Play className="w-3 h-3 fill-current" />
          <span>{isRunning ? "EXECUTING..." : "INITIATE SWEEP"}</span>
        </button>
      </div>

      {/* Stream Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 font-mono scroll-smooth">
        {logs.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-muted opacity-50">
            <BrainCircuit className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-sm font-sans">System idle. Ready for infrastructure analysis.</p>
          </div>
        )}
        
        <AnimatePresence>
          {logs.map((log) => {
            const isReasoning = log.tag === "AI-ENGINE";
            const isCritical = log.tag === "CRITICAL";
            
            return (
              <motion.div 
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex space-x-4 p-3 rounded-lg border ${
                  isReasoning ? "bg-violet/5 border-violet/20" : 
                  isCritical ? "bg-infrared/5 border-infrared/20" : 
                  "border-transparent hover:bg-white/[0.02]"
                }`}
              >
                <div className="mt-0.5">{getIconForTag(log.tag)}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <span className="text-[10px] text-muted">{log.timestamp}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase" style={{ color: log.color, backgroundColor: `${log.color}20` }}>
                      {log.tag}
                    </span>
                  </div>
                  <div className={`text-sm leading-relaxed ${isReasoning ? "text-[#E2C4FF]" : "text-[#EDEDED]"}`}>
                    {log.message}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

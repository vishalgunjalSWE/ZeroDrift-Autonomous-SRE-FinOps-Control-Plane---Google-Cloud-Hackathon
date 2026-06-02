"use client";

import { useState, useEffect } from "react";
import { Search, Terminal, GitMerge, FileCode2, AlertTriangle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTriggerManual, useSimulateIncident } from "@/hooks/useApi";

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const triggerManual = useTriggerManual();
  const simulateIncident = useSimulateIncident();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    
    const handleCustomOpen = () => setIsOpen(true);

    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-command-palette", handleCustomOpen);
    
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-command-palette", handleCustomOpen);
    };
  }, [isOpen]);

  const actions = [
    { id: "sweep", label: "Sweep Global (Initiate Run)", icon: triggerManual.isPending ? <Loader2 className="w-4 h-4 text-azure animate-spin" /> : <Terminal className="w-4 h-4 text-azure" /> },
    { id: "simulate", label: "Simulate Black Friday Traffic Spike", icon: simulateIncident.isPending ? <Loader2 className="w-4 h-4 text-red-500 animate-spin" /> : <AlertTriangle className="w-4 h-4 text-red-500" /> },
    { id: "drift", label: "Show Global Drift", icon: <Search className="w-4 h-4 text-emerald" /> },
    { id: "approve", label: "Review Pending Approvals", icon: <GitMerge className="w-4 h-4 text-amber" /> },
    { id: "audit", label: "Open Audit Ledger", icon: <FileCode2 className="w-4 h-4 text-violet" /> },
  ];

  const filteredActions = actions.filter((action) =>
    action.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleAction = async (id: string) => {
    console.log(`Action executed: ${id}`);
    
    if (id === "sweep") {
      await triggerManual.mutateAsync();
    } else if (id === "simulate") {
      await simulateIncident.mutateAsync();
    }

    setIsOpen(false);
    setQuery("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99]"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-xl bg-[#0F0F0F] border border-white/10 rounded-xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col"
            >
              <div className="flex items-center px-4 py-3 border-b border-white/10">
                <Search className="w-5 h-5 text-muted mr-3" />
                <input
                  type="text"
                  placeholder="Type a command or search..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                  className="flex-1 bg-transparent border-none outline-none text-[#EDEDED] placeholder-muted/70 text-base"
                />
                <div className="flex items-center space-x-1">
                  <kbd className="bg-white/10 text-muted px-1.5 py-0.5 rounded text-[10px] font-mono">ESC</kbd>
                </div>
              </div>
              
              <div className="max-h-[300px] overflow-y-auto p-2">
                {filteredActions.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted">No commands found.</div>
                ) : (
                  filteredActions.map((action, idx) => (
                    <button
                      key={action.id}
                      onClick={() => handleAction(action.id)}
                      className={`w-full flex items-center px-3 py-2.5 rounded-lg text-left transition-colors hover:bg-white/[0.04] focus:bg-white/[0.04] outline-none ${idx === 0 && query === "" ? "bg-white/[0.04]" : ""}`}
                    >
                      <span className="mr-3 p-1.5 bg-white/5 rounded-md">
                        {action.icon}
                      </span>
                      <span className="text-sm font-medium text-[#EDEDED]">{action.label}</span>
                    </button>
                  ))
                )}
              </div>
              
              <div className="p-2 border-t border-white/10 bg-white/[0.01] flex items-center justify-between text-[10px] text-muted">
                <span>Select an action</span>
                <div className="flex space-x-2">
                  <span className="flex items-center"><kbd className="bg-white/10 px-1 rounded mr-1">↑</kbd> <kbd className="bg-white/10 px-1 rounded">↓</kbd> to navigate</span>
                  <span className="flex items-center"><kbd className="bg-white/10 px-1 rounded mr-1">↵</kbd> to execute</span>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

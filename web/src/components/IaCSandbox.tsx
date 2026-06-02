"use client";

import { useState, useEffect } from "react";
import { Save, RefreshCw, Box } from "lucide-react";

export function IaCSandbox() {
  const [code, setCode] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8000/api/iac")
      .then(res => res.json())
      .then(data => setCode(data.code))
      .catch(e => console.error("Failed to load IaC code", e));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch("http://localhost:8000/api/iac", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });
    } catch (e) {
      console.error(e);
    }
    setTimeout(() => setIsSaving(false), 1000);
  };

  const handleReset = async () => {
    try {
      await fetch("http://localhost:8000/api/iac/reset", { method: "POST" });
      const res = await fetch("http://localhost:8000/api/iac");
      const data = await res.json();
      setCode(data.code);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center"><Box className="w-4 h-4 mr-2 text-azure" /> Terraform IaC Sandbox</h2>
          <p className="text-sm text-muted">Edit configuration and trigger drift detection sweeps manually.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleReset}
            className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-md text-sm font-semibold flex items-center space-x-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-violet" />
            <span>Reset to Default</span>
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-md text-sm font-semibold flex items-center space-x-2 transition-colors"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin text-azure" /> : <Save className="w-4 h-4 text-emerald" />}
            <span>{isSaving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 glass-card rounded-xl border border-white/5 overflow-hidden">
        <textarea 
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          className="w-full h-full bg-transparent text-[#EDEDED] font-mono text-sm p-6 outline-none resize-none"
          placeholder="# main.tf code goes here..."
        />
      </div>
    </div>
  );
}

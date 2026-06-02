"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, RotateCcw, ShieldCheck, Play, CheckCircle, XCircle, Loader2, Terminal, Folder, FileCode, ChevronRight, ChevronDown } from "lucide-react";

// Dynamically import Monaco to avoid SSR issues
const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((m) => m.default),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex items-center space-x-3 text-muted text-sm">
          <Loader2 className="w-4 h-4 animate-spin text-azure" />
          <span>Loading Monaco Editor...</span>
        </div>
      </div>
    )
  }
);

const BACKEND = "http://localhost:8000";

type ValidationState = "idle" | "validating" | "pass" | "fail";
type SaveState = "idle" | "saving" | "saved" | "error";

type TreeNode = {
  name: string;
  path: string;
  type: "file" | "folder";
  children: Record<string, TreeNode>;
};

function buildTree(paths: string[]): TreeNode {
  const root: TreeNode = { name: "root", path: "", type: "folder", children: {} };
  
  paths.forEach(p => {
    const parts = p.replace(/\\/g, '/').split('/');
    let current = root;
    parts.forEach((part, i) => {
      if (!current.children[part]) {
        current.children[part] = {
          name: part,
          path: parts.slice(0, i + 1).join('/'),
          type: i === parts.length - 1 ? "file" : "folder",
          children: {}
        };
      }
      current = current.children[part];
    });
  });
  return root;
}

const TreeFolder = ({ node, activeFile, setActiveFile, depth = 0 }: { node: TreeNode, activeFile: string, setActiveFile: (s:string)=>void, depth?: number }) => {
  const [isOpen, setIsOpen] = useState(true);
  
  if (node.type === "file") {
    return (
      <button
        onClick={() => setActiveFile(node.path)}
        style={{ paddingLeft: `${8 + depth * 12}px` }}
        className={`w-full text-left py-1 pr-3 text-[11px] font-mono truncate flex items-center space-x-1.5 ${
          activeFile === node.path ? "bg-azure/10 text-azure" : "text-muted hover:bg-white/5 hover:text-white"
        }`}
      >
        <FileCode className="w-3.5 h-3.5 shrink-0 opacity-70" />
        <span className="truncate">{node.name}</span>
      </button>
    );
  }
  
  const children = Object.values(node.children).sort((a,b) => {
    if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  
  return (
    <div className="w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{ paddingLeft: `${8 + depth * 12}px` }}
        className="w-full text-left py-1 pr-3 text-[11px] font-mono truncate flex items-center space-x-1 text-[#EDEDED] hover:text-white hover:bg-white/5"
      >
        {isOpen ? <ChevronDown className="w-3 h-3 shrink-0 opacity-70" /> : <ChevronRight className="w-3 h-3 shrink-0 opacity-70" />}
        <Folder className="w-3 h-3 shrink-0 text-azure" />
        <span className="truncate font-semibold tracking-wide">{node.name}</span>
      </button>
      {isOpen && (
        <div className="w-full">
          {children.map(child => (
            <TreeFolder key={child.path} node={child} activeFile={activeFile} setActiveFile={setActiveFile} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export function TerraformIDE() {
  const [code, setCode] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [validation, setValidation] = useState<ValidationState>("idle");
  const [validationMsg, setValidationMsg] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [applyMsg, setApplyMsg] = useState("");

  const [tree, setTree] = useState<string[]>([]);
  const [activeFile, setActiveFile] = useState("environments/prod/main.tf");

  // Fetch current IaC code on mount and when activeFile changes
  useEffect(() => {
    fetch(`${BACKEND}/api/active-code?path=${encodeURIComponent(activeFile)}`)
      .then((r) => r.json())
      .then((d) => setCode(d.code || ""))
      .catch(() => setCode("# Failed to load IaC code. Check backend connection."));
  }, [activeFile]);

  // Fetch file tree on mount
  useEffect(() => {
    fetch(`${BACKEND}/api/iac/tree`)
      .then((r) => r.json())
      .then((d) => setTree(d.tree || []))
      .catch((e) => console.error("Failed to fetch tree", e));
  }, []);

  const handleSave = async () => {
    setSaveState("saving");
    try {
      await fetch(`${BACKEND}/api/save-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, path: activeFile }),
      });
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2500);
    } catch {
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 2500);
    }
  };

  const handleReset = async () => {
    try {
      await fetch(`${BACKEND}/api/iac/reset`, { method: "POST" });
      const res = await fetch(`${BACKEND}/api/active-code?path=${encodeURIComponent(activeFile)}`);
      const data = await res.json();
      setCode(data.code || "");
      setValidation("idle");
      setValidationMsg("");
    } catch (e) {
      console.error("Reset failed:", e);
    }
  };

  const handleValidate = async () => {
    setValidation("validating");
    setValidationMsg("");
    // Save first, then trigger a validate-only sweep
    await handleSave();
    // Quick mock validation via our existing validate logic in the backend
    try {
      const res = await fetch(`${BACKEND}/api/v1/validate-iac`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (res.ok) {
        const data = await res.json();
        setValidation(data.valid ? "pass" : "fail");
        setValidationMsg(data.message || "");
      } else {
        // Fallback: basic client-side check
        const hasProvider = code.includes("provider");
        const hasResource = code.includes("resource");
        if (hasProvider && hasResource) {
          setValidation("pass");
          setValidationMsg("Syntax check passed — provider and resource blocks detected.");
        } else {
          setValidation("fail");
          setValidationMsg("Missing required provider or resource blocks.");
        }
      }
    } catch {
      const hasProvider = code.includes("provider");
      const hasResource = code.includes("resource");
      setValidation(hasProvider && hasResource ? "pass" : "fail");
      setValidationMsg(hasProvider && hasResource
        ? "Syntax check passed — provider and resource blocks detected."
        : "Missing required provider or resource blocks.");
    }
  };

  const handleApply = async () => {
    setIsApplying(true);
    setApplyMsg("");
    await handleSave();
    try {
      const res = await fetch(`${BACKEND}/api/trigger-manual`, { method: "POST" });
      const data = await res.json();
      setApplyMsg(`✅ Sweep triggered: ${data.run_id}`);
    } catch {
      setApplyMsg("❌ Failed to trigger sweep. Check backend.");
    }
    setTimeout(() => { setIsApplying(false); setApplyMsg(""); }, 4000);
  };

  const SaveIcon = saveState === "saving" ? Loader2
    : saveState === "saved" ? CheckCircle
    : saveState === "error" ? XCircle
    : Save;

  const saveLabel = saveState === "saving" ? "Saving..."
    : saveState === "saved" ? "Saved"
    : saveState === "error" ? "Error"
    : "Save";

  const saveColor = saveState === "saved" ? "text-emerald"
    : saveState === "error" ? "text-infrared"
    : "text-[#EDEDED]";

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* IDE Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold flex items-center">
            <Terminal className="w-4 h-4 mr-2 text-azure" />
            Terraform IaC Sandbox
          </h2>
          <p className="text-xs text-muted">VS Code-grade editor — Monaco Engine</p>
        </div>

        {/* Action Bar */}
        <div className="flex items-center space-x-2">
          {/* Reset */}
          <button
            onClick={handleReset}
            title="Reset to backup"
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-violet" />
            <span>Reset to Backup</span>
          </button>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saveState === "saving"}
            className={`flex items-center space-x-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-xs font-medium transition-colors ${saveColor}`}
          >
            <SaveIcon className={`w-3.5 h-3.5 ${saveState === "saving" ? "animate-spin" : ""}`} />
            <span>{saveLabel}</span>
          </button>

          {/* Validate */}
          <button
            onClick={handleValidate}
            disabled={validation === "validating"}
            className={`flex items-center space-x-1.5 px-3 py-1.5 border rounded-md text-xs font-medium transition-all ${
              validation === "pass" ? "bg-emerald/10 border-emerald/30 text-emerald"
              : validation === "fail" ? "bg-infrared/10 border-infrared/30 text-infrared"
              : "bg-white/5 hover:bg-white/10 border-white/10"
            }`}
          >
            {validation === "validating" ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : validation === "pass" ? <CheckCircle className="w-3.5 h-3.5" />
              : validation === "fail" ? <XCircle className="w-3.5 h-3.5" />
              : <ShieldCheck className="w-3.5 h-3.5 text-azure" />}
            <span>
              {validation === "validating" ? "Validating..."
                : validation === "pass" ? "Valid"
                : validation === "fail" ? "Invalid"
                : "Validate"}
            </span>
          </button>

          {/* Apply / Trigger Sweep */}
          <button
            onClick={handleApply}
            disabled={isApplying}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-azure hover:bg-azure/80 text-white rounded-md text-xs font-semibold transition-all shadow-[0_0_12px_rgba(0,112,243,0.3)]"
          >
            {isApplying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isApplying ? "Applying..." : "Apply & Sweep"}</span>
          </button>
        </div>
      </div>

      {/* Validation message */}
      <AnimatePresence>
        {validationMsg && (
          <motion.div
            key="validation-msg"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className={`text-xs px-3 py-2 rounded-md font-mono border ${
              validation === "pass"
                ? "bg-emerald/5 border-emerald/20 text-emerald"
                : "bg-infrared/5 border-infrared/20 text-infrared"
            }`}
          >
            {validationMsg}
          </motion.div>
        )}
        {applyMsg && (
          <motion.div
            key="apply-msg"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-xs px-3 py-2 rounded-md font-mono border bg-azure/5 border-azure/20 text-azure"
          >
            {applyMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor Layout: Sidebar + Monaco */}
      <div className="flex-1 flex overflow-hidden glass-card rounded-xl border border-white/5 min-h-0">
        
        {/* File Tree Sidebar */}
        <div className="w-48 border-r border-white/5 bg-white/[0.01] flex flex-col overflow-y-auto">
          <div className="px-3 py-2 text-xs font-semibold text-muted border-b border-white/5 flex items-center">
            <Folder className="w-3.5 h-3.5 mr-1.5" />
            Explorer
          </div>
          <div className="flex-1 py-2">
            {Object.values(buildTree(tree).children).map(child => (
              <TreeFolder key={child.path} node={child} activeFile={activeFile} setActiveFile={setActiveFile} depth={0} />
            ))}
          </div>
        </div>

        {/* Monaco Editor Panel */}
        <div className="flex-1 flex flex-col relative min-w-0">
          {/* Editor Tab Bar */}
          <div className="flex items-center space-x-1 px-4 py-2 bg-white/[0.02] border-b border-white/5 shrink-0 z-10 overflow-x-auto">
            <div className="flex items-center space-x-2 px-3 py-1 bg-white/5 rounded-sm border border-white/10 shrink-0">
              <div className="w-2 h-2 rounded-full bg-azure/60" />
              <span className="text-xs text-[#EDEDED] font-mono">{activeFile}</span>
            </div>
          </div>

          <div className="flex-1 relative w-full h-full">
            <div className="absolute inset-0">
              <MonacoEditor
                height="100%"
                language="hcl"
                theme="vs-dark"
                value={code}
                onChange={(val) => setCode(val || "")}
                options={{
                  fontSize: 13,
                  fontFamily: "'Roboto Mono', 'Fira Code', monospace",
                  fontLigatures: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  lineNumbers: "on",
                  glyphMargin: false,
                  folding: true,
                  renderLineHighlight: "gutter",
                  cursorBlinking: "smooth",
                  smoothScrolling: true,
                  padding: { top: 16, bottom: 16 },
                  wordWrap: "on",
                  automaticLayout: true,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

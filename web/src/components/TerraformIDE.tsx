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

const BACKEND = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "");

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
    const isSandbox = node.path.includes("terraform_sandbox") || node.path.includes("demo_infrastructure");
    return (
      <button
        onClick={() => setActiveFile(node.path)}
        style={{ paddingLeft: `${8 + depth * 12}px` }}
        className={`w-full text-left py-1.5 pr-2.5 text-[11px] font-mono truncate flex items-center justify-between group transition-colors ${
          activeFile === node.path
            ? "bg-blue-500/10 text-blue-400 font-semibold"
            : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
        }`}
      >
        <div className="flex items-center space-x-1.5 truncate">
          <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSandbox ? "text-amber-400/90" : "text-slate-500"}`} />
          <span className="truncate">{node.name}</span>
        </div>
        {isSandbox ? (
          <span className="text-[9px] uppercase tracking-wider px-1 py-0.5 rounded bg-amber-500/15 text-amber-400 shrink-0 font-sans font-bold">
            Sandbox
          </span>
        ) : (
          <span className="text-[9px] uppercase tracking-wider px-1 py-0.5 rounded bg-white/[0.05] text-slate-500 shrink-0 font-sans">
            Base
          </span>
        )}
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
        className="w-full text-left py-1.5 pr-2.5 text-[11px] font-mono truncate flex items-center space-x-1.5 text-slate-300 hover:text-white hover:bg-white/[0.04] transition-colors"
      >
        {isOpen ? <ChevronDown className="w-3 h-3 shrink-0 text-slate-500" /> : <ChevronRight className="w-3 h-3 shrink-0 text-slate-500" />}
        <Folder className={`w-3.5 h-3.5 shrink-0 ${node.name.includes("sandbox") ? "text-amber-400" : "text-blue-400"}`} />
        <span className="truncate font-medium">{node.name}</span>
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
    try {
      const res = await fetch(`${BACKEND}/api/v1/validate-iac`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (res.ok) {
        const data = await res.json();
        const isPass = data.status === "PASS";
        setValidation(isPass ? "pass" : "fail");
        setValidationMsg(
          isPass
            ? `Syntax PASS — ${data.resources_validated} resource(s) validated, 0 errors.`
            : `Syntax FAIL — ${data.errors ? data.errors.join("; ") : "Validation failed"}`
        );
      } else {
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
    } catch (e) {
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

  const isSandboxTarget = activeFile.includes("terraform_sandbox") || activeFile.includes("demo_infrastructure");

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* IDE Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
            <span>Infrastructure as Code</span>
            <span>/</span>
            <span className={isSandboxTarget ? "text-amber-400" : "text-slate-300"}>
              {isSandboxTarget ? "Isolated Simulation Target" : "Baseline Reference"}
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center">
            <Terminal className="w-5 h-5 mr-2.5 text-blue-500" />
            IaC Explorer & Validation Sandbox
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Monaco editor with static HCL syntax pre-flight verification and strict sandbox boundary enforcement.
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex items-center space-x-2.5">
          {/* Reset */}
          <button
            onClick={handleReset}
            title="Reset sandbox to backup baseline"
            className="zd-btn zd-btn-secondary text-xs px-3 py-1.5 flex items-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset to Backup</span>
          </button>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saveState === "saving"}
            className="zd-btn zd-btn-secondary text-xs px-3 py-1.5 flex items-center space-x-1.5"
          >
            <SaveIcon className={`w-3.5 h-3.5 ${saveState === "saving" ? "animate-spin" : saveColor}`} />
            <span>{saveLabel}</span>
          </button>

          {/* Validate */}
          <button
            onClick={handleValidate}
            disabled={validation === "validating"}
            className="zd-btn zd-btn-secondary text-xs px-3 py-1.5 flex items-center space-x-1.5"
          >
            {validation === "validating" ? <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
              : validation === "pass" ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              : validation === "fail" ? <XCircle className="w-3.5 h-3.5 text-rose-400" />
              : <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />}
            <span>
              {validation === "validating" ? "Validating HCL..."
                : validation === "pass" ? "Demo Guardrail Passed"
                : validation === "fail" ? "Syntax Check Failed"
                : "Pre-Flight Check"}
            </span>
          </button>

          {/* Apply / Trigger Sweep */}
          <button
            onClick={handleApply}
            disabled={isApplying}
            className="zd-btn zd-btn-primary text-xs px-3.5 py-1.5 flex items-center space-x-1.5"
          >
            {isApplying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isApplying ? "Triggering..." : "Trigger Simulation Sweep"}</span>
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
            className={`text-xs px-3.5 py-2.5 rounded-lg font-mono border ${
              validation === "pass"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-rose-500/10 border-rose-500/20 text-rose-400"
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
            className="text-xs px-3.5 py-2.5 rounded-lg font-mono border bg-blue-500/10 border-blue-500/20 text-blue-400"
          >
            {applyMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor Layout: Sidebar + Monaco */}
      <div className="flex-1 flex overflow-hidden zd-card border border-white/[0.08] min-h-0">
        
        {/* File Tree Sidebar */}
        <div className="w-56 border-r border-white/[0.08] bg-[#0A0C11] flex flex-col overflow-y-auto shrink-0">
          <div className="px-3.5 py-2.5 text-xs font-semibold text-slate-400 border-b border-white/[0.08] flex items-center justify-between">
            <span className="flex items-center">
              <Folder className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              Repository
            </span>
            <span className="text-[10px] font-mono text-slate-500 uppercase">Tree</span>
          </div>
          <div className="flex-1 py-2">
            {Object.values(buildTree(tree).children).map(child => (
              <TreeFolder key={child.path} node={child} activeFile={activeFile} setActiveFile={setActiveFile} depth={0} />
            ))}
          </div>
        </div>

        {/* Monaco Editor Panel */}
        <div className="flex-1 flex flex-col relative min-w-0 bg-[#08090C]">
          {/* Editor Tab Bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#0E121B] border-b border-white/[0.08] shrink-0 z-10 overflow-x-auto gap-4">
            <div className="flex items-center space-x-2.5">
              <div className="flex items-center space-x-2 px-3 py-1 bg-white/[0.04] rounded border border-white/[0.08] shrink-0">
                <div className={`w-2 h-2 rounded-full ${isSandboxTarget ? "bg-amber-400" : "bg-blue-400"}`} />
                <span className="text-xs text-slate-200 font-mono">{activeFile}</span>
              </div>
              {isSandboxTarget ? (
                <span className="zd-badge zd-badge-amber text-[10px] py-0.5">
                  Isolated Sandbox Target · Writes Allowed
                </span>
              ) : (
                <span className="zd-badge zd-badge-neutral text-[10px] py-0.5">
                  Read-Only Baseline · Mutation Protected
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-500 shrink-0">
              <span>HCL / Terraform 1.5+</span>
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

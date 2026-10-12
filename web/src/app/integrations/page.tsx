"use client";

import { Boxes, Cloud, CheckCircle, XCircle, Settings2, X, Key, Link as LinkIcon, RefreshCw, Trash2, Check, AlertCircle, Info, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const BACKEND = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "");

function Activity(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
}
function ShieldAlert(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2-1 4-3 7-3s5 2 7 3a1 1 0 0 1 1 1v7z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
}
function Github(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>;
}
function SlackIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="8" height="8" rx="2"/><rect x="14" y="2" width="8" height="8" rx="2"/><rect x="2" y="14" width="8" height="8" rx="2"/><rect x="14" y="14" width="8" height="8" rx="2"/></svg>;
}

const INTEGRATIONS_CONFIG = [
  {
    id: "gemini",
    name: "Google Gemini 2.5 Flash",
    icon: <Sparkles className="w-8 h-8 text-[#A855F7]" />,
    type: "AI & Structured Reasoning",
    placeholder: "AIzaSy...",
    hint: "Google Gemini API Key for live LLM reasoning",
    endpointLabel: "",
    endpointPlaceholder: "",
    docsUrl: "https://ai.google.dev/",
  },
  {
    id: "aws",
    name: "AWS Cloud Control",
    icon: <Cloud className="w-8 h-8 text-[#FF9900]" />,
    type: "Infrastructure",
    placeholder: "ACCESS_KEY_ID:SECRET_ACCESS_KEY",
    hint: "Format: ACCESS_KEY_ID:SECRET_ACCESS_KEY",
    endpointLabel: "",
    endpointPlaceholder: "",
    docsUrl: "https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html",
  },
  {
    id: "gcp",
    name: "Google Cloud Platform",
    icon: <Cloud className="w-8 h-8 text-[#4285F4]" />,
    type: "Infrastructure",
    placeholder: '{ "type": "service_account", ... }',
    hint: "Paste the full Service Account JSON key",
    endpointLabel: "",
    endpointPlaceholder: "",
    docsUrl: "https://cloud.google.com/iam/docs/creating-managing-service-account-keys",
  },
  {
    id: "gitlab",
    name: "GitLab CI/CD",
    icon: <Boxes className="w-8 h-8 text-[#FC6D26]" />,
    type: "VCS & Deployment",
    placeholder: "glpat-xxxxxxxxxxxxxxxxxxxx",
    hint: "GitLab Personal Access Token with api scope",
    endpointLabel: "GitLab Instance URL (optional for self-hosted)",
    endpointPlaceholder: "https://gitlab.com",
    docsUrl: "https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html",
  },
  {
    id: "github",
    name: "GitHub Actions",
    icon: <Github className="w-8 h-8 text-white" />,
    type: "VCS & Deployment",
    placeholder: "ghp_xxxxxxxxxxxxxxxxxxxx",
    hint: "GitHub Personal Access Token (classic) with repo scope",
    endpointLabel: "",
    endpointPlaceholder: "",
    docsUrl: "https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens",
  },
  {
    id: "slack",
    name: "Slack",
    icon: <SlackIcon className="w-8 h-8 text-[#E01E5A]" />,
    type: "Alerting",
    placeholder: "xoxb-xxxx-xxxx-xxxx",
    hint: "Slack Bot Token (starts with xoxb-)",
    endpointLabel: "",
    endpointPlaceholder: "",
    docsUrl: "https://api.slack.com/authentication/token-types",
  },
  {
    id: "datadog",
    name: "Datadog",
    icon: <Activity className="w-8 h-8 text-[#632CA6]" />,
    type: "Observability",
    placeholder: "API_KEY:APP_KEY",
    hint: "Format: API_KEY:APP_KEY (both required)",
    endpointLabel: "",
    endpointPlaceholder: "",
    docsUrl: "https://docs.datadoghq.com/account_management/api-app-keys/",
  },
  {
    id: "pagerduty",
    name: "PagerDuty",
    icon: <ShieldAlert className="w-8 h-8 text-[#06AC38]" />,
    type: "Incident Management",
    placeholder: "your-pagerduty-api-token",
    hint: "PagerDuty API User Token or REST API Key",
    endpointLabel: "",
    endpointPlaceholder: "",
    docsUrl: "https://support.pagerduty.com/docs/api-access-keys",
  },
];

export default function IntegrationsPage() {
  const queryClient = useQueryClient();
  const [activeModal, setActiveModal] = useState<any>(null);
  const [apiKey, setApiKey] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successDetail, setSuccessDetail] = useState("");
  const [testResult, setTestResult] = useState<"idle" | "testing" | "ok" | "fail">("idle");

  // Fetch real connection status from backend
  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ["integrations-status"],
    queryFn: () => fetch(`${BACKEND}/api/integrations/status`).then(r => r.json()).catch(() => ({ integrations: {} })),
    refetchInterval: 30_000,
  });

  const backendStatus: Record<string, any> = statusData?.integrations ?? {};

  // Merge static config with real backend status
  const integrations = INTEGRATIONS_CONFIG.map(cfg => {
    const bState = backendStatus[cfg.id];
    let status = "NOT_CONFIGURED";
    let detail = cfg.hint;

    if (bState?.status === "CONNECTED") {
      status = "CONNECTED";
      detail = bState.detail || "Credentials verified live via API";
    } else if (cfg.id === "gemini" && (!bState || bState.status === "DEMO_FALLBACK")) {
      status = "DEMO_FALLBACK";
      detail = "Demo fallback active — deterministic SRE recommendations";
    } else {
      if (cfg.id === "gitlab" || cfg.id === "github") {
        detail = "Not connected — credentials required · Live GitOps unavailable in local simulation";
      } else {
        detail = "Not connected — credentials required";
      }
    }

    return {
      ...cfg,
      status,
      detail,
      connected_at: bState?.connected_at ?? "",
    };
  });

  const connectMutation = useMutation({
    mutationFn: async ({ id, key, ep }: { id: string; key: string; ep: string }) => {
      const res = await fetch(`${BACKEND}/api/integrations/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ integration_id: id, api_key: key, endpoint: ep }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail ?? "Validation failed");
      }
      return res.json();
    },
    onSuccess: (data) => {
      setSuccessDetail(data.detail ?? "Connected successfully");
      setErrorMsg("");
      queryClient.invalidateQueries({ queryKey: ["integrations-status"] });
    },
    onError: (err: any) => {
      setErrorMsg(err.message ?? "Unknown error");
      setSuccessDetail("");
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${BACKEND}/api/integrations/disconnect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ integration_id: id }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations-status"] });
      closeModal();
    },
  });

  const testMutation = useMutation({
    mutationFn: async (id: string) => {
      setTestResult("testing");
      const res = await fetch(`${BACKEND}/api/integrations/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ integration_id: id }),
      });
      if (!res.ok) throw new Error("Test failed");
      return res.json();
    },
    onSuccess: () => setTestResult("ok"),
    onError: () => setTestResult("fail"),
  });

  const openConfig = (integration: any) => {
    setActiveModal(integration);
    setApiKey("");
    setEndpoint("");
    setErrorMsg("");
    setSuccessDetail("");
    setTestResult("idle");
  };

  const closeModal = () => {
    setActiveModal(null);
    setApiKey("");
    setEndpoint("");
    setErrorMsg("");
    setSuccessDetail("");
    setTestResult("idle");
  };

  return (
    <main className="p-6 lg:p-10 max-w-[1800px] mx-auto w-full h-full flex flex-col space-y-8 relative">
      <div className="border-b border-white/[0.08] pb-6 shrink-0 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
            <span>Control Plane</span>
            <span>/</span>
            <span className="text-white">External Ecosystem</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center">
            <Boxes className="w-6 h-6 mr-3 text-blue-500" />
            Integrations & Connectors
          </h1>
          <p className="text-slate-400 text-sm mt-1.5">
            Cryptographic status of cloud providers, GitOps repositories, and APM channels.
          </p>
        </div>
        <div className="text-xs text-slate-300 font-mono flex items-center space-x-2.5 bg-[#0E121B] border border-white/[0.08] px-3.5 py-2 rounded-lg shrink-0">
          <span className={`w-2 h-2 rounded-full ${statusLoading ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`} />
          <span>{Object.keys(backendStatus).filter(k => backendStatus[k]?.status === "CONNECTED").length} of {integrations.length} Connected · Credentials Verified</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {integrations.map((integration) => (
          <div key={integration.id} className="zd-card p-6 flex flex-col group transition-all relative overflow-hidden">
            <div className="flex items-start justify-between mb-5">
              <div className="w-12 h-12 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                {integration.icon}
              </div>
              <button
                onClick={() => openConfig(integration)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                title="Configure connector"
              >
                <Settings2 className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-semibold text-white tracking-tight">{integration.name}</h3>
              </div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mt-0.5">{integration.type}</p>
              {integration.detail && (
                <p className="text-xs text-slate-400 mt-2.5 leading-relaxed line-clamp-2">{integration.detail}</p>
              )}
            </div>

            <div className="mt-auto pt-4 border-t border-white/[0.06] flex items-center justify-between gap-3">
              {integration.status === "CONNECTED" ? (
                <span className="zd-badge zd-badge-emerald">
                  <CheckCircle className="w-3 h-3 mr-1.5" /> Connected
                </span>
              ) : integration.status === "DEMO_FALLBACK" ? (
                <span className="zd-badge zd-badge-amber">
                  <Info className="w-3 h-3 mr-1.5" /> Demo fallback active
                </span>
              ) : (
                <span className="zd-badge zd-badge-neutral">
                  <XCircle className="w-3 h-3 mr-1.5" /> Credentials required
                </span>
              )}

              <button
                onClick={() => openConfig(integration)}
                className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                  integration.status === "CONNECTED" ? "zd-btn zd-btn-secondary" : "zd-btn zd-btn-primary"
                }`}
              >
                {integration.status === "CONNECTED" ? "Manage" : "Configure"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Slide-over Configuration Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={closeModal} />

          <div className="relative w-full max-w-md h-full bg-[#0B0D13] border-l border-white/[0.08] shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/[0.08] bg-[#0E121B]">
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                  {activeModal.icon}
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white tracking-tight leading-tight">{activeModal.name}</h2>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{activeModal.type}</p>
                </div>
              </div>
              <button onClick={closeModal} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* Success state after connect */}
              {successDetail && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start space-x-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-emerald-400">Credential Validated</div>
                    <div className="text-xs text-emerald-300/80 mt-1 font-mono">{successDetail}</div>
                  </div>
                </div>
              )}

              {/* Error banner */}
              {errorMsg && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-start space-x-3">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-rose-400">Validation Failed</div>
                    <div className="text-xs text-rose-300/80 mt-1">{errorMsg}</div>
                  </div>
                </div>
              )}

              {activeModal.status === "CONNECTED" && !successDetail ? (
                /* CONNECTED STATE */
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start space-x-3">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-emerald-400">Live Connection Active</div>
                      <div className="text-xs text-emerald-300/80 mt-1 font-mono">{activeModal.detail || "Credentials verified via API."}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => testMutation.mutate(activeModal.id)}
                    className="zd-btn zd-btn-secondary w-full py-2.5 flex items-center justify-center space-x-2 text-xs"
                  >
                    {testResult === "testing" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : testResult === "ok" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <LinkIcon className="w-3.5 h-3.5" />}
                    <span>{testResult === "testing" ? "Testing connection..." : testResult === "ok" ? "Connection Verified" : "Test Connection"}</span>
                  </button>

                  <button
                    onClick={() => disconnectMutation.mutate(activeModal.id)}
                    className="zd-btn zd-btn-danger w-full py-2.5 flex items-center justify-center space-x-2 text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Disconnect Integration</span>
                  </button>
                </div>
              ) : !successDetail ? (
                /* NOT CONFIGURED STATE */
                <div className="space-y-5">
                  {/* How to get key hint */}
                  <div className="flex items-start space-x-2.5 p-3.5 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                    <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-slate-300 leading-relaxed">
                      {activeModal.hint}
                      {" · "}
                      <a href={activeModal.docsUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline inline-flex items-center">
                        Docs ↗
                      </a>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-300">
                      {activeModal.id === "gcp" ? "Service Account JSON" : "API Key / Token"}
                    </label>
                    <div className="relative">
                      <Key className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                      {activeModal.id === "gcp" ? (
                        <textarea
                          rows={5}
                          placeholder={activeModal.placeholder}
                          value={apiKey}
                          onChange={e => { setApiKey(e.target.value); setErrorMsg(""); }}
                          className="w-full bg-[#08090C] border border-white/[0.08] rounded-lg pl-9 pr-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors font-mono resize-none"
                        />
                      ) : (
                        <input
                          type="password"
                          placeholder={activeModal.placeholder}
                          value={apiKey}
                          onChange={e => { setApiKey(e.target.value); setErrorMsg(""); }}
                          className="w-full bg-[#08090C] border border-white/[0.08] rounded-lg pl-9 pr-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors font-mono"
                        />
                      )}
                    </div>
                  </div>

                  {activeModal.endpointLabel && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-300">{activeModal.endpointLabel}</label>
                      <div className="relative">
                        <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          placeholder={activeModal.endpointPlaceholder}
                          value={endpoint}
                          onChange={e => setEndpoint(e.target.value)}
                          className="w-full bg-[#08090C] border border-white/[0.08] rounded-lg pl-9 pr-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors font-mono"
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t border-white/[0.08]">
                    <button
                      onClick={() => connectMutation.mutate({ id: activeModal.id, key: apiKey, ep: endpoint })}
                      disabled={connectMutation.isPending || !apiKey.trim()}
                      className="zd-btn zd-btn-primary w-full py-2.5 flex items-center justify-center space-x-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {connectMutation.isPending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                      <span>{connectMutation.isPending ? "Validating credentials..." : "Validate & Connect"}</span>
                    </button>
                    <p className="text-center text-[11px] text-slate-500 mt-3 leading-relaxed">
                      ZeroDrift validates credentials against the provider API. Keys are held in-memory and not stored persistently.
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
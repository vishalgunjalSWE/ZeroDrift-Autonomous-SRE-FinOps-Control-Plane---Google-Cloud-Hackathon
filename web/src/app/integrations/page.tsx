"use client";

import { Boxes, Cloud, CheckCircle, XCircle, Settings2, X, Key, Link as LinkIcon, RefreshCw, Trash2, Check, AlertCircle, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const BACKEND = "http://localhost:8000";

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
  const integrations = INTEGRATIONS_CONFIG.map(cfg => ({
    ...cfg,
    status: backendStatus[cfg.id]?.status === "CONNECTED" ? "CONNECTED" : "NOT_CONFIGURED",
    detail: backendStatus[cfg.id]?.detail ?? "",
    connected_at: backendStatus[cfg.id]?.connected_at ?? "",
  }));

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
      <div className="border-b border-white/10 pb-6 shrink-0 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center">
            <Boxes className="w-6 h-6 mr-3 text-violet" />
            Integrations
          </h1>
          <p className="text-muted text-[13px] mt-2">
            Connect ZeroDrift to your existing cloud, VCS, and observability stack.
          </p>
        </div>
        <div className="text-[11px] text-muted font-mono flex items-center space-x-2 bg-white/[0.02] border border-white/10 px-3 py-1.5 rounded-lg">
          <span className={`w-1.5 h-1.5 rounded-full ${statusLoading ? "bg-amber-400 animate-pulse" : "bg-emerald"}`} />
          <span>{Object.keys(backendStatus).filter(k => backendStatus[k]?.status === "CONNECTED").length} / {integrations.length} connected — credentials validated live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {integrations.map((integration) => (
          <div key={integration.id} className="glass-card rounded-xl p-6 border border-white/5 flex flex-col group hover:bg-white/[0.02] transition-colors relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                {integration.icon}
              </div>
              <button onClick={() => openConfig(integration)} className="text-muted hover:text-white transition-colors">
                <Settings2 className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-lg font-semibold text-white mb-1">{integration.name}</h3>
            <p className="text-xs text-muted font-mono mb-2">{integration.type}</p>
            {integration.detail && integration.status === "CONNECTED" && (
              <p className="text-[10px] text-muted/70 truncate mb-3 font-mono">{integration.detail}</p>
            )}

            <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
              {integration.status === "CONNECTED" ? (
                <span className="flex items-center text-xs font-bold text-emerald tracking-widest uppercase">
                  <CheckCircle className="w-4 h-4 mr-2" /> Connected
                </span>
              ) : (
                <span className="flex items-center text-xs font-bold text-muted tracking-widest uppercase">
                  <XCircle className="w-4 h-4 mr-2 opacity-50" /> Not Configured
                </span>
              )}

              <button
                onClick={() => openConfig(integration)}
                className={`px-4 py-1.5 rounded text-xs font-bold transition-colors ${
                  integration.status === "CONNECTED"
                    ? "bg-white/5 text-white hover:bg-white/10"
                    : "bg-azure text-white hover:bg-azure/80"
                }`}
              >
                {integration.status === "CONNECTED" ? "Manage" : "Connect"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Slide-over Configuration Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={closeModal} />

          <div className="relative w-full max-w-md h-full bg-[#0A0A0B] border-l border-white/10 shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                  {activeModal.icon}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white leading-tight">{activeModal.name}</h2>
                  <p className="text-xs text-muted">{activeModal.type}</p>
                </div>
              </div>
              <button onClick={closeModal} className="p-2 text-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* Success state after connect */}
              {successDetail && (
                <div className="p-4 bg-emerald/10 border border-emerald/20 rounded-xl flex items-start space-x-3">
                  <Check className="w-5 h-5 text-emerald shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-bold text-emerald">Credential Validated ✓</div>
                    <div className="text-xs text-emerald/80 mt-1 font-mono">{successDetail}</div>
                  </div>
                </div>
              )}

              {/* Error banner */}
              {errorMsg && (
                <div className="p-4 bg-infrared/10 border border-infrared/20 rounded-xl flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-infrared shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-bold text-infrared">Validation Failed</div>
                    <div className="text-xs text-infrared/80 mt-1">{errorMsg}</div>
                  </div>
                </div>
              )}

              {activeModal.status === "CONNECTED" && !successDetail ? (
                /* CONNECTED STATE */
                <div className="space-y-4">
                  <div className="p-4 bg-emerald/10 border border-emerald/20 rounded-xl flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-emerald shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-bold text-emerald">Live Connection Active</div>
                      <div className="text-xs text-emerald/80 mt-1 font-mono">{activeModal.detail || "Credentials verified via API."}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => testMutation.mutate(activeModal.id)}
                    className="w-full flex items-center justify-center space-x-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-semibold text-white transition-colors"
                  >
                    {testResult === "testing" ? <RefreshCw className="w-4 h-4 animate-spin" /> : testResult === "ok" ? <Check className="w-4 h-4 text-emerald" /> : <LinkIcon className="w-4 h-4" />}
                    <span>{testResult === "testing" ? "Testing..." : testResult === "ok" ? "Connection OK" : "Test Connection"}</span>
                  </button>

                  <button
                    onClick={() => disconnectMutation.mutate(activeModal.id)}
                    className="w-full flex items-center justify-center space-x-2 py-3 bg-infrared/10 hover:bg-infrared/20 border border-infrared/20 rounded-lg text-sm font-semibold text-infrared transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Disconnect Integration</span>
                  </button>
                </div>
              ) : !successDetail ? (
                /* NOT CONFIGURED STATE */
                <div className="space-y-5">
                  {/* How to get key hint */}
                  <div className="flex items-start space-x-2 p-3 bg-azure/5 border border-azure/20 rounded-lg">
                    <Info className="w-4 h-4 text-azure shrink-0 mt-0.5" />
                    <div className="text-xs text-muted">
                      {activeModal.hint}
                      {" · "}
                      <a href={activeModal.docsUrl} target="_blank" rel="noreferrer" className="text-azure hover:underline">Docs ↗</a>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#EDEDED]">
                      {activeModal.id === "gcp" ? "Service Account JSON" : "API Key / Token"}
                    </label>
                    <div className="relative">
                      <Key className="w-4 h-4 absolute left-3 top-3 text-muted" />
                      {activeModal.id === "gcp" ? (
                        <textarea
                          rows={5}
                          placeholder={activeModal.placeholder}
                          value={apiKey}
                          onChange={e => { setApiKey(e.target.value); setErrorMsg(""); }}
                          className="w-full bg-white/[0.02] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-azure transition-colors font-mono resize-none"
                        />
                      ) : (
                        <input
                          type="password"
                          placeholder={activeModal.placeholder}
                          value={apiKey}
                          onChange={e => { setApiKey(e.target.value); setErrorMsg(""); }}
                          className="w-full bg-white/[0.02] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-azure transition-colors"
                        />
                      )}
                    </div>
                  </div>

                  {activeModal.endpointLabel && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[#EDEDED]">{activeModal.endpointLabel}</label>
                      <div className="relative">
                        <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                        <input
                          type="text"
                          placeholder={activeModal.endpointPlaceholder}
                          value={endpoint}
                          onChange={e => setEndpoint(e.target.value)}
                          className="w-full bg-white/[0.02] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-azure transition-colors"
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-white/10">
                    <button
                      onClick={() => connectMutation.mutate({ id: activeModal.id, key: apiKey, ep: endpoint })}
                      disabled={connectMutation.isPending || !apiKey.trim()}
                      className="w-full flex items-center justify-center space-x-2 py-3 bg-azure hover:bg-azure/80 rounded-lg text-sm font-semibold text-white transition-colors shadow-[0_0_15px_rgba(0,112,243,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {connectMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      <span>{connectMutation.isPending ? "Validating credentials..." : "Validate & Connect"}</span>
                    </button>
                    <p className="text-center text-[10px] text-muted mt-3">
                      ZeroDrift calls the provider's API directly to verify your credentials. Keys are stored in memory only and never written to disk.
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
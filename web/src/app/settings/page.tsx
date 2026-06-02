"use client";

import { Settings, Bell, Lock, Key, CreditCard, Save, Loader2, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const [workspaceName, setWorkspaceName] = useState("");
  const [dataRetention, setDataRetention] = useState("30 Days");
  
  const router = useRouter();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/workspace-settings");
        if (res.ok) {
          const data = await res.json();
          setWorkspaceName(data.workspaceName);
          setDataRetention(data.dataRetention);
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch("http://localhost:8000/api/v1/workspace-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceName, dataRetention }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("DANGER: Are you absolutely sure you want to delete this workspace? This is irreversible.")) return;
    
    setDeleting(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/workspace", {
        method: "DELETE",
      });
      if (res.ok) {
        alert("Workspace deleted. You will now be redirected.");
        router.push("/login");
      }
    } catch (err) {
      console.error("Failed to delete workspace:", err);
      setDeleting(false);
    }
  };

  return (
    <main className="p-6 lg:p-10 max-w-[1800px] mx-auto w-full h-full flex flex-col space-y-8">
      <div className="border-b border-white/10 pb-6 shrink-0 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center">
            <Settings className="w-6 h-6 mr-3 text-muted" />
            Workspace Settings
          </h1>
          <p className="text-muted text-[13px] mt-2">Manage global configurations, notifications, and security defaults.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading || saving}
          className="px-6 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 bg-azure text-white hover:bg-azure/80 transition-all shadow-[0_0_15px_rgba(0,112,243,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saveSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{saving ? "Saving..." : saveSuccess ? "Saved!" : "Save Changes"}</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1">
        {/* Settings Navigation */}
        <div className="w-full lg:w-64 shrink-0 space-y-1">
          <button 
            onClick={() => setActiveTab("general")}
            className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === "general" ? "bg-white/10 text-white" : "text-muted hover:bg-white/5 hover:text-[#EDEDED]"}`}
          >
            <Settings className="w-4 h-4 mr-3" /> General
          </button>
          <button 
            onClick={() => setActiveTab("notifications")}
            className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === "notifications" ? "bg-white/10 text-white" : "text-muted hover:bg-white/5 hover:text-[#EDEDED]"}`}
          >
            <Bell className="w-4 h-4 mr-3" /> Notifications
          </button>
          <button 
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === "security" ? "bg-white/10 text-white" : "text-muted hover:bg-white/5 hover:text-[#EDEDED]"}`}
          >
            <Lock className="w-4 h-4 mr-3" /> Security
          </button>
          <button 
            onClick={() => setActiveTab("api-keys")}
            className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === "api-keys" ? "bg-white/10 text-white" : "text-muted hover:bg-white/5 hover:text-[#EDEDED]"}`}
          >
            <Key className="w-4 h-4 mr-3" /> API Keys
          </button>
          <button 
            onClick={() => setActiveTab("billing")}
            className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === "billing" ? "bg-white/10 text-white" : "text-muted hover:bg-white/5 hover:text-[#EDEDED]"}`}
          >
            <CreditCard className="w-4 h-4 mr-3" /> Billing
          </button>
        </div>

        {/* Settings Content */}
        <div className="flex-1 glass-card border border-white/5 rounded-xl p-8 relative">
          {loading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0a0a0b]/80 backdrop-blur-sm rounded-xl">
              <Loader2 className="w-8 h-8 animate-spin text-azure" />
            </div>
          )}

          {activeTab === "general" && !loading && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Workspace Name</h3>
                <p className="text-xs text-muted mb-3">This is your organization's display name.</p>
                <input 
                  type="text" 
                  value={workspaceName} 
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-azure transition-colors" 
                />
              </div>
              <div className="pt-6 border-t border-white/5">
                <h3 className="text-lg font-semibold text-white mb-1">Data Retention</h3>
                <p className="text-xs text-muted mb-3">How long to keep audit logs and historical topology snapshots.</p>
                <select 
                  value={dataRetention}
                  onChange={(e) => setDataRetention(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-azure transition-colors appearance-none"
                >
                  <option value="30 Days">30 Days</option>
                  <option value="90 Days (Recommended)">90 Days (Recommended)</option>
                  <option value="1 Year">1 Year</option>
                  <option value="Indefinite">Indefinite</option>
                </select>
              </div>
              <div className="pt-6 border-t border-white/5">
                <h3 className="text-lg font-semibold text-infrared mb-1">Danger Zone</h3>
                <p className="text-xs text-muted mb-3">Irreversible and destructive actions.</p>
                <button 
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 bg-infrared/10 text-infrared border border-infrared/20 rounded-lg text-sm font-bold hover:bg-infrared/20 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {deleting ? "Deleting..." : "Delete Workspace"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "notifications" && !loading && (
            <div className="text-muted text-sm flex items-center">
              Configure Slack and Email routing preferences here.
            </div>
          )}

          {activeTab === "security" && !loading && (
            <div className="text-muted text-sm flex items-center">
              Configure SSO/SAML integrations and session timeouts here.
            </div>
          )}

          {activeTab === "api-keys" && !loading && (
            <div className="text-muted text-sm flex items-center">
              Generate programmatic personal access tokens (PATs) for the ZeroDrift API.
            </div>
          )}

          {activeTab === "billing" && !loading && (
            <div className="text-muted text-sm flex items-center">
              You are currently on the Enterprise plan.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
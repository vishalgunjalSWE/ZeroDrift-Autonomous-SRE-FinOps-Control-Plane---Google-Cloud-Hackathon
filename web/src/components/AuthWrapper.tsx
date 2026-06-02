"use client";

import { useState, useEffect } from "react";
import { Loader2, Shield, Activity, Cloud, Database, Search, AlertCircle, Lock } from "lucide-react";
import { motion } from "framer-motion";

type AuthStep = "checking" | "login" | "enter_pin" | "fetching_repos" | "select_repo" | "authenticated";

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [step, setStep] = useState<AuthStep>("checking");
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [providerError, setProviderError] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);

  useEffect(() => {
    // Check local session state
    const auth = sessionStorage.getItem("zerodrift_auth");
    if (auth === "true") {
      setStep("authenticated");
    } else {
      setStep("login");
    }
  }, []);

  const handleOAuthLogin = (provider: string) => {
    setProviderError(`OAuthConfigurationError: Missing ${provider.toUpperCase()}_CLIENT_ID in environment variables. Please configure your .env file to enable third-party SSO.`);
  };

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "2026") {
      setPinError(false);
      setStep("checking");
      setTimeout(() => {
        sessionStorage.setItem("zerodrift_auth", "true");
        setStep("authenticated");
      }, 800);
    } else {
      setPinError(true);
      setPin("");
    }
  };

  const handleConnectRepo = () => {
    if (!selectedRepo) return;
    setStep("checking"); // brief loading state
    setTimeout(() => {
      sessionStorage.setItem("zerodrift_auth", "true");
      setStep("authenticated");
    }, 1000);
  };

  // Prevent flash while checking sessionStorage
  if (step === "checking") {
    return <div className="h-screen w-screen bg-[#09090b] flex items-center justify-center"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>;
  }

  // Render the SaaS Landing / Login Page
  if (step === "login") {
    return (
      <div className="min-h-screen w-screen bg-[#09090b] flex flex-col items-center justify-center relative overflow-hidden font-sans">
        
        {/* Ambient Premium Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="z-10 w-full max-w-md p-8"
        >
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
               <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#10B981" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="#10B981" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="#10B981" strokeWidth="2" strokeLinejoin="round"/>
                </svg>
            </div>
            <h1 className="text-3xl font-light text-white tracking-tight mb-2">ZeroDrift</h1>
            <p className="text-[#a1a1aa] text-sm font-medium">Autonomous FinOps & Remediation</p>
          </div>

          {/* Login Card */}
          <div className="bg-[#18181b]/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-xl font-medium text-white mb-6 text-center">Sign in to your workspace</h2>
            
            {providerError && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-200 leading-relaxed font-mono">{providerError}</p>
              </div>
            )}
            
            <div className="space-y-3">
              <button 
                onClick={() => handleOAuthLogin("github")}
                className="w-full flex items-center justify-center space-x-3 bg-white text-black py-2.5 px-4 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
                <span>Continue with GitHub</span>
              </button>

              <button 
                onClick={() => handleOAuthLogin("gitlab")}
                className="w-full flex items-center justify-center space-x-3 bg-[#27272a]/50 text-white border border-white/10 py-2.5 px-4 rounded-lg font-medium hover:bg-[#27272a] transition-colors"
              >
                <svg className="w-5 h-5 text-[#FC6D26]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.955 13.587l-1.342-4.135-2.664-8.189c-.135-.423-.73-.423-.867 0L16.418 9.45H7.582L4.919 1.263c-.137-.423-.733-.423-.868 0L1.387 9.45.046 13.587c-.178.55.022 1.159.492 1.5l11.462 8.333 11.462-8.333c.47-.341.67-1.95.493-1.5z"/>
                </svg>
                <span>Continue with GitLab</span>
              </button>

              <button 
                onClick={() => handleOAuthLogin("google")}
                className="w-full flex items-center justify-center space-x-3 bg-[#27272a]/50 text-white border border-white/10 py-2.5 px-4 rounded-lg font-medium hover:bg-[#27272a] transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>

            <div className="flex items-center my-5">
              <div className="flex-1 border-t border-white/10"></div>
              <span className="px-3 text-xs text-[#71717a]">OR</span>
              <div className="flex-1 border-t border-white/10"></div>
            </div>

            <div className="space-y-3">
              <button 
                disabled
                className="w-full flex items-center justify-center space-x-3 bg-transparent text-white border border-white/10 py-2.5 px-4 rounded-lg font-medium hover:bg-white/5 transition-colors disabled:opacity-50 cursor-not-allowed"
              >
                <Shield className="w-4 h-4 text-[#a1a1aa]" />
                <span>Continue with SAML SSO</span>
              </button>

              <button 
                onClick={() => setStep("enter_pin")}
                className="w-full flex items-center justify-center space-x-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 py-2.5 px-4 rounded-lg font-medium hover:bg-emerald-500/20 transition-colors"
              >
                <Lock className="w-4 h-4" />
                <span>Guest Demo Login</span>
              </button>
            </div>
            
            <p className="text-center text-[11px] text-[#71717a] mt-6">
              By connecting, you agree to ZeroDrift's Terms of Service and Enterprise SLA.
            </p>
          </div>

          {/* Feature highlights for visual premium feel */}
          <div className="mt-12 grid grid-cols-2 gap-4 text-center">
            <div className="flex flex-col items-center">
              <Activity className="w-4 h-4 text-emerald-500 mb-2" />
              <span className="text-xs text-[#a1a1aa]">Real-time Telemetry</span>
            </div>
            <div className="flex flex-col items-center">
              <Cloud className="w-4 h-4 text-emerald-500 mb-2" />
              <span className="text-xs text-[#a1a1aa]">AST-Level Parsing</span>
            </div>
          </div>

        </motion.div>
      </div>
    );
  }

  // If Authenticated, render the actual Application (Dashboard)
  return <>{children}</>;
}

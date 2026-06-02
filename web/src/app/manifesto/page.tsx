"use client";

import { motion } from "framer-motion";
import { 
  TerminalSquare, GitBranch, Cpu, UserCheck, 
  ShieldAlert, Zap, Activity, Shield,
  Brain, Cloud, Network
} from "lucide-react";

export default function ManifestoPage() {
  const STAGGER_CONTAINER = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const FADE_UP = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  };

  const SCALE_IN = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="min-h-full bg-obsidian text-[#EDEDED] font-sans selection:bg-azure/30 selection:text-white pb-32 overflow-x-hidden">
      
      {/* Dynamic Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-azure/10 blur-[120px] rounded-full pointer-events-none opacity-50" />

      {/* Container */}
      <div className="max-w-4xl mx-auto px-6 pt-32 relative z-10">
        
        {/* 1. Hero / Opening Statement */}
        <motion.section 
          initial="hidden" 
          animate="visible" 
          variants={STAGGER_CONTAINER}
          className="mb-32 text-center flex flex-col items-center"
        >
          <motion.div variants={FADE_UP} className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold uppercase tracking-wider text-azure mb-8">
            <Zap className="w-3.5 h-3.5" />
            <span>The ZeroDrift Manifesto</span>
          </motion.div>
          <motion.h1 variants={FADE_UP} className="text-5xl md:text-6xl font-bold tracking-tight text-white mb-8 leading-[1.1] max-w-3xl">
            Modern infrastructure is too complex to manage manually.
          </motion.h1>
          <motion.p variants={FADE_UP} className="text-xl text-muted leading-relaxed max-w-2xl mb-12">
            ZeroDrift is an autonomous operations platform designed to eliminate SRE fatigue and cloud waste. By combining deterministic remediation with intelligent automation, we are building the new standard for self-healing environments.
          </motion.p>

          {/* Hackathon Callout Banner */}
          <motion.div variants={FADE_UP} className="w-full max-w-3xl p-6 rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-orange-500/10 border border-white/10 flex flex-col md:flex-row items-center justify-between text-left gap-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="flex-1 relative z-10">
              <div className="text-azure font-bold text-[13px] mb-2 uppercase tracking-widest flex items-center space-x-2">
                <Cloud className="w-4 h-4" />
                <span>Google Cloud Rapid Agent Hackathon</span>
              </div>
              <div className="text-white font-semibold text-xl mb-1">Building agents for real-world challenges</div>
              <div className="text-[#A0A0A0] text-[15px]">AI that doesn't just provide answers—it helps you take action.</div>
            </div>
            <div className="shrink-0 flex items-center space-x-4 relative z-10 bg-black/20 p-3 rounded-xl border border-white/5">
               <div className="flex flex-col items-center justify-center">
                 <Brain className="w-6 h-6 text-purple-400 mb-1" />
                 <span className="text-[10px] font-bold text-purple-400/80 uppercase tracking-wider">Gemini</span>
               </div>
               <div className="w-[1px] h-8 bg-white/10" />
               <div className="flex flex-col items-center justify-center">
                 <Network className="w-6 h-6 text-orange-400 mb-1" />
                 <span className="text-[10px] font-bold text-orange-400/80 uppercase tracking-wider">MCP</span>
               </div>
            </div>
          </motion.div>
        </motion.section>

        {/* 2. The Reality of Modern Infrastructure */}
        <motion.section 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-100px" }}
          variants={FADE_UP}
          className="mb-24"
        >
          <div className="bg-[#111113] border border-white/5 rounded-3xl p-10 md:p-14 relative overflow-hidden shadow-2xl">
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-rose-500/10 blur-[100px] rounded-full pointer-events-none" />
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center space-x-3">
              <ShieldAlert className="w-6 h-6 text-rose-400" />
              <span>The Reality of Modern Infrastructure</span>
            </h2>
            <div className="space-y-6 text-[15px] leading-relaxed text-[#A0A0A0] max-w-3xl">
              <p>
                We are building in an era of unprecedented cloud sprawl. Kubernetes clusters, sprawling Terraform state files, alert fatigue, and configuration drift are no longer edge cases—they are the default reality for engineering teams.
              </p>
              <p>
                As infrastructure scales, operational toil scales non-linearly. The result is a reactive management model driven by endless dashboards, oversized cloud resources, and fragmented tooling.
              </p>
              <p className="text-white font-medium">
                Late-night incidents and manual remediations have become the accepted cost of doing business. Engineers are spending their cognitive energy responding to alerts that systems should ideally resolve on their own.
              </p>
            </div>
          </div>
        </motion.section>

        {/* 3. Why ZeroDrift Exists (Banners) */}
        <motion.section 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-100px" }}
          variants={STAGGER_CONTAINER}
          className="mb-32"
        >
          <motion.div variants={FADE_UP} className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-white">Why ZeroDrift Exists</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div variants={SCALE_IN} className="p-8 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 shadow-lg">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10">
                <Activity className="w-5 h-5 text-muted" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Observability is Reactive</h3>
              <p className="text-[14.5px] text-[#A0A0A0] leading-relaxed">
                Dashboards and alerts are excellent at telling you when something is broken, but they do nothing to fix it. Infrastructure operations require intelligent, proactive automation.
              </p>
            </motion.div>
            <motion.div variants={SCALE_IN} className="p-8 rounded-2xl bg-gradient-to-br from-azure/10 to-transparent border border-azure/20 relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-azure/20 blur-[60px]" />
              <div className="w-12 h-12 rounded-full bg-azure/20 flex items-center justify-center mb-6 relative z-10 border border-azure/30">
                <Shield className="w-5 h-5 text-azure" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3 relative z-10">Human-in-the-Loop</h3>
              <p className="text-[14.5px] text-azure/80 leading-relaxed relative z-10">
                Total automation without trust is chaos. ZeroDrift relies on safe automation, explainable remediation steps, and deterministic AI to build absolute operational trust.
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* 4. Architectural Principles (Cards) */}
        <motion.section 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-100px" }}
          variants={STAGGER_CONTAINER}
          className="mb-32"
        >
          <motion.div variants={FADE_UP} className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Architectural Principles</h2>
            <p className="text-muted text-lg">The engineering decisions that guarantee safety and scale.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Deterministic Orchestration",
                desc: "We use strict AST parsing of Terraform instead of raw LLM edits. LLMs are powerful for reasoning, but direct code generation on infrastructure requires deterministic guarantees.",
                icon: <TerminalSquare className="w-5 h-5 text-indigo-400" />
              },
              {
                title: "Git-based Remediation",
                desc: "Every change must be auditable, reviewable, and reversible. All proposed remediation patches are pushed as isolated Git branches (MRs/PRs) rather than direct state manipulation.",
                icon: <GitBranch className="w-5 h-5 text-emerald-400" />
              },
              {
                title: "FastAPI & SSE",
                desc: "Our backend is built on FastAPI for rigorous typing and high concurrency. We use Server-Sent Events (SSE) instead of polling to deliver real-time streams without crushing network overhead.",
                icon: <Cpu className="w-5 h-5 text-amber-400" />
              },
              {
                title: "Human Approvals",
                desc: "AI should propose the solution, calculate the blast radius, and write the patch. But before touching production state, a human must approve it. Trust is earned, not assumed.",
                icon: <UserCheck className="w-5 h-5 text-rose-400" />
              }
            ].map((principle, idx) => (
              <motion.div 
                key={idx}
                variants={SCALE_IN}
                className="group relative p-8 rounded-2xl bg-[#111113] border border-white/5 hover:border-white/15 transition-all duration-300 hover:-translate-y-1 shadow-lg"
              >
                <div className="flex items-start space-x-4">
                  <div className="mt-1 p-2 rounded-lg bg-white/5 group-hover:scale-110 transition-transform shadow-inner border border-white/5">
                    {principle.icon}
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-2 text-[15px] tracking-wide">{principle.title}</h3>
                    <p className="text-[14px] text-[#A0A0A0] leading-relaxed">{principle.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 5. The Intelligence Engine (Hackathon Submission Context) */}
        <motion.section 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-100px" }}
          variants={STAGGER_CONTAINER}
          className="mb-32"
        >
          <motion.div variants={FADE_UP} className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">The Intelligence Engine</h2>
            <p className="text-muted text-lg">Built for the Google Cloud Rapid Agent Hackathon.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Gemini */}
            <motion.div variants={SCALE_IN} className="p-8 rounded-2xl bg-gradient-to-br from-[#111113] to-[#1A1A1E] border border-white/5 shadow-lg relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20 shadow-inner">
                <Brain className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-white font-bold mb-3 text-[15px] tracking-wide relative z-10">Gemini 3 Reasoning</h3>
              <p className="text-[14px] text-[#A0A0A0] leading-relaxed relative z-10">
                We utilize Gemini's multi-step reasoning capabilities to analyze complex Terraform drift, evaluate blast radius, and formulate deterministic remediation plans without hallucinations.
              </p>
            </motion.div>

            {/* Google Cloud Agent Builder */}
            <motion.div variants={SCALE_IN} className="p-8 rounded-2xl bg-gradient-to-br from-[#111113] to-[#1A1A1E] border border-white/5 shadow-lg relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-azure/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-12 h-12 rounded-lg bg-azure/10 flex items-center justify-center mb-6 border border-azure/20 shadow-inner">
                <Cloud className="w-6 h-6 text-azure" />
              </div>
              <h3 className="text-white font-bold mb-3 text-[15px] tracking-wide relative z-10">Google Cloud Agent Builder</h3>
              <p className="text-[14px] text-[#A0A0A0] leading-relaxed relative z-10">
                Orchestrating our autonomous agent workflows. Agent Builder allows ZeroDrift to maintain deep context, securely access enterprise state, and execute multi-step operations reliably.
              </p>
            </motion.div>

            {/* MCP & Partner Integration */}
            <motion.div variants={SCALE_IN} className="p-8 rounded-2xl bg-gradient-to-br from-[#111113] to-[#1A1A1E] border border-white/5 shadow-lg relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-6 border border-orange-500/20 shadow-inner">
                <Network className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-white font-bold mb-3 text-[15px] tracking-wide relative z-10">GitLab MCP Integration</h3>
              <p className="text-[14px] text-[#A0A0A0] leading-relaxed relative z-10">
                Powered by the Model Context Protocol (MCP). ZeroDrift natively integrates with GitLab to open automated Merge Requests, bringing "Partner Power" to autonomous GitOps workflows.
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* 5. The Architect */}
        <motion.section 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-100px" }}
          variants={FADE_UP}
          className="mb-32 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent rounded-3xl -z-10 border-t border-white/5" />
          <div className="p-10 md:p-14">
            <div className="flex items-center space-x-5 mb-12">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-azure via-violet to-fuchsia-600 p-[2px] shadow-lg shadow-azure/20">
                <div className="w-full h-full rounded-full bg-[#0A0A0B] flex items-center justify-center text-xl font-bold text-white tracking-wider">
                  VG
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">The Architect</h2>
                <p className="text-[15px] font-medium text-azure">Vishal Dilip Gunjal</p>
              </div>
            </div>
            
            <div className="space-y-6 text-[15px] leading-relaxed text-[#A0A0A0] pl-6 md:pl-16 border-l-2 border-white/10">
              <p>ZeroDrift started with a simple observation:</p>
              <p className="text-white font-semibold text-lg border-l-4 border-azure pl-5 py-2 -ml-[26px] md:-ml-[66px] bg-azure/[0.03] rounded-r-lg shadow-sm">
                Modern infrastructure is becoming too complex to manage manually.
              </p>
              <p>During my MCA journey and my internship at GE Aerospace, I spent a lot of time around cloud systems, operational tooling, and distributed infrastructure. The deeper I went into Kubernetes, Terraform, CI/CD, observability, and cloud-native systems, the more I noticed the same pattern everywhere:</p>
              <p className="text-white font-medium">Infrastructure keeps scaling.<br/>Operational complexity scales even faster.</p>
              <p>Teams today manage Kubernetes clusters, Terraform repositories, deployment pipelines, observability stacks, cloud permissions, and multi-cloud environments across constantly changing systems. But most operational workflows are still reactive.</p>
              <p>Engineers spend hours investigating alerts, fixing configuration drift, reviewing dashboards, resizing cloud resources, tracing failures, and manually responding to production issues. A lot of this work is repetitive, noisy, and mentally exhausting.</p>
              <p>While participating in cloud-native and infrastructure communities around Pune — including CNCF, AWS, GitOps, and platform engineering meetups — I kept hearing the same operational pain points from engineers everywhere:</p>
              <p className="text-white font-medium bg-white/5 py-4 px-6 rounded-lg border border-white/10 -ml-[24px] md:-ml-[64px] shadow-sm grid grid-cols-2 gap-4">
                <span>• Too many alerts.</span>
                <span>• Too much operational toil.</span>
                <span>• Too much cloud waste.</span>
                <span>• Too many disconnected systems.</span>
              </p>
              <p>That experience shaped the direction behind ZeroDrift.</p>
              <p>I wanted to explore a different operational model. Not replacing engineers. Not removing human oversight. But reducing repetitive operational burden through safe, explainable, and deterministic automation.</p>
              <p>ZeroDrift is my attempt at building that system. A platform that continuously understands infrastructure state, detects inefficiencies, reasons about operational risk, and helps engineers remediate problems safely through structured workflows.</p>
              <p className="text-white font-medium border-l-4 border-violet-500 pl-5 py-2 -ml-[26px] md:-ml-[66px] bg-violet-500/10 rounded-r-lg shadow-sm">
                The goal is not autonomous chaos.<br/>
                The goal is operational clarity, infrastructure trust, and giving engineers more time to focus on building reliable systems instead of constantly cleaning up operational drift.
              </p>
            </div>
          </div>
        </motion.section>

        {/* 6. Closing Philosophy */}
        <motion.section 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-100px" }}
          variants={FADE_UP}
          className="pb-32 text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/[0.03] mb-8 border border-white/5 shadow-inner">
            <span className="text-2xl">🌍</span>
          </div>
          <p className="text-2xl md:text-3xl text-white font-semibold leading-snug max-w-3xl mx-auto tracking-tight">
            "The goal is not to remove humans from operations. <br className="hidden md:block"/><br className="md:hidden"/>
            <span className="text-muted font-normal italic">The goal is to remove unnecessary operational exhaustion.</span>"
          </p>
        </motion.section>

      </div>
    </div>
  );
}

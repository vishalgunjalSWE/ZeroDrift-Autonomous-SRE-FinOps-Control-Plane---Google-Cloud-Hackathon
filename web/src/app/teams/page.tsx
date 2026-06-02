"use client";

import { useState, useEffect } from "react";
import { Users, UserPlus, Shield, Mail, CheckCircle2, Trash2, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TeamsPage() {
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: "", email: "", role: "Viewer" });
  const [inviting, setInviting] = useState(false);

  const fetchTeams = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/teams");
      if (res.ok) {
        const data = await res.json();
        setTeamMembers(data.teams);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inviteForm),
      });
      if (res.ok) {
        setIsInviteOpen(false);
        setInviteForm({ name: "", email: "", role: "Viewer" });
        fetchTeams();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/v1/teams/${id}`, { method: "DELETE" });
      if (res.ok) fetchTeams();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="p-6 lg:p-10 max-w-[1800px] mx-auto w-full h-full flex flex-col space-y-8">
      <div className="border-b border-white/10 pb-6 shrink-0 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center">
            <Users className="w-6 h-6 mr-3 text-azure" />
            Team Access
          </h1>
          <p className="text-muted text-[13px] mt-2">Manage Role-Based Access Control (RBAC) and FinOps approvers.</p>
        </div>
        <button 
          onClick={() => setIsInviteOpen(true)}
          className="px-6 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 bg-white text-black hover:bg-white/90 transition-all shadow-[0_0_15px_rgba(255,255,255,0.3)]"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Member</span>
        </button>
      </div>

      <div className="glass-card rounded-xl border border-white/5 overflow-hidden flex-1 relative">
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0a0a0b]/80 backdrop-blur-sm">
            <Loader2 className="w-8 h-8 animate-spin text-azure" />
          </div>
        )}
        <div className="overflow-x-auto h-full max-h-[800px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5 text-xs font-semibold uppercase tracking-wider text-muted sticky top-0 backdrop-blur-md z-10">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role / Permissions</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {teamMembers.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${user.color}`}>
                        {user.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-[#EDEDED]">{user.name}</div>
                        <div className="text-xs text-muted font-mono">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Shield className={`w-4 h-4 ${user.role === "SRE Admin" ? "text-azure" : "text-muted"}`} />
                      <span className={`text-sm ${user.role === "SRE Admin" ? "text-azure font-medium" : "text-[#EDEDED]"}`}>
                        {user.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.status === "Active" ? (
                      <span className="inline-flex items-center text-xs font-bold text-emerald tracking-widest uppercase">
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-xs font-bold text-amber-500 tracking-widest uppercase">
                        <Mail className="w-4 h-4 mr-2" /> Invited
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleRemove(user.id)}
                      className="p-2 rounded-lg text-muted hover:text-red-400 hover:bg-white/5 transition-colors"
                      title="Remove Member"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {teamMembers.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-muted">
                    No team members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isInviteOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#18181b] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <button
                onClick={() => setIsInviteOpen(false)}
                className="absolute top-4 right-4 text-muted hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <UserPlus className="w-5 h-5 mr-2 text-azure" />
                Invite Team Member
              </h2>

              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    required
                    value={inviteForm.name}
                    onChange={(e) => setInviteForm({...inviteForm, name: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:border-azure focus:ring-1 focus:ring-azure transition-all"
                    placeholder="e.g. Jane Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    required
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:border-azure focus:ring-1 focus:ring-azure transition-all"
                    placeholder="jane@company.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1 uppercase tracking-wider">Role</label>
                  <select
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm({...inviteForm, role: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-azure focus:ring-1 focus:ring-azure transition-all appearance-none"
                  >
                    <option value="Viewer">Viewer</option>
                    <option value="Platform Engineer">Platform Engineer</option>
                    <option value="FinOps Approver">FinOps Approver</option>
                    <option value="SRE Admin">SRE Admin</option>
                  </select>
                </div>
                
                <div className="pt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsInviteOpen(false)}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-muted hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviting}
                    className="px-6 py-2 rounded-lg text-sm font-semibold bg-azure text-white hover:bg-azure/90 transition-all flex items-center shadow-[0_0_15px_rgba(0,112,243,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {inviting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Send Invite
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
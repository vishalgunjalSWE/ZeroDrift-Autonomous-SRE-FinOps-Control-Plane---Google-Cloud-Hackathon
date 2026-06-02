import { AuditLedger } from "@/components/AuditLedger";

export default function Page() {
  return (
    <main className="p-6 lg:p-10 max-w-[1800px] mx-auto w-full h-full">
      <div className="mb-8 border-b border-white/10 pb-6">
        <h1 className="text-2xl font-bold text-white">Audit Ledger & PRs</h1>
        <p className="text-muted text-[13px]">Track all FinOps changes</p>
      </div>
      <AuditLedger />
    </main>
  );
}
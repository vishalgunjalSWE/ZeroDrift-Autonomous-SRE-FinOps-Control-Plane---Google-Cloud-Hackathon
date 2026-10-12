import { AuditLedger } from "@/components/AuditLedger";

export default function Page() {
  return (
    <main className="p-6 lg:p-10 max-w-[1800px] mx-auto w-full h-full flex flex-col">
      <AuditLedger />
    </main>
  );
}
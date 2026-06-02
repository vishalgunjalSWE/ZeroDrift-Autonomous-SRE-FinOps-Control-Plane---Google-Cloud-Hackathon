import { TerraformIDE } from "@/components/TerraformIDE";

export default function Page() {
  return (
    <main className="p-6 lg:p-10 max-w-[1800px] mx-auto w-full h-full flex flex-col">
      <div className="mb-8 border-b border-white/10 pb-6 shrink-0">
        <h1 className="text-2xl font-bold text-white">IaC Explorer</h1>
        <p className="text-muted text-[13px]">Edit Terraform state and preview plans</p>
      </div>
      <div className="flex-1 min-h-0">
        <TerraformIDE />
      </div>
    </main>
  );
}
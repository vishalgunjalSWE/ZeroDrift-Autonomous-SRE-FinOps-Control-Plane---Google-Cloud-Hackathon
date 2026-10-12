import { TerraformIDE } from "@/components/TerraformIDE";

export default function Page() {
  return (
    <main className="p-6 lg:p-8 max-w-[1800px] mx-auto w-full h-[calc(100vh-64px)] flex flex-col">
      <div className="flex-1 min-h-0">
        <TerraformIDE />
      </div>
    </main>
  );
}
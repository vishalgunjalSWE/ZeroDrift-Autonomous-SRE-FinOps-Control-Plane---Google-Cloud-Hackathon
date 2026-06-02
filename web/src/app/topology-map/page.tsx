import { TopologyGraph } from "@/components/TopologyGraph";

export default function Page() {
  return (
    <main className="p-6 lg:p-10 max-w-[1800px] mx-auto w-full h-full flex flex-col">
      <div className="mb-8 border-b border-white/10 pb-6 shrink-0">
        <h1 className="text-2xl font-bold text-white">Topology Map</h1>
        <p className="text-muted text-[13px]">Cloud architecture visualization</p>
      </div>
      <div className="flex-1 min-h-0 bg-[#161616] border border-white/5 rounded-xl overflow-hidden relative">
        <TopologyGraph />
      </div>
    </main>
  );
}
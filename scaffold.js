const fs = require('fs');
const path = require('path');

const routes = [
  { path: '/audit-logs', title: 'Audit Ledger & PRs', isPlaceholder: false },
  { path: '/iac-explorer', title: 'IaC Sandbox', isPlaceholder: false },
  { path: '/topology-map', title: 'Topology Map', isPlaceholder: false },
  { path: '/auto-remediations', title: 'Auto-Remediations' },
  { path: '/risk-events', title: 'Risk & Events' },
  { path: '/infrastructure-drift', title: 'Infrastructure Drift' },
  { path: '/policy-guardrails', title: 'Policy Guardrails' },
  { path: '/approvals', title: 'Approvals' },
  { path: '/greenops-impact', title: 'GreenOps Impact' },
  { path: '/cost-intelligence', title: 'Cost Intelligence' },
  { path: '/performance', title: 'Performance' },
  { path: '/slos-slis', title: 'SLOs & SLIs' },
  { path: '/incidents', title: 'Incidents' },
  { path: '/resource-inventory', title: 'Resource Inventory' },
  { path: '/integrations', title: 'Integrations' },
  { path: '/teams', title: 'Teams' },
  { path: '/settings', title: 'Settings' }
];

const appDir = path.join(process.cwd(), 'web', 'src', 'app');

routes.forEach(route => {
  const dirPath = path.join(appDir, route.path);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const pagePath = path.join(dirPath, 'page.tsx');
  if (!fs.existsSync(pagePath)) {
    let content = '';
    
    if (route.path === '/audit-logs') {
      content = 'import { AuditLedger } from "@/components/AuditLedger";\n\nexport default function Page() {\n  return (\n    <main className="p-6 lg:p-10 max-w-[1800px] mx-auto w-full h-full">\n      <div className="mb-8 border-b border-white/10 pb-6">\n        <h1 className="text-2xl font-bold text-white">Audit Ledger & PRs</h1>\n        <p className="text-muted text-[13px]">Track all FinOps changes</p>\n      </div>\n      <AuditLedger />\n    </main>\n  );\n}';
    } else if (route.path === '/iac-explorer') {
      content = 'import { TerraformIDE } from "@/components/TerraformIDE";\n\nexport default function Page() {\n  return (\n    <main className="p-6 lg:p-10 max-w-[1800px] mx-auto w-full h-full flex flex-col">\n      <div className="mb-8 border-b border-white/10 pb-6 shrink-0">\n        <h1 className="text-2xl font-bold text-white">IaC Explorer</h1>\n        <p className="text-muted text-[13px]">Edit Terraform state and preview plans</p>\n      </div>\n      <div className="flex-1 min-h-0">\n        <TerraformIDE />\n      </div>\n    </main>\n  );\n}';
    } else if (route.path === '/topology-map') {
      content = 'import { TopologyGraph } from "@/components/TopologyGraph";\n\nexport default function Page() {\n  return (\n    <main className="p-6 lg:p-10 max-w-[1800px] mx-auto w-full h-full flex flex-col">\n      <div className="mb-8 border-b border-white/10 pb-6 shrink-0">\n        <h1 className="text-2xl font-bold text-white">Topology Map</h1>\n        <p className="text-muted text-[13px]">Cloud architecture visualization</p>\n      </div>\n      <div className="flex-1 min-h-0 bg-[#161616] border border-white/5 rounded-xl overflow-hidden relative">\n        <TopologyGraph />\n      </div>\n    </main>\n  );\n}';
    } else {
      content = `export default function Page() {
  return (
    <main className="p-6 lg:p-10 max-w-[1800px] mx-auto w-full h-full flex flex-col items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-azure/10 text-azure rounded-xl flex items-center justify-center mx-auto mb-6 border border-azure/20 shadow-[0_0_15px_rgba(0,112,243,0.2)]">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">${route.title}</h1>
        <p className="text-muted text-sm leading-relaxed mb-8">
          This module is part of the ZeroDrift Enterprise suite. It is currently under active development.
        </p>
        <button className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-medium transition-colors text-[#EDEDED]">
          Request Early Access
        </button>
      </div>
    </main>
  );
}`;
    }

    fs.writeFileSync(pagePath, content);
  }
});
console.log('Routes scaffolded successfully!');

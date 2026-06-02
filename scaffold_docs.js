const fs = require('fs');
const path = require('path');

const dirs = [
  "architecture", "orchestration", "terraform-engine", "ai-systems", 
  "topology-engine", "remediation", "observability", "frontend", 
  "backend", "api", "deployment", "development", "security", 
  "workflows", "finops", "integrations", "roadmap"
];

const base = path.join(__dirname, 'docs');

if (!fs.existsSync(base)) {
  fs.mkdirSync(base);
}

dirs.forEach(d => {
  const dirPath = path.join(base, d);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
  const content = `# ZeroDrift Documentation: ${d.toUpperCase()}\n\n> Enterprise technical documentation for the ${d} subsystem.\n\nDetailed architectural specifications, API boundaries, and operational guidelines will be maintained in this directory.\n`;
  fs.writeFileSync(path.join(dirPath, 'README.md'), content);
});

console.log('Documentation structure generated successfully.');

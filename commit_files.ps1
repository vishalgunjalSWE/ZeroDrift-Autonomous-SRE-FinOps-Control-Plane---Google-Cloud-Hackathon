# ================================================================
# ZeroDrift - Production Grade Per-File Git Commit Script
# Run this from: c:\Users\Vshal\Desktop\ZeroDrift\github
#
# Usage (from any terminal navigated to the repo):
#   powershell -ExecutionPolicy Bypass -File .\commit_files.ps1
#
# Or double-click RUN_COMMITS.bat
# ================================================================

# When invoked via the .bat file, working directory is already the repo
$REPO = $PSScriptRoot  # Directory containing this script = the repo root

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  ZeroDrift - Production Grade Per-File Commit Script" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Repo: $REPO" -ForegroundColor Gray
Write-Host ""

# Verify we're in a git repo
$statusOut = & git -C "$REPO" status --short 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Not a git repository or git not found." -ForegroundColor Red
    exit 1
}

Write-Host "Git Status:" -ForegroundColor Yellow
Write-Host ($statusOut | Out-String)

# ----------------------------------------------------------------
# Commit message lookup function
# ----------------------------------------------------------------
function Get-CommitMessage([string]$FilePath) {
    $f    = $FilePath.Replace('\', '/')
    $base = [System.IO.Path]::GetFileName($f)

    # README.md by location
    if ($base -eq "README.md") {
        if ($f -match "^web/")                   { return "docs(frontend): add frontend README with dev setup, build commands, and component structure" }
        if ($f -match "^docs/ai-systems")        { return "docs(ai): add AI systems module README documenting reasoning engine and safety design" }
        if ($f -match "^docs/api")               { return "docs(api): add API reference module README with endpoint overview and auth patterns" }
        if ($f -match "^docs/architecture")      { return "docs(architecture): add architecture module README with system design and C4 diagrams" }
        if ($f -match "^docs/backend")           { return "docs(backend): add backend module README covering webhook processing and event patterns" }
        if ($f -match "^docs/deployment")        { return "docs(ops): add GCP Cloud Run deployment guide README with env config and rollout steps" }
        if ($f -match "^docs/development")       { return "docs(dev): add local development guide README with setup, hot-reload, and contribution flow" }
        if ($f -match "^docs/finops")            { return "docs(finops): add FinOps module README covering cost allocation and optimization strategy" }
        if ($f -match "^docs/frontend")          { return "docs(frontend): add frontend module README with component library and state management" }
        if ($f -match "^docs/integrations")      { return "docs(integrations): add integrations module README for Slack, PagerDuty, and cloud APIs" }
        if ($f -match "^docs/observability")     { return "docs(observability): add observability module README with metrics, logging, and tracing" }
        if ($f -match "^docs/orchestration")     { return "docs(orchestration): add orchestration module README for AI remediation pipeline design" }
        if ($f -match "^docs/remediation")       { return "docs(sre): add remediation module README with runbooks and escalation decision trees" }
        if ($f -match "^docs/roadmap")           { return "docs: add roadmap module README with milestone overview and feature priorities" }
        if ($f -match "^docs/security")          { return "docs(security): add security module README covering IAM, secrets, and audit controls" }
        if ($f -match "^docs/terraform-engine")  { return "docs(iac): add Terraform engine module README with drift detection and state management" }
        if ($f -match "^docs/topology-engine")   { return "docs(topology): add topology engine module README with service discovery and graph builds" }
        if ($f -match "^docs/workflows")         { return "docs(orchestration): add workflows module README for AI action chains and rollback flows" }
        return "docs: add comprehensive project README with architecture overview, setup guide, and features"
    }

    # main.tf by location
    if ($base -eq "main.tf") {
        if ($f -match "gcp-deployment")           { return "feat(infra): add GCP Terraform config for Cloud Run services and supporting infrastructure" }
        if ($f -match "modules/eks")              { return "feat(terraform): add EKS cluster module with managed node groups, IAM, and VPC integration" }
        if ($f -match "modules/vpc")              { return "feat(terraform): add VPC module with subnets, NAT gateways, and security group config" }
        if ($f -match "modules/rds")              { return "feat(terraform): add RDS module with multi-AZ failover, backups, and parameter groups" }
        if ($f -match "modules/observability")    { return "feat(terraform): add observability module for CloudWatch, Prometheus, and alert rules" }
        if ($f -match "environments/dev")         { return "feat(terraform): add dev environment root config with reduced capacity and cost controls" }
        if ($f -match "environments/prod")        { return "feat(terraform): add prod environment root config with HA, auto-scaling, and DR setup" }
        if ($f -match "environments/staging")     { return "feat(terraform): add staging environment root config for pre-production validation" }
        if ($f -match "terraform_repo_root")      { return "feat(terraform): add terraform repo root config orchestrating multi-environment provisioning" }
        return "feat(terraform): add root Terraform configuration for GCP infrastructure provisioning"
    }

    # package.json by location
    if ($base -eq "package.json") {
        if ($f -match "^web/") { return "build(frontend): add Next.js package.json with UI, charting, and state management dependencies" }
        return "build: add root package.json with scaffold scripts and project metadata"
    }

    # variables.tf by location
    if ($base -eq "variables.tf") {
        if ($f -match "modules/eks")           { return "feat(terraform): add EKS module input variables with type constraints and validated defaults" }
        if ($f -match "modules/vpc")           { return "feat(terraform): add VPC module input variables for CIDR blocks and availability zones" }
        if ($f -match "modules/rds")           { return "feat(terraform): add RDS module input variables for instance class, storage, and backup config" }
        if ($f -match "modules/observability") { return "feat(terraform): add observability module variables for log retention and alert thresholds" }
        return "feat(terraform): add Terraform variable definitions with type safety and documented defaults"
    }

    # .gitignore by location
    if ($base -eq ".gitignore") {
        if ($f -match "^web/") { return "chore(frontend): add .gitignore excluding Next.js build output, node_modules, and local env files" }
        return "chore: add .gitignore excluding Python bytecode, node_modules, Terraform state, and env secrets"
    }

    switch ($base) {
        ".gitlab-ci.yml"              { return "ci: add GitLab CI/CD pipeline with build, test, security scan, and GCP Cloud Run deploy stages" }
        "Uses.md"                     { return "docs: add use-case reference documenting ZeroDrift integration patterns and operational scenarios" }
        "projectInfo.md"             { return "docs: add project metadata with team info, hackathon submission context, and tech stack summary" }
        "main.tf.backup"             { return "chore(terraform): add Terraform root config backup snapshot for safe rollback reference" }
        "package-lock.json"          { return "build(frontend): add package-lock.json ensuring deterministic installs and supply-chain integrity" }
        "scaffold.js"                { return "feat: add project scaffolding script for automated directory and boilerplate file generation" }
        "scaffold_docs.js"           { return "feat: add docs scaffolding script generating structured documentation skeleton for all modules" }
        "generate_tf_tree.py"        { return "feat(infra): add Terraform dependency tree generator for visualizing IaC module relationships" }
        "server_webhook.py"          { return "feat(backend): add ZeroDrift core webhook server with AI-driven SRE and FinOps automation engine" }
        "setup_mock_infra.py"        { return "feat(testing): add mock infrastructure provisioner for local dev and CI integration test coverage" }
        "start_zerodrift.bat"        { return "ops: add Windows batch launcher for ZeroDrift dev environment with service orchestration" }
        "test_email.py"              { return "test: add email notification integration test validating SendGrid delivery and template rendering" }
        "update_backend.py"          { return "feat(backend): add infrastructure state sync utility for real-time drift detection and reconciliation" }
        "email_preview.html"         { return "feat(notifications): add responsive HTML email template for ZeroDrift incident alert notifications" }
        "zerodrift_executive_report.md" { return "docs: add executive report with cost savings analysis, SRE automation metrics, and ROI breakdown" }
        "zerodrift_audit_ledger.db"  { return "feat(audit): add SQLite immutable audit ledger for compliance tracking and change traceability" }
        "next.config.ts"             { return "build(frontend): add Next.js config with experimental features, image domains, and bundle optimization" }
        "tsconfig.json"              { return "build(frontend): add TypeScript config with strict mode, ES2022 target, and path alias mappings" }
        "tsconfig.tsbuildinfo"       { return "build(frontend): add TypeScript incremental build cache for faster recompilation in CI/CD" }
        "eslint.config.mjs"          { return "build(frontend): add ESLint flat config with Next.js core-vitals and TypeScript recommended rules" }
        "postcss.config.mjs"         { return "build(frontend): add PostCSS config with Tailwind CSS and autoprefixer processing pipeline" }
        "next-env.d.ts"              { return "build(frontend): add Next.js TypeScript environment declarations for image and link augmentation" }
        "AGENTS.md"                  { return "docs(frontend): add AI agent collaboration guide with codebase conventions and navigation hints" }
        "CLAUDE.md"                  { return "docs(frontend): add Claude AI context file documenting frontend architecture and dev conventions" }
        "favicon.ico"                { return "asset(frontend): add ZeroDrift favicon for browser tab, bookmark bar, and PWA homescreen display" }
        "globals.css"                { return "style(frontend): add global CSS with ZeroDrift dark theme design tokens and base typography rules" }
        "file.svg"                   { return "asset(frontend): add file SVG icon for Next.js public asset directory" }
        "globe.svg"                  { return "asset(frontend): add globe SVG icon for Next.js public asset directory" }
        "next.svg"                   { return "asset(frontend): add Next.js wordmark SVG for public asset directory" }
        "vercel.svg"                 { return "asset(frontend): add Vercel logo SVG for Next.js public asset directory" }
        "window.svg"                 { return "asset(frontend): add window SVG icon for Next.js public asset directory" }
        "query-client.tsx"           { return "feat(frontend): add React Query client provider with retry logic, error boundaries, and stale-time cache" }
        "useApi.ts"                  { return "feat(frontend): add useApi hook for type-safe REST calls with loading, error, and retry state management" }
        "architecture.md"            { return "docs(architecture): add system architecture overview with component diagrams and data flow descriptions" }
        "outputs.tf"                 { return "feat(terraform): add Terraform output declarations exposing resource IDs, ARNs, and connection endpoints" }
        "rds.tf"                     { return "feat(terraform): add RDS DB instance config with subnet group, param group, and enhanced monitoring" }
        "AIExecutionStream.tsx"      { return "feat(frontend): add AIExecutionStream component streaming live AI reasoning steps and action logs" }
        "AuditLedger.tsx"            { return "feat(frontend): add AuditLedger with immutable event table, advanced column filters, and CSV export" }
        "AuthWrapper.tsx"            { return "feat(auth): add AuthWrapper enforcing RBAC access control with session validation and role gating" }
        "CommandPalette.tsx"         { return "feat(frontend): add CommandPalette with fuzzy search for rapid keyboard-driven navigation and actions" }
        "CostTrajectoryChart.tsx"    { return "feat(finops): add CostTrajectoryChart using recharts for spend trend forecasting and anomaly overlays" }
        "DeepDiveDrawer.tsx"         { return "feat(frontend): add DeepDiveDrawer for contextual root-cause analysis and AI remediation guidance" }
        "DriftGauge.tsx"             { return "feat(sre): add DriftGauge radial chart visualizing real-time infrastructure configuration drift score" }
        "FinOpsSummaryMetrics.tsx"   { return "feat(finops): add FinOpsSummaryMetrics cards surfacing cloud spend KPIs and cost-saving opportunities" }
        "GuardrailsSidebar.tsx"      { return "feat(governance): add GuardrailsSidebar showing enforced OPA policy rules, violations, and risk scores" }
        "HackathonBanner.tsx"        { return "feat(frontend): add HackathonBanner contextualizing the Google Cloud Next Hackathon submission" }
        "HealthHeatmap.tsx"          { return "feat(sre): add HealthHeatmap rendering service reliability matrix with incident correlation overlay" }
        "HeroMetrics.tsx"            { return "feat(frontend): add HeroMetrics strip with animated KPI cards for reliability, cost, and drift scores" }
        "IaCSandbox.tsx"             { return "feat(iac): add IaCSandbox wrapping Monaco editor for browser-based Terraform authoring and dry-runs" }
        "LeftSidebar.tsx"            { return "feat(frontend): add LeftSidebar with collapsible module groups, route links, and real-time health badges" }
        "MultiCloudInvoice.tsx"      { return "feat(finops): add MultiCloudInvoice consolidating AWS, GCP, and Azure billing with cost attribution" }
        "PreFlightDrawer.tsx"        { return "feat(iac): add PreFlightDrawer displaying Terraform plan diffs with line-level RBAC approval workflow" }
        "TerraformIDE.tsx"           { return "feat(iac): add TerraformIDE with HCL syntax highlighting, live validation, plan execution, and state view" }
        "TopNavBar.tsx"              { return "feat(frontend): add TopNavBar with global command search, notification center, and user profile menu" }
        "TopologyGraph.tsx"          { return "feat(topology): add TopologyGraph using D3-force for live service dependency graph with health overlays" }
    }

    # App page routes
    if ($f -match "src/app/page\.tsx$")                      { return "feat(frontend): add ZeroDrift main dashboard with hero metrics, drift gauges, and AI execution stream" }
    if ($f -match "src/app/layout\.tsx$")                    { return "feat(frontend): add Next.js root layout with sidebar navigation, auth wrapper, and React Query provider" }
    if ($f -match "src/app/approvals/page\.tsx$")            { return "feat(frontend): add human-in-the-loop approval queue for reviewing AI-generated remediation actions" }
    if ($f -match "src/app/audit-logs/page\.tsx$")           { return "feat(frontend): add tamper-evident audit log page with chronological feed and compliance export" }
    if ($f -match "src/app/auto-remediations/page\.tsx$")    { return "feat(frontend): add automated remediation history page with AI fix timeline and outcome analytics" }
    if ($f -match "src/app/cost-intelligence/page\.tsx$")    { return "feat(finops): add cost intelligence page with budget forecasting, anomaly detection, and team attribution" }
    if ($f -match "src/app/greenops-impact/page\.tsx$")      { return "feat(finops): add GreenOps sustainability dashboard for carbon footprint tracking and efficiency scoring" }
    if ($f -match "src/app/iac-explorer/page\.tsx$")         { return "feat(iac): add IaC Explorer embedding the Terraform IDE for real-time infrastructure code editing" }
    if ($f -match "src/app/incidents/page\.tsx$")            { return "feat(sre): add incident management page with severity triage, timeline view, and AI-assisted RCA" }
    if ($f -match "src/app/infrastructure-drift/page\.tsx$") { return "feat(sre): add infrastructure drift page with declarative vs actual config diff and auto-heal triggers" }
    if ($f -match "src/app/integrations/page\.tsx$")         { return "feat(integrations): add integrations marketplace for Slack, PagerDuty, GitHub, and cloud provider APIs" }
    if ($f -match "src/app/manifesto/page\.tsx$")            { return "feat(frontend): add ZeroDrift manifesto declaring the autonomous SRE principles and engineering values" }
    if ($f -match "src/app/performance/page\.tsx$")          { return "feat(sre): add performance monitoring with p50/p95/p99 latency, throughput trends, and SLO burn charts" }
    if ($f -match "src/app/policy-guardrails/page\.tsx$")    { return "feat(governance): add policy guardrails page for OPA/Rego rule management and violation reporting" }
    if ($f -match "src/app/resource-inventory/page\.tsx$")   { return "feat(finops): add resource inventory with multi-cloud asset discovery, tagging, and compliance scoring" }
    if ($f -match "src/app/risk-events/page\.tsx$")          { return "feat(sre): add risk events feed with ML anomaly scoring, blast radius estimation, and remediation links" }
    if ($f -match "src/app/settings/page\.tsx$")             { return "feat(frontend): add platform settings for notification thresholds, integrations, and team RBAC roles" }
    if ($f -match "src/app/slos-slis/page\.tsx$")            { return "feat(sre): add SLO/SLI tracking with error budget visualization and burn rate alert configuration" }
    if ($f -match "src/app/teams/page\.tsx$")                { return "feat(frontend): add team management with RBAC assignments, on-call rotation, and escalation policies" }
    if ($f -match "src/app/topology-map/page\.tsx$")         { return "feat(topology): add topology map page with interactive D3 service dependency graph and health overlay" }

    # Fallback
    return "feat: add $base to ZeroDrift Autonomous SRE and FinOps Control Plane"
}

# ----------------------------------------------------------------
# Collect files to commit
# ----------------------------------------------------------------
Write-Host "--- Scanning for uncommitted files ---" -ForegroundColor Yellow

$rawUntracked = & git -C "$REPO" ls-files --others --exclude-standard 2>&1
$rawModified  = & git -C "$REPO" diff --name-only 2>&1

$untrackedFiles = [System.Collections.Generic.List[string]]::new()
$modifiedFiles  = [System.Collections.Generic.List[string]]::new()

foreach ($line in $rawUntracked) {
    if ($line -is [string]) {
        $l = $line.Trim()
        if ($l -ne "" -and $l -notmatch "^(error|warning|fatal):") { $untrackedFiles.Add($l) }
    }
}
foreach ($line in $rawModified) {
    if ($line -is [string]) {
        $l = $line.Trim()
        if ($l -ne "" -and $l -notmatch "^(error|warning|fatal):") { $modifiedFiles.Add($l) }
    }
}

Write-Host "  Untracked (new) : $($untrackedFiles.Count)" -ForegroundColor Cyan
Write-Host "  Modified        : $($modifiedFiles.Count)" -ForegroundColor Cyan

$commitList = [System.Collections.Generic.List[PSObject]]::new()
foreach ($f in $untrackedFiles) { $commitList.Add([PSCustomObject]@{ Path = $f; Type = "new" }) }
foreach ($f in $modifiedFiles)  { $commitList.Add([PSCustomObject]@{ Path = $f; Type = "modified" }) }

if ($commitList.Count -eq 0) {
    Write-Host ""
    Write-Host "No uncommitted files found! All files already committed." -ForegroundColor Green
    Write-Host ""
    Write-Host "Last 20 commits:" -ForegroundColor Yellow
    & git -C "$REPO" log --oneline -20
    exit 0
}

Write-Host ""
Write-Host "Total files to commit individually: $($commitList.Count)" -ForegroundColor Green
Write-Host "Starting per-file production-grade commits...`n" -ForegroundColor Yellow

$successCount = 0
$skipCount    = 0
$failCount    = 0
$index        = 0

foreach ($item in $commitList) {
    $index++
    $filePath  = $item.Path
    $commitMsg = Get-CommitMessage -FilePath $filePath

    Write-Host "[$index/$($commitList.Count)] " -NoNewline -ForegroundColor White
    Write-Host $filePath -ForegroundColor Cyan
    Write-Host "  >> $commitMsg" -ForegroundColor DarkGray

    # Stage the file
    $addOut = & git -C "$REPO" add -- "$filePath" 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [FAIL] Could not stage: $addOut" -ForegroundColor Red
        $failCount++
        continue
    }

    # Verify something is staged
    $stagedOut = & git -C "$REPO" diff --cached --name-only 2>&1
    $staged = @($stagedOut | Where-Object { $_ -is [string] -and $_.Trim() -ne "" })
    if ($staged.Count -eq 0) {
        Write-Host "  [SKIP] Nothing to stage (already committed?)" -ForegroundColor DarkYellow
        $skipCount++
        continue
    }

    # Commit with production-grade message
    $commitOut = & git -C "$REPO" commit -m "$commitMsg" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] Committed successfully" -ForegroundColor Green
        $successCount++
    } else {
        Write-Host "  [FAIL] $($commitOut -join '; ')" -ForegroundColor Red
        $failCount++
        & git -C "$REPO" reset HEAD -- "$filePath" 2>&1 | Out-Null
    }
    Write-Host ""
}

# ----------------------------------------------------------------
# Summary
# ----------------------------------------------------------------
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  COMMIT SUMMARY" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Committed : $successCount files" -ForegroundColor Green
Write-Host "  Skipped   : $skipCount files" -ForegroundColor Yellow
Write-Host "  Failed    : $failCount files" -ForegroundColor Red
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Recent commit history:" -ForegroundColor Yellow
& git -C "$REPO" log --oneline -30
Write-Host ""

# ----------------------------------------------------------------
# Push
# ----------------------------------------------------------------
Write-Host "Pushing all commits to remote..." -ForegroundColor Yellow
$pushOut = & git -C "$REPO" push 2>&1
Write-Host ($pushOut | Out-String)

if ($LASTEXITCODE -eq 0) {
    Write-Host "Push successful! All $successCount commits are live on remote." -ForegroundColor Green
} else {
    Write-Host "Push may have issues. Check output above." -ForegroundColor Yellow
    Write-Host "If needed, run: git push --set-upstream origin main" -ForegroundColor Gray
}

# ZeroDrift

> **Autonomous infrastructure optimization and drift remediation for modern cloud operations.**

ZeroDrift is a declarative reliability control plane designed to bridge the gap between static Infrastructure as Code (IaC) state and dynamic cloud reality. It identifies infrastructure drift, calculates the financial and environmental impact of overprovisioning, and autonomously generates deterministic Terraform remediation code via GitOps workflows.

---

## 1. Product Overview

Managing cloud infrastructure at scale is inherently reactive. SRE teams rely on monitoring alerts, cost reports, and manual interventions to maintain state consistency. ZeroDrift inverts this model. 

It is an autonomous orchestration engine that performs on-demand simulation sweeps and manual infrastructure analysis against Git-hosted Terraform definitions to compute optimization paths. Rather than applying changes blindly against production APIs, ZeroDrift operates with a **Human-in-the-Loop (HITL) GitOps architecture**: it opens Merge Requests (MRs) containing precise Terraform patches, requiring human approval before any mutation occurs.

**Who is this for?**
- **Platform Engineering Teams** managing 10,000+ cloud resources.
- **Site Reliability Engineers (SREs)** drowning in alert fatigue and drift remediation toil.
- **FinOps Leaders** seeking enforceable, code-backed cost down-sizing.

---

## 2. Why ZeroDrift Exists

Modern cloud operations suffer from three compounding failures:

1. **Infrastructure Drift:** Manual console changes, break-glass incidents, and unmanaged resources cause the live cloud state to continuously drift from the Terraform source of truth.
2. **Cloud Waste:** Workloads are systematically overprovisioned. Rightsizing instances (e.g., `m5.4xlarge` to `t3.medium`) is easy to identify but operationally terrifying to execute at scale.
3. **SRE Toil:** Most "AIOps" tools generate more alerts. SREs do not need more dashboards telling them something is wrong; they need systems that actually write the code to fix the problem.

ZeroDrift was built to automate the execution, not just the observation.

---

## 3. Core Features

| Feature | Description | State |
| :--- | :--- | :--- |
| **Mandatory Human Gatekeeper** | All proposals require explicit human approval (`REQUIRES_APPROVAL`). ZeroDrift never auto-applies code without sign-off. | **Implemented** |
| **Isolated Demo Sandbox** | Simulation patches modify `terraform_sandbox/demo_infrastructure.tf`. Primary `main.tf` remains strictly read-only. | **Implemented** |
| **Pre-Flight Syntax Validation** | Canonical `POST /api/v1/validate-iac` endpoint runs HCL dry-run syntax and rule checks before approval. | **Implemented** |
| **Append-Only Audit Events** | Additive `audit_events` table logs immutable state transitions (`PROPOSED`, `SIMULATED_MERGED`, `REJECTED`). | **Implemented** |
| **Structured AI & Demo Fallback** | Gemini 2.5 Flash reasoning schema with a deterministic fallback tagged `DETERMINISTIC DEMO FALLBACK`. | **Implemented** |
| **Real-Time SSE Streaming** | Observability stream detailing execution steps and SRE reasoning logic via `/api/stream-logs`. | **Implemented** |
| **Topology Graph** | Visualizes interconnected cloud resources and blast radius. | **Implemented** |

> *Note: ZeroDrift operates in **SIMULATION MODE** by default for safe hackathon demonstration. All simulation mutations write strictly to `terraform_sandbox/demo_infrastructure.tf`, preserving root `main.tf` and `main.tf.backup` untouched.*

---

## 4. Product Screenshots

*(Screenshots to be added showing the following workflows)*
- **Command Center Dashboard:** The primary observation deck with real-time SSE execution logs and FinOps aggregates.
- **Topology Map:** Visualizing the blast radius of a proposed right-sizing operation.
- **GitOps Remediation Flow:** The exact UI flow showing an AI-proposed Terraform MR pending SRE approval.

---

## 5. Architecture Overview

ZeroDrift operates on a dual-plane architecture:

### 1. Control Plane (Frontend)
- **Framework:** Next.js (App Router), React 18, TypeScript.
- **State & Data:** React Query for cache invalidation and server synchronization.
- **Real-Time Data:** Native Server-Sent Events (SSE) via `EventSource` for non-blocking execution streaming.
- **Styling:** Tailwind CSS + Framer Motion (glassmorphism design system).

### 2. Execution Plane (Backend)
- **Framework:** Python (Monolithic webhook/API server).
- **Orchestration:** Deterministic state machine simulating an AI reasoning loop.
- **Data Persistence:** SQLite3 (`zerodrift_audit_ledger.db`) acting as the immutable audit ledger.
- **VCS Integration:** Native wrappers around Git and GitLab API to commit code and open MRs.

---

## 6. Infrastructure Workflow

1. **Scan (Simulated):** ZeroDrift parses the Terraform plan and queries the Datadog API for CPU/Memory utilization over a 30-day window.
2. **Reason:** The engine identifies that an `m5.4xlarge` is severely overprovisioned (average CPU < 5%).
3. **Propose:** A right-sizing operation is computed (e.g., downgrade to `t3.medium`).
4. **Mutate:** The Terraform parsing engine modifies the exact line in `environments/prod/main.tf`.
5. **Stage:** A Git branch is created, the diff is committed, and an MR is opened.
6. **Approve:** SRE reviews the MR in the ZeroDrift UI and clicks "Merge". GitLab CI/CD handles the `terraform apply`.

---

## 7. Repository Structure

```
zerodrift-infra/
├── web/                      # Next.js Frontend Application
│   ├── src/app/              # App Router pages (Dashboard, Topology, Settings)
│   ├── src/components/       # Reusable UI components (DriftGauge, ExecutionStream)
│   └── src/hooks/            # React Query data fetching logic
├── terraform/                # Sample Infrastructure as Code
│   ├── environments/         # Environment definitions (Prod, Staging)
│   └── modules/              # Reusable TF modules (EKS, VPC)
├── server_webhook.py         # Primary Python Backend & API
├── update_backend.py         # Sub-service for backend mutations
├── zerodrift_audit_ledger.db # Local SQLite immutable ledger
└── start_zerodrift.bat       # Local orchestration script
```

---

## 8. Development & Public Hackathon Demo Deployment

### Local Development Setup

ZeroDrift is designed to run locally in isolated simulation mode.

**Prerequisites:**
- Node.js (v18+)
- Python (3.9+)

**Single-Command Start (Concurrently):**
```bash
npm run dev
```
*(Spawns FastAPI backend on port 8000, Next.js frontend on port 3000, and ngrok tunnel concurrently).*

**Alternative Multi-Terminal Start:**
```bash
# Terminal 1 — Execution Engine (Backend):
pip install -r requirements.txt
uvicorn server_webhook:app --host 0.0.0.0 --port 8000

# Terminal 2 — Control Plane (Frontend):
cd web
npm install
npm run dev
```
Navigate to `http://localhost:3000`.

---

### Strictly $0 Public Demo Deployment (Render + Vercel)

ZeroDrift can be deployed publicly for hackathon demonstration with zero cloud infrastructure cost using Render Free Tier and Vercel Hobby.

#### 1. Backend: Render Free Web Service
- **Repository**: Connect your GitHub repository.
- **Root Directory**: `.` (Repository root)
- **Environment**: `Python 3`
- **Plan**: `Free`
- **Build Command**:
  ```bash
  pip install -r requirements.txt
  ```
- **Start Command**:
  ```bash
  uvicorn server_webhook:app --host 0.0.0.0 --port $PORT
  ```
- **Health Check Path**: `/health` (safe, non-sensitive health probe)
- **Environment Variables**:
  - `ALLOWED_ORIGINS`: `https://YOUR-VERCEL-APP.vercel.app` (your frontend Vercel URL, without trailing slash)
  - *(Optional)* `GEMINI_API_KEY`: *(Optional Google Gemini key; if omitted, deterministic SRE policy fallback activates automatically)*

#### 2. Frontend: Vercel Hobby
- **Repository**: Connect your GitHub repository.
- **Framework Preset**: `Next.js`
- **Root Directory**: `web`
- **Build Command**: `next build` (default)
- **Environment Variables**:
  - `NEXT_PUBLIC_API_URL`: `https://YOUR-RENDER-SERVICE.onrender.com` (your Render service URL, without trailing slash)

#### 3. Public Demo Operational Disclosures
> **IMPORTANT PUBLIC DEMO BOUNDARY**:
> - **Sandbox-Only**: This public deployment operates strictly as a simulation demonstration. All proposed mutations target `terraform_sandbox/demo_infrastructure.tf`. No live cloud provider mutation, AWS/GCP credential access, or external GitHub/GitLab repository push occurs.
> - **Render Free Cold Starts**: Free Render web services spin down after 15 minutes of inactivity. The initial request after idle may take 30–50 seconds to wake up.
> - **Ephemeral Storage**: Free instances use an ephemeral filesystem; the demo audit history stored in `terraform_sandbox/zerodrift_demo_audit.db` resets upon instance restart. Root repository files remain completely immutable.

---

## 9. Technical Decisions

- **Why GitOps (Merge Requests) instead of Auto-Apply?**
  Autonomous systems modifying production infrastructure without version control are a catastrophic risk. By forcing all remediations through standard Git MRs, ZeroDrift ensures a safe fallback, an audit trail, and respects the existing CI/CD boundary.
- **Why SSE over WebSockets?**
  The execution stream is unidirectional (Server -> Client). SSE is lighter, native to HTTP, and handles reconnection automatically without the overhead of maintaining bidirectional websocket frames.
- **Why a Dark "Glassmorphism" UI?**
  To reduce cognitive load and eye strain for operators monitoring dense dashboards for 8+ hours a day.

---

## 10. Product Limitations

In the spirit of technical honesty, this repository represents a high-fidelity prototype. 
- **Terraform Modification:** The current Python engine uses string replacement/regex to modify `.tf` files. In a production environment, this will fail on complex HCL interpolation. An AST parser (e.g., `hclwrite` via Go) is required.
- **Simulated Reasoning:** The AI logic is currently deterministic heuristics based on hardcoded metrics, rather than dynamic LLM-based reasoning loops.
- **Synchronous Backend:** The Python server uses blocking sleep commands to simulate long-running tasks. Production requires an async task queue (e.g., Celery, Temporal).

---

## 11. Future Roadmap

- **Q3 2026:** Complete migration of the IaC mutation engine to a Go-based `hclsyntax` microservice.
- **Q4 2026:** Implement Temporal.io for deterministic, fault-tolerant workflow orchestration.
- **Q1 2027:** Enterprise SSO (OIDC/SAML) integration and granular RBAC.

---

## 12. Engineering Philosophy

We believe in **Bounded Autonomy**. AI should not have `AdministratorAccess` to an AWS account. The safest path to autonomous infrastructure is treating AI as a Junior Developer: it can read the codebase, it can analyze the metrics, and it can open a Pull Request. But a Principal Engineer (the Human SRE) must always click merge.

Trust in infrastructure automation is earned through explainability and deterministic execution, not black-box promises.

---

## 13. Contribution Guidelines

We enforce strict coding standards. 
- All React components must be functional and typed via TypeScript.
- State mutation must occur through React Query mutations.
- Backend additions require accompanying tests for execution determinism.

---

## 14. License

ZeroDrift is proprietary enterprise software. All rights reserved.

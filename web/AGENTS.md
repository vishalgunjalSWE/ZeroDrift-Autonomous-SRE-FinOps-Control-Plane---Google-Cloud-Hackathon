<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices. Use the **App Router** (`app/`) paradigm strictly.
<!-- END:nextjs-agent-rules -->

# ZERO-DRIFT FRONTEND ENGINEERING DIRECTIVES

> **CRITICAL DIRECTIVE**: You are the Lead Frontend Architect for ZeroDrift. This dashboard is a million-dollar Silicon Valley product aimed at elite DevOps and FinOps teams. The UX must evoke the feeling of a high-performance command center. Generic, basic, or unpolished UIs will be rejected immediately.

## 1. Elite Aesthetics & Styling Rules
- **Framework:** TailwindCSS. Do NOT use standard Bootstrap/Material Design paradigms.
- **Color System:**
  - **Backgrounds:** True Black (`#000000`) or Deep Onyx (`#0A0A0A`).
  - **Accents:** Azure (`#0070F3`), Emerald (`#10B981`), Infrared (`#FF5F57`), Amethyst (`#7928CA`).
  - **Text:** High-contrast White for primary data, Slate (`#888888` or `text-white/60`) for labels.
- **Glassmorphism:** You must use translucent, frosted-glass effects for cards and modals.
  - *Standard Glass Card:* `bg-white/5 border border-white/10 backdrop-blur-md rounded-xl`
  - *Hover State:* `hover:bg-white/10 hover:border-white/20 transition-all duration-300`
- **Typography:** Utilize technical, monospaced fonts (`Roboto Mono`, `Fira Code`) for infrastructure code, IDs, and financial metrics. Use `Inter` for general readability.

## 2. Micro-Animations & Dynamic UX (Framer Motion)
- **Requirement:** The UI must feel *alive*. Never render static topology maps or data grids without motion.
- **Library:** `framer-motion`.
- **Patterns:**
  - **Mounting:** Lists should use staggered fade-ins (`staggerChildren`).
  - **State Changes:** When an instance is optimized, use physics-based spring animations (`type: "spring", stiffness: 300`).
  - **Live Data:** Use pulsing dots or SVG line animations (e.g., `animate={{ offsetDistance: ["0%", "100%"] }}`) to simulate data flowing through the SRE infrastructure.

## 3. Next.js 14+ App Router Architecture
- **Server-First Paradigm:** Every file is a React Server Component (RSC) by default. Data fetching should happen on the server to ensure zero-latency initial loads.
- **Client Components (`'use client'`):** Push interactivity down the component tree. Only add `'use client'` to leaf nodes that explicitly require `useState`, `useEffect`, `onClick`, or `<motion.div>`.
- **Data Fetching (Client):** For live, polling data (like the SSE event streams or Topology drift updates), use `@tanstack/react-query` to manage caching, refetching, and background synchronization.

## 4. Code Quality & Conventions
- **TypeScript:** Strict mode is enforced. Do not use `any`. Define granular interfaces (e.g., `TopoNode`, `DriftEvent`).
- **Iconography:** Exclusively use `lucide-react`. Size them correctly (`w-4 h-4`) and align them perfectly with text using `flex items-center`.
- **Separation of Concerns:**
  - `src/app/`: Routing, layout, and server-side data fetching.
  - `src/components/`: Reusable, isolated UI modules (e.g., `TopologyGraph.tsx`, `TerraformIDE.tsx`).
  - `src/lib/`: Utilities, fetch wrappers, and formatters (e.g., currency formatters for FinOps).

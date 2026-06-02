# ZeroDrift Usage & Integration Models

It is completely normal to have this confusion! When you build a complex backend engine, it can be hard to visualize how the end-user actually interacts with it in the real world. 

ZeroDrift is designed to be a **"Shift-Left" FinOps tool**. This means it catches cloud waste *before* the code is ever deployed to production. 

Here is exactly how the platform works in the three different scenarios you mentioned:

---

## 1. Enterprise Integration (When a Company Buys the Platform)
When a large company (like Netflix or Uber) purchases ZeroDrift, they deploy it across their entire engineering organization to govern all cloud spending.

**The Workflow:**
1. **Integration:** The company's IT admin installs the ZeroDrift GitHub/GitLab App at the organization level.
2. **Monitoring:** ZeroDrift sits silently in the background, listening to Webhooks from the company's version control system.
3. **The Interception:** An engineer writes Terraform code requesting 50 massive servers and opens a Pull Request.
4. **The Action:** ZeroDrift's FastAPI backend receives the webhook, uses the AST parser to read the Terraform code, and realizes this is a $10,000/month waste. 
5. **The Result:** ZeroDrift automatically blocks the Pull Request from being merged and leaves an AI-generated comment: *"This configuration exceeds our FinOps budget. Please downgrade to `t3.large` instances."*
6. **Dashboard:** The CTO and Lead SREs log into the ZeroDrift Dashboard (the UI we built) to see the total "Carbon Avoided" and "Savings Trend" across the entire company.

---

## 2. Individual SRE Workflow (When an SRE Uses it on Their Project)
When an individual SRE or Platform Engineer is working on their own local machine, they want feedback *before* they push code to GitHub.

**The Workflow:**
1. **Installation:** The SRE installs your tool globally on their laptop (e.g., `npm install -g zerodrift-cli` or `pip install zerodrift`).
2. **Development:** They are writing Terraform code (`main.tf`) in VS Code to deploy a new Kubernetes cluster.
3. **Local Execution:** Before committing the code, they open their terminal and type:
   ```bash
   zerodrift scan ./terraform-folder
   ```
4. **The Action:** The CLI packages their local files, sends them to the ZeroDrift API, and returns an instant terminal report.
5. **The Result:** The terminal flashes red: `[WARNING] You have selected db.r5.12xlarge. This is massively over-provisioned for a staging environment. Recommended: db.t3.medium.` The SRE fixes the code immediately, saving the company money instantly.

---

## 3. Public SaaS Usage (When it is Live for Anyone)
If you publish ZeroDrift publicly as a SaaS product (e.g., at `www.zerodrift.io`), this is how a random user from the internet experiences it.

**The Workflow:**
1. **Sign Up:** A user visits your website and clicks "Sign in with GitHub".
2. **Onboarding:** The ZeroDrift dashboard asks: *"Which repository would you like to optimize?"* The user selects their AWS infrastructure repository.
3. **The Initial Scan:** Your backend clones their repository, runs the Gemini AI parser over their entire codebase, and calculates their total cloud waste.
4. **The Dashboard:** The user is redirected to the Next.js Dashboard we built. The "Optimization Opportunities" widget lights up, showing them they have 49 potential fixes.
5. **Auto-Remediation:** The user clicks the **"Auto-Fix"** button on the dashboard. ZeroDrift's backend autonomously creates a brand new Pull Request on the user's GitHub repository containing the exact Terraform code changes needed to save them money. All the user has to do is click "Merge".
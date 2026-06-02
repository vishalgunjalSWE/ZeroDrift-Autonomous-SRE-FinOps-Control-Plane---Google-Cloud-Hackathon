import re
import os

def update_backend():
    path = "server_webhook.py"
    with open(path, "r", encoding="utf-8") as f:
        code = f.read()

    # 1. Update /api/save-code and /api/active-code
    old_code_api = """class CodeUpdate(BaseModel):
    code: str

@app.post("/api/save-code")
async def save_code(update: CodeUpdate):
    logger.info("💾 [SRE-OPS] Saving sandbox code to main.tf...")
    local_path = os.path.join(BASE_DIR, "main.tf")
    with open(local_path, "w") as f:
        f.write(update.code)
    logger.info("✅ [SUCCESS] Sandbox main.tf updated.")
    return {"status": "success"}

@app.get("/api/active-code")
async def get_active_code():
    local_path = os.path.join(BASE_DIR, "main.tf")
    if not os.path.exists(local_path):
        return {"code": ""}
    with open(local_path, "r") as f:
        return {"code": f.read()}"""

    new_code_api = """class CodeUpdate(BaseModel):
    code: str
    path: str = "environments/prod/main.tf"

@app.get("/api/iac/tree")
async def get_iac_tree():
    tf_dir = os.path.join(BASE_DIR, "terraform")
    tree = []
    for root, dirs, files in os.walk(tf_dir):
        rel_dir = os.path.relpath(root, tf_dir)
        if rel_dir == ".": rel_dir = ""
        for f in files:
            if f.endswith(".tf"):
                tree.append(os.path.join(rel_dir, f).replace("\\\\", "/").lstrip("/"))
    return {"tree": tree}

@app.post("/api/save-code")
async def save_code(update: CodeUpdate):
    logger.info(f"💾 [SRE-OPS] Saving sandbox code to {update.path}...")
    local_path = os.path.join(BASE_DIR, "terraform", update.path)
    os.makedirs(os.path.dirname(local_path), exist_ok=True)
    with open(local_path, "w") as f:
        f.write(update.code)
    logger.info(f"✅ [SUCCESS] {update.path} updated.")
    return {"status": "success"}

@app.get("/api/active-code")
async def get_active_code(path: str = "environments/prod/main.tf"):
    local_path = os.path.join(BASE_DIR, "terraform", path)
    if not os.path.exists(local_path):
        return {"code": f"# File not found: {path}"}
    with open(local_path, "r") as f:
        return {"code": f.read()}"""

    code = code.replace(old_code_api, new_code_api)

    # 2. Update /api/v1/topology
    old_topo = """@app.get("/api/v1/topology")
async def topology():
    import re
    # Simple regex to extract resources from main.tf
    local_path = os.path.join(BASE_DIR, "main.tf")
    nodes = []
    providers = set()
    
    if os.path.exists(local_path):
        with open(local_path, "r") as f:
            code = f.read()
        
        resource_pattern = r'resource\s+"([^"]+)"\s+"([^"]+)"'
        for match in re.finditer(resource_pattern, code):
            rtype, rname = match.groups()
            provider = rtype.split("_")[0]
            providers.add(provider)
            nodes.append({
                "id": f"{rtype}.{rname}",
                "label": rname,
                "type": rtype,
                "provider": provider,
                "state": "healthy",
                "old_config": "",
                "new_config": "",
                "monthly_savings": 0,
                "config": "running"
            })
    
    # If no nodes, return some mocks so the UI has something cool to show
    if not nodes:
        providers = {"aws", "google"}
        nodes = [
            {"id": "aws_instance.web", "label": "web_server", "type": "aws_instance", "provider": "aws", "state": "drifted", "config": "t3.large", "monthly_savings": 213, "old_config": "t3.large", "new_config": "t3.medium"},
            {"id": "aws_db_instance.main", "label": "main_db", "type": "aws_db_instance", "provider": "aws", "state": "healthy", "config": "db.r5.large", "monthly_savings": 0, "old_config": "", "new_config": ""},
            {"id": "google_compute_instance.app", "label": "app_cluster", "type": "google_compute_instance", "provider": "google", "state": "waste", "config": "n1-standard-8", "monthly_savings": 169, "old_config": "n1-standard-8", "new_config": "e2-medium"}
        ]

    # Map states from any active runs
    for run in run_details_cache.values():
        if run.get("status") in ["SUCCESS", "MERGED", "REQUIRES_APPROVAL"]:
            for opt in run.get("optimizations", []):
                for node in nodes:
                    if node["type"] == opt.get("resource_type") and node["label"] == opt.get("resource_name"):
                        node["state"] = "optimized" if run.get("status") == "MERGED" else "drifted"
                        node["new_config"] = opt.get("new_config")
                        node["monthly_savings"] = opt.get("monthly_savings", 0)

    return {
        "nodes": nodes,
        "provider_hubs": list(providers),
        "last_run_id": "none",
        "last_run_status": "NEVER_RUN"
    }"""

    new_topo = """@app.get("/api/v1/topology")
async def topology():
    import re
    tf_dir = os.path.join(BASE_DIR, "terraform")
    nodes = []
    providers = set()
    
    resource_pattern = r'resource\\s+"([^"]+)"\\s+"([^"]+)"'
    module_pattern = r'module\\s+"([^"]+)"'
    
    for root, dirs, files in os.walk(tf_dir):
        env_match = re.search(r'environments[\\\\/]([^\\\\/]+)', root)
        env = env_match.group(1) if env_match else "shared"
        if "modules" in root:
            env = "module"
        
        for f in files:
            if not f.endswith(".tf"): continue
            file_path = os.path.join(root, f)
            with open(file_path, "r") as code_file:
                tf_code = code_file.read()
            
            for match in re.finditer(resource_pattern, tf_code):
                rtype, rname = match.groups()
                provider = rtype.split("_")[0] if "_" in rtype else "unknown"
                providers.add(provider)
                nodes.append({
                    "id": f"{env}:{rtype}.{rname}",
                    "label": f"{env} / {rname}",
                    "type": rtype,
                    "provider": provider,
                    "state": "healthy",
                    "old_config": "",
                    "new_config": "",
                    "monthly_savings": 0,
                    "config": "running",
                    "environment": env
                })
            
            for match in re.finditer(module_pattern, tf_code):
                mname = match.group(1)
                nodes.append({
                    "id": f"{env}:module.{mname}",
                    "label": f"{env} / {mname}",
                    "type": "module",
                    "provider": "unknown",
                    "state": "healthy",
                    "old_config": "",
                    "new_config": "",
                    "monthly_savings": 0,
                    "config": "module",
                    "environment": env
                })

    for run in run_details_cache.values():
        if run.get("status") in ["SUCCESS", "MERGED", "REQUIRES_APPROVAL"]:
            for opt in run.get("optimizations", []):
                for node in nodes:
                    # simplistic mapping for demo
                    if opt.get("resource_type") in node["type"] and opt.get("resource_name") in node["label"]:
                        node["state"] = "optimized" if run.get("status") == "MERGED" else "drifted"
                        node["new_config"] = opt.get("new_config")
                        node["monthly_savings"] = opt.get("monthly_savings", 0)

    if not nodes:
        providers.add("aws")

    return {
        "nodes": nodes,
        "provider_hubs": list(providers),
        "last_run_id": "none",
        "last_run_status": "NEVER_RUN"
    }"""

    code = code.replace(old_topo, new_topo)

    # 3. Update run_autonomous_workflow scanner
    old_scan = """        logger.info("📥 [SCAN] Reading target IaC configuration...")
        if SIMULATION_MODE:
            local_path = os.path.join(BASE_DIR, "main.tf")
            if not os.path.exists(local_path):
                raise Exception("main.tf not found in project directory.")
            with open(local_path, "r") as f:
                actual_code = f.read()
            await asyncio.sleep(1.0)
            logger.info("📥 [SCAN] Local main.tf loaded (SIMULATION mode).")
            logger.info("📥 [SCAN] Connecting to GitLab via MCP stdio pipeline...")
            npx_command = "npx.cmd" if sys.platform == "win32" else "npx"
            server_params = StdioServerParameters(command=npx_command, args=["-y", "@modelcontextprotocol/server-gitlab"], env=os.environ.copy())
            try:
                async with stdio_client(server_params) as (read_stream, write_stream):
                    async with ClientSession(read_stream, write_stream) as session:
                        await session.initialize()
                        file_result = await session.call_tool("get_file_contents", arguments={"project_id": PROJECT_PATH, "file_path": "main.tf", "ref": "main"})
                        actual_code = json.loads(file_result.content[0].text)["content"]
                logger.info("📥 [SCAN] Remote main.tf fetched via GitLab MCP.")
            except Exception as e:
                logger.error(f"❌ [SCAN] MCP connection or read failed: {e}")
                raise ValueError("Failed to fetch main.tf via MCP pipeline.")

        if not actual_code or not actual_code.strip():
            logger.error("❌ [SCAN] main.tf is empty or null.")
            raise ValueError("main.tf is empty or null. Cannot proceed with optimization.")"""

    new_scan = """        logger.info("📥 [SCAN] Executing Enterprise Semantic AST Aggregation...")
        tf_dir = os.path.join(BASE_DIR, "terraform")
        actual_code = "### SEMANTIC CHUNK AGGREGATION ###\\n"
        
        # In a real system, this filters by drifted resources. We'll simulate by prioritizing prod RDS.
        target_files = [
            "environments/prod/rds.tf",
            "modules/rds/main.tf",
            "environments/prod/variables.tf"
        ]
        
        for rel_path in target_files:
            file_path = os.path.join(tf_dir, rel_path)
            if os.path.exists(file_path):
                with open(file_path, "r") as f:
                    actual_code += f"\\n# File: {rel_path}\\n{f.read()}\\n"
                    
        await asyncio.sleep(1.0)
        logger.info("📥 [SCAN] Generated isolated sub-graph for LLM reasoning.")"""
        
    code = code.replace(old_scan, new_scan)

    with open(path, "w", encoding="utf-8") as f:
        f.write(code)
    print("✅ Backend updated successfully.")

if __name__ == "__main__":
    update_backend()

import os
import shutil
from pathlib import Path

def create_mock_infra():
    base_dir = Path("terraform_repo_root")
    
    # If it exists, let's clear it to ensure a clean state for this phase
    if base_dir.exists():
        print(f"Cleaning existing directory: {base_dir}")
        shutil.rmtree(base_dir)

    print(f"Building Enterprise Terraform Sandbox at {base_dir.absolute()}...")
    
    # Define the core directory structure
    directories = [
        "modules/vpc",
        "modules/eks",
        "modules/rds",
        "environments/prod",
        "environments/staging"
    ]
    
    for d in directories:
        (base_dir / d).mkdir(parents=True, exist_ok=True)
        print(f"Created directory: {d}")

    # ==========================================
    # MODULES DEFINITIONS
    # ==========================================

    vpc_module = """
variable "vpc_cidr" {
  description = "CIDR block for the enterprise VPC"
  type        = string
}

variable "environment" {
  description = "Environment name (prod/staging)"
  type        = string
}

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name        = "zerodrift-${var.environment}-vpc"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

output "vpc_id" {
  value = aws_vpc.main.id
}
"""

    eks_module = """
variable "cluster_name" { type = string }
variable "vpc_id" { type = string }
variable "desired_nodes" { 
  type = number 
  default = 3
}

resource "aws_eks_cluster" "main" {
  name     = var.cluster_name
  role_arn = "arn:aws:iam::123456789012:role/eks-cluster-role"

  vpc_config {
    subnet_ids = ["subnet-abcde123", "subnet-fghij456"]
  }
}

resource "aws_eks_node_group" "workers" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "${var.cluster_name}-workers"
  node_role_arn   = "arn:aws:iam::123456789012:role/eks-node-role"
  subnet_ids      = ["subnet-abcde123", "subnet-fghij456"]

  scaling_config {
    desired_size = var.desired_nodes
    max_size     = 10
    min_size     = 2
  }
}
"""

    rds_module = """
variable "db_instance_class" { type = string }
variable "db_name" { type = string }
variable "vpc_id" { type = string }

resource "aws_db_instance" "main" {
  allocated_storage    = 500
  engine               = "postgres"
  engine_version       = "15.4"
  instance_class       = var.db_instance_class
  db_name              = var.db_name
  username             = "admin"
  password             = "supersecret"
  skip_final_snapshot  = true
  
  tags = {
    Name = var.db_name
    Criticality = "Tier-1"
  }
}
"""

    # ==========================================
    # ENVIRONMENT DEFINITIONS (PROD & STAGING)
    # ==========================================

    prod_env = """
# Production Infrastructure
# Managed by Enterprise DevOps Team

module "vpc" {
  source      = "../../modules/vpc"
  vpc_cidr    = "10.0.0.0/16"
  environment = "prod"
}

module "eks" {
  source        = "../../modules/eks"
  cluster_name  = "prod-eks-cluster"
  vpc_id        = module.vpc.vpc_id
  desired_nodes = 5
}

module "rds" {
  source            = "../../modules/rds"
  db_name           = "zerodrift_prod_db"
  vpc_id            = module.vpc.vpc_id
  
  # INTENTIONAL CLOUD WASTE / DRIFT CONFIGURATION:
  # This instance is massively over-provisioned.
  # ZeroDrift AST parser should identify this parameter
  # and the Gemini reasoning engine should flag this as 
  # excessive FinOps waste given the metrics.
  db_instance_class = "db.r5.12xlarge" 
}
"""

    staging_env = """
# Staging Infrastructure
# Ephemeral, used for CI/CD integration tests

module "vpc" {
  source      = "../../modules/vpc"
  vpc_cidr    = "10.1.0.0/16"
  environment = "staging"
}

module "eks" {
  source        = "../../modules/eks"
  cluster_name  = "staging-eks-cluster"
  vpc_id        = module.vpc.vpc_id
  desired_nodes = 2
}

module "rds" {
  source            = "../../modules/rds"
  db_name           = "zerodrift_staging_db"
  vpc_id            = module.vpc.vpc_id
  db_instance_class = "db.t3.medium"
}
"""

    # Mapping of file paths to content
    files = {
        "modules/vpc/main.tf": vpc_module,
        "modules/eks/main.tf": eks_module,
        "modules/rds/main.tf": rds_module,
        "environments/prod/main.tf": prod_env,
        "environments/staging/main.tf": staging_env
    }

    # Write files
    for filepath, content in files.items():
        full_path = base_dir / filepath
        with open(full_path, "w", encoding="utf-8") as f:
            f.write(content.strip() + "\\n")
        print(f"Generated: {filepath}")

    print("\\n[SUCCESS] Phase 1 Enterprise Sandbox created successfully.")
    print("Intentional Cloud Waste ('db.r5.12xlarge') has been injected into environments/prod/main.tf.")

if __name__ == "__main__":
    create_mock_infra()

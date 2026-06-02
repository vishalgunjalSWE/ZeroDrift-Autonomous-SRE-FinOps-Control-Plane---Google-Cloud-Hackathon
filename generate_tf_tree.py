import os

BASE_DIR = os.path.abspath("terraform")

STRUCTURE = {
    "modules/vpc/variables.tf": """variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}""",
    "modules/vpc/main.tf": """resource "aws_vpc" "main" {
  cidr_block = var.vpc_cidr
  enable_dns_hostnames = true
  
  tags = {
    Name = "${var.environment}-vpc"
    ManagedBy = "Terraform"
  }
}

resource "aws_subnet" "private_a" {
  vpc_id     = aws_vpc.main.id
  cidr_block = cidrsubnet(var.vpc_cidr, 8, 1)
  availability_zone = "us-east-1a"
}

resource "aws_subnet" "private_b" {
  vpc_id     = aws_vpc.main.id
  cidr_block = cidrsubnet(var.vpc_cidr, 8, 2)
  availability_zone = "us-east-1b"
}
""",
    "modules/vpc/outputs.tf": """output "vpc_id" {
  value = aws_vpc.main.id
}
output "private_subnets" {
  value = [aws_subnet.private_a.id, aws_subnet.private_b.id]
}""",

    "modules/eks/variables.tf": """variable "cluster_name" { type = string }
variable "vpc_id" { type = string }
variable "subnet_ids" { type = list(string) }
variable "node_instance_type" { type = string }
variable "desired_capacity" { type = number }""",
    "modules/eks/main.tf": """resource "aws_eks_cluster" "cluster" {
  name     = var.cluster_name
  role_arn = "arn:aws:iam::123456789012:role/eks-cluster-role"
  
  vpc_config {
    subnet_ids = var.subnet_ids
  }
}

resource "aws_eks_node_group" "nodes" {
  cluster_name    = aws_eks_cluster.cluster.name
  node_group_name = "${var.cluster_name}-nodes"
  node_role_arn   = "arn:aws:iam::123456789012:role/eks-node-role"
  subnet_ids      = var.subnet_ids

  scaling_config {
    desired_size = var.desired_capacity
    max_size     = var.desired_capacity + 2
    min_size     = 1
  }

  instance_types = [var.node_instance_type]
}
""",

    "modules/rds/variables.tf": """variable "db_name" { type = string }
variable "instance_class" { type = string }
variable "vpc_id" { type = string }
variable "subnet_ids" { type = list(string) }""",
    "modules/rds/main.tf": """resource "aws_db_subnet_group" "main" {
  name       = "${var.db_name}-subnet-group"
  subnet_ids = var.subnet_ids
}

resource "aws_db_instance" "postgres" {
  identifier           = var.db_name
  engine               = "postgres"
  engine_version       = "14.7"
  instance_class       = var.instance_class
  allocated_storage    = 500
  db_subnet_group_name = aws_db_subnet_group.main.name
  skip_final_snapshot  = true
}""",

    "modules/observability/main.tf": """resource "aws_grafana_workspace" "ops" {
  name                     = "sre-observability"
  account_access_type      = "CURRENT_ACCOUNT"
  authentication_providers = ["AWS_SSO"]
  permission_type          = "SERVICE_MANAGED"
}""",

    "environments/prod/variables.tf": """variable "aws_region" {
  default = "us-east-1"
}""",
    "environments/prod/main.tf": """module "vpc" {
  source      = "../../modules/vpc"
  environment = "prod"
  vpc_cidr    = "10.0.0.0/16"
}

module "eks_cluster" {
  source             = "../../modules/eks"
  cluster_name       = "prod-eks-01"
  vpc_id             = module.vpc.vpc_id
  subnet_ids         = module.vpc.private_subnets
  
  # DRIFT INJECTED: This is severely overprovisioned for the current traffic load
  node_instance_type = "m5.4xlarge"
  desired_capacity   = 10
}

module "observability" {
  source = "../../modules/observability"
}""",
    "environments/prod/rds.tf": """module "rds_primary" {
  source         = "../../modules/rds"
  db_name        = "prod-postgres-main"
  vpc_id         = module.vpc.vpc_id
  subnet_ids     = module.vpc.private_subnets
  
  # DRIFT INJECTED: Overprovisioned DB instance
  instance_class = "db.r5.12xlarge"
}""",

    "environments/dev/main.tf": """module "vpc" {
  source      = "../../modules/vpc"
  environment = "dev"
  vpc_cidr    = "10.1.0.0/16"
}

module "eks_cluster" {
  source             = "../../modules/eks"
  cluster_name       = "dev-eks-01"
  vpc_id             = module.vpc.vpc_id
  subnet_ids         = module.vpc.private_subnets
  
  node_instance_type = "t3.medium"
  desired_capacity   = 2
}"""
}

def generate():
    for filepath, content in STRUCTURE.items():
        full_path = os.path.join(BASE_DIR, filepath)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, "w") as f:
            f.write(content)
    print(f"✅ Generated {len(STRUCTURE)} enterprise Terraform files in {BASE_DIR}")

if __name__ == "__main__":
    generate()
